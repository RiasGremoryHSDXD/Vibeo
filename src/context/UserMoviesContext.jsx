import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { triggerError } from '@/components/common/ErrorToast';

const UserMoviesContext = createContext();

export const getLocalISOString = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const UserMoviesProvider = ({ children }) => {
    const { currentUser, completeOnboarding } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [totalWatchTime, setTotalWatchTime] = useState(0);
    const [streakData, setStreakData] = useState({ current: 0, highest: 0, lastActiveDate: '' });
    const [activityPoints, setActivityPoints] = useState({});
    const [loading, setLoading] = useState(true);
    const streakCheckedRef = useRef(false);

    const callDjangoUpdate = async (updates) => {
        if (!currentUser) return false;
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch("http://127.0.0.1:8000/api/user/update/", {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updates)
            });
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    // Replace the real-time listener with a start-up fetch
    useEffect(() => {
        if (!currentUser) {
            setWatchlist([]);
            setContinueWatching([]);
            setTotalWatchTime(0);
            setStreakData({ current: 0, highest: 0, lastActiveDate: '' });
            setActivityPoints({});
            setLoading(false);
            streakCheckedRef.current = false;
            return;
        }

        streakCheckedRef.current = false;
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const token = await currentUser.getIdToken();
                const res = await fetch("http://127.0.0.1:8000/api/user/data/", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (res.ok && isMounted) {
                    const data = await res.json();
                    
                    const processedWatchlist = (data.watchlist || []).map(m => ({
                        ...m, media_type: m.media_type || (m.name ? 'tv' : 'movie')
                    }));
                    setWatchlist(processedWatchlist);

                    const processedCW = (data.continueWatching || []).map(m => ({
                        ...m, media_type: m.media_type || (m.name ? 'tv' : 'movie')
                    }));
                    setContinueWatching(processedCW);
                    setFavoriteMovies(data.favoriteMovies || []);
                    setTotalWatchTime(data.totalWatchTime || 0);

                    const currentStreak = data.streak || { current: 0, highest: 0, lastActiveDate: '' };
                    setStreakData(currentStreak);
                    setActivityPoints(data.activityPoints || {});

                    // Streak Calculation
                    const today = getLocalISOString();
                    if (currentStreak.lastActiveDate !== today && !streakCheckedRef.current) {
                        streakCheckedRef.current = true;
                        
                        let newStreak = 1;
                        let newHighest = currentStreak.highest || 0;

                        if (currentStreak.lastActiveDate) {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            if (currentStreak.lastActiveDate === getLocalISOString(yesterday)) {
                                newStreak = (currentStreak.current || 0) + 1;
                            }
                        }

                        if (newStreak > newHighest) newHighest = newStreak;

                        const streakObj = { current: newStreak, highest: newHighest, lastActiveDate: today };
                        setStreakData(streakObj);
                        await callDjangoUpdate({ streak: streakObj });
                        recordActivity(1, true); // Avoid loop by passing skipUpdate parameter
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (isMounted) triggerError("Could not sync your library. Please check your connection.");
            }
            if (isMounted) setLoading(false);
        };

        fetchData();
        return () => { isMounted = false; };
    }, [currentUser]);

    const addToWatchlist = async (movie, status = 'planning') => {
        if (!currentUser) return false;
        
        if (watchlist.some(m => m.id === Number(movie.id))) {
            return await updateWatchlistStatus(movie, status);
        }

        const movieWithStatus = {
            ...movie,
            id: Number(movie.id),
            status,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            genre_ids: movie.genre_ids || [],
            addedAt: Date.now()
        };

        setWatchlist(prev => [...prev, movieWithStatus]);
        return await callDjangoUpdate({ watchlist: { _fire_array_union: [movieWithStatus] } });
    };

    const removeFromWatchlist = async (movie) => {
        if (!currentUser) return false;
        
        const exactMovie = watchlist.find(m => m.id === Number(movie.id));
        if (!exactMovie) return false;
        
        setWatchlist(prev => prev.filter(m => m.id !== Number(movie.id)));
        return await callDjangoUpdate({ watchlist: { _fire_array_remove: [exactMovie] } });
    };

    const isWatchlisted = (movieId) => watchlist.some(m => m.id === Number(movieId));

    const getWatchlistStatus = (movieId) => {
        const movie = watchlist.find(m => m.id === Number(movieId));
        return movie ? movie.status : null;
    };

    const updateWatchlistStatus = async (movie, newStatus) => {
        if (!currentUser) return false;
        
        const movieIndex = watchlist.findIndex(m => m.id === Number(movie.id));
        if (movieIndex === -1) return await addToWatchlist(movie, newStatus);
        if (watchlist[movieIndex].status === newStatus) return true;

        const newList = [...watchlist];
        newList[movieIndex] = { ...newList[movieIndex], status: newStatus, updatedAt: Date.now() };

        setWatchlist(newList);
        await callDjangoUpdate({ watchlist: newList });

        if (newStatus === 'completed') recordActivity(3);
        else recordActivity(1);

        return true;
    };

    const toggleWatchlist = async (movie) => {
        if (!movie) return false;
        const simpleMovie = {
            id: movie.id, title: movie.title, name: movie.name,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            poster_path: movie.poster_path, vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            genre_ids: movie.genre_ids || []
        };

        if (isWatchlisted(movie.id)) {
            return await removeFromWatchlist(simpleMovie);
        } else {
            return await addToWatchlist(simpleMovie, 'planning');
        }
    };

    const addToContinueWatching = async (movie) => {
        if (!currentUser || !movie) return;
        const simpleMovie = {
            id: movie.id, title: movie.title, name: movie.name,
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            poster_path: movie.poster_path, vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            timestamp: Date.now()
        };

        let currentList = continueWatching.filter(m => m.id !== movie.id);
        currentList.unshift(simpleMovie);
        if (currentList.length > 20) currentList = currentList.slice(0, 20);

        setContinueWatching(currentList);
        await callDjangoUpdate({ continueWatching: currentList });
    };

    const removeFromContinueWatching = async (movieId) => {
        if (!currentUser) return false;
        const newList = continueWatching.filter(m => m.id !== Number(movieId));
        setContinueWatching(newList);
        return await callDjangoUpdate({ continueWatching: newList });
    };

    const addWatchTime = async (seconds) => {
        if (!currentUser || typeof seconds !== 'number' || seconds <= 0) return;
        setTotalWatchTime(prev => prev + seconds);
        await callDjangoUpdate({ totalWatchTime: { _fire_increment: seconds } });
    };

    const recordActivity = async (points, skipUpdate = false) => {
        if (!currentUser) return;
        const today = getLocalISOString();
        setActivityPoints(prev => ({
            ...prev,
            [today]: (prev[today] || 0) + points
        }));
        
        if (!skipUpdate) {
            await callDjangoUpdate({
                [`activityPoints.${today}`]: { _fire_increment: points }
            });
        }
    };

    const clearWatchHistory = async () => {
        if (!currentUser) return false;
        setContinueWatching([]);
        return await callDjangoUpdate({ continueWatching: [] });
    };

    const clearWatchlist = async () => {
        if (!currentUser) return false;
        setWatchlist([]);
        return await callDjangoUpdate({ watchlist: [] });
    };

    const toggleFavorite = async (movie) => {
        if (!currentUser) return false;
        const isFav = favoriteMovies.some(m => m.id === movie.id);
        const exactMovie = favoriteMovies.find(m => m.id === movie.id);

        if (isFav) {
            setFavoriteMovies(prev => prev.filter(m => m.id !== movie.id));
            return await callDjangoUpdate({ favoriteMovies: { _fire_array_remove: [exactMovie] } });
        } else {
            setFavoriteMovies(prev => [...prev, movie]);
            return await callDjangoUpdate({ favoriteMovies: { _fire_array_union: [movie] } });
        }
    };

    const saveOnboardingData = async ({ favorites = [], seen = [] }) => {
        if (!currentUser) return;
        
        const newWatchlistItems = seen.map(movie => ({
            ...movie,
            id: Number(movie.id),
            status: 'completed',
            media_type: movie.media_type || (movie.name ? 'tv' : 'movie'),
            genre_ids: movie.genre_ids || [],
            addedAt: Date.now(),
            updatedAt: Date.now()
        }));

        const existingIds = new Set(watchlist.map(m => m.id));
        const uniqueNewItems = newWatchlistItems.filter(m => !existingIds.has(m.id));
        const updatedWatchlist = [...watchlist, ...uniqueNewItems];

        // Optimistic UI
        setFavoriteMovies(favorites);
        setWatchlist(updatedWatchlist);
        if (uniqueNewItems.length > 0) recordActivity(uniqueNewItems.length * 3);

        const success = await callDjangoUpdate({
            onboarded: true, // Used by the previous SQLite logic, but now writing to Firestore
            favoriteMovies: favorites,
            watchlist: updatedWatchlist,
            email: currentUser.email,
            displayName: currentUser.displayName,
            lastActiveDate: getLocalISOString()
        });

        // Inform Django to update onboarded (legacy fallback endpoint)
        try {
            const token = await currentUser.getIdToken();
            await fetch("http://127.0.0.1:8000/api/auth/onboard/", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (e) {}

        if (completeOnboarding) completeOnboarding();
        return success;
    };

    const value = {
        watchlist, continueWatching, favoriteMovies, totalWatchTime, streakData, activityPoints,
        loading, isWatchlisted, getWatchlistStatus, updateWatchlistStatus, toggleWatchlist,
        addToContinueWatching, addWatchTime, removeFromContinueWatching, clearWatchHistory,
        clearWatchlist, recordActivity, toggleFavorite, saveOnboardingData
    };

    return <UserMoviesContext.Provider value={value}>{children}</UserMoviesContext.Provider>;
};

export const useUserMoviesContext = () => {
    const context = useContext(UserMoviesContext);
    if (!context) throw new Error('useUserMoviesContext must be used within a UserMoviesProvider');
    return context;
};
