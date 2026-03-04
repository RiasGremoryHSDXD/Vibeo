import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MovieCard from '@/components/common/MovieCard';
import { useBrowseMovies, SORT_OPTIONS, GENRE_MAP } from '@/hooks/useBrowseMovies';
import { fetchTMDB } from '@/api/tmdbClient';
import { TMDB_BACKDROP_BASE, TMDB_IMAGE_BASE } from '@/config/constants';
import './styles.css';

/* ── Custom Dropdown ────────────────────────────────────────── */
const FilterDropdown = ({ options, value, onChange, labelKey = 'label', valueKey = 'id' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = options.find(o => o[valueKey] === value) || options[0];

    // Close on click outside
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="filter-dropdown" ref={ref}>
            <button
                className={`filter-dropdown__trigger ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <span>{selected[labelKey]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </button>

            {open && (
                <div className="filter-dropdown__menu">
                    {options.map(opt => (
                        <button
                            key={opt[valueKey]}
                            className={`filter-dropdown__item ${opt[valueKey] === value ? 'active' : ''}`}
                            onClick={() => { onChange(opt[valueKey]); setOpen(false); }}
                        >
                            {opt[labelKey]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════ */

const Browse = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    // ── Filter state ──────────────────────────────────────────
    const mapCategoryToSort = (cat) => {
        const map = {
            trending: 'trending',
            'top-rated': 'top_rated',
            'now-playing': 'now_playing',
            'new-release': 'now_playing',
            popular: 'popular',
            upcoming: 'upcoming',
        };
        return map[cat] || 'popular';
    };

    const [sortBy, setSortBy] = useState(mapCategoryToSort(categoryId));
    const [genreId, setGenreId] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [movieDetails, setMovieDetails] = useState(null);

    // Sync sort from category param
    useEffect(() => {
        setSortBy(mapCategoryToSort(categoryId));
    }, [categoryId]);

    // Infinite scroll data
    const {
        movies, loading, isFetchingNextPage, fetchNextPage, hasNextPage, title
    } = useBrowseMovies(sortBy, genreId);

    // ── Infinite scroll observer ──────────────────────────────
    const observerRef = useRef(null);
    const loadMoreRef = useCallback((node) => {
        if (loading || isFetchingNextPage) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        }, { threshold: 0.1 });

        if (node) observerRef.current.observe(node);
    }, [loading, isFetchingNextPage, hasNextPage, fetchNextPage]);

    // Auto-select first movie when results change
    useEffect(() => {
        if (movies.length > 0 && !selectedMovie) {
            setSelectedMovie(movies[0]);
        }
    }, [movies]);

    // Fetch detail panel data when selected movie changes
    useEffect(() => {
        if (!selectedMovie) {
            setMovieDetails(null);
            return;
        }

        let isMounted = true;

        const fetchDetails = async () => {
            try {
                const [details, credits] = await Promise.all([
                    fetchTMDB(`/movie/${selectedMovie.id}`),
                    fetchTMDB(`/movie/${selectedMovie.id}/credits`),
                ]);
                if (isMounted) {
                    setMovieDetails({
                        ...details,
                        cast: (credits?.cast || []).slice(0, 5),
                    });
                }
            } catch (err) {
                console.error('Error fetching movie details:', err);
            }
        };

        fetchDetails();
        return () => { isMounted = false; };
    }, [selectedMovie?.id]);

    // ── Handlers ──────────────────────────────────────────────
    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setSelectedMovie(null);
    };

    const handleGenreChange = (newGenre) => {
        setGenreId(newGenre);
        setSelectedMovie(null);
    };

    const handleCardClick = (movie) => {
        setSelectedMovie(movie);
    };

    // ── Detail panel helper ───────────────────────────────────
    const d = movieDetails || selectedMovie;
    const backdropUrl = d?.backdrop_path ? `${TMDB_BACKDROP_BASE}${d.backdrop_path}` : null;

    return (
        <div className="page-wrapper">
            <Header />

            <main className="browse-main">
                {/* ── Filter Bar ── */}
                <div className="browse-filter-bar">
                    <div className="filter-group">
                        <FilterDropdown
                            options={SORT_OPTIONS}
                            value={sortBy}
                            onChange={handleSortChange}
                        />
                        <FilterDropdown
                            options={GENRE_MAP}
                            value={genreId}
                            onChange={handleGenreChange}
                        />
                    </div>
                </div>

                {/* ── Two-Column Layout ── */}
                <div className="browse-layout">
                    {/* ── Left: Movie Grid ── */}
                    <div className="browse-grid-container">
                        {loading ? (
                            <div className="loading-center" style={{ padding: '6rem 0' }}>
                                <div className="spinner" />
                                <p>Loading movies…</p>
                            </div>
                        ) : movies.length > 0 ? (
                            <div className="browse-grid">
                                {movies.map((movie, index) => (
                                    <div
                                        className={`browse-card-wrap ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
                                        key={`${movie.id}-${index}`}
                                        onClick={() => handleCardClick(movie)}
                                    >
                                        <MovieCard
                                            movie={movie}
                                            onClick={() => handleCardClick(movie)}
                                            animationDelay={`${(index % 20) * 30}ms`}
                                        />
                                    </div>
                                ))}

                                {/* ── Infinite scroll trigger ── */}
                                <div ref={loadMoreRef} className="browse-load-trigger" />
                            </div>
                        ) : (
                            <div className="browse-empty">
                                <h2>No movies found</h2>
                                <p>Try adjusting your filters.</p>
                            </div>
                        )}

                        {/* Loading more indicator */}
                        {isFetchingNextPage && (
                            <div className="browse-loading-more">
                                <div className="spinner" />
                                <span>Loading more…</span>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Detail Panel ── */}
                    {d && (
                        <aside className="browse-detail-panel">
                            <div className="detail-card">
                                {backdropUrl && (
                                    <div className="detail-backdrop">
                                        <img src={backdropUrl} alt="" />
                                        <div className="detail-backdrop-fade" />
                                    </div>
                                )}

                                <div className="detail-body">
                                    <h2 className="detail-title">{d.title || d.name}</h2>

                                    <div className="detail-meta">
                                        {d.release_date && (
                                            <span className="detail-year">{d.release_date.substring(0, 4)}</span>
                                        )}
                                        {(movieDetails?.runtime || 0) > 0 && (
                                            <span className="detail-runtime">{movieDetails.runtime} min</span>
                                        )}
                                        {d.vote_average > 0 && (
                                            <span className="detail-rating">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
                                                {Number(d.vote_average).toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    {d.overview && (
                                        <p className="detail-overview">{d.overview}</p>
                                    )}

                                    {movieDetails?.genres && movieDetails.genres.length > 0 && (
                                        <div className="detail-section">
                                            <span className="detail-label">GENRES</span>
                                            <div className="detail-chips">
                                                {movieDetails.genres.map(g => (
                                                    <span className="detail-chip" key={g.id}>{g.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {movieDetails?.cast && movieDetails.cast.length > 0 && (
                                        <div className="detail-section">
                                            <span className="detail-label">CAST</span>
                                            <div className="detail-chips">
                                                {movieDetails.cast.map(c => (
                                                    <span className="detail-chip" key={c.id}>{c.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="detail-actions">
                                        <button
                                            className="detail-btn-watch"
                                            onClick={() => navigate(`/watch/${d.id}`)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                                            Watch Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Browse;
