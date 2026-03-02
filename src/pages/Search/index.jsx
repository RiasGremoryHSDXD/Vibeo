import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/common/MovieCard';
import { fetchTMDB } from '@/api/tmdbClient';
import './styles.css';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const performSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Search across movies and tv shows
                const data = await fetchTMDB('/search/multi', {
                    query: encodeURIComponent(query),
                    include_adult: false,
                    page: 1
                });

                if (isMounted && data && data.results) {
                    // Filter out people, just keep movies and tv
                    const mediaResults = data.results.filter(
                        item => item.media_type === 'movie' || item.media_type === 'tv'
                    );
                    setResults(mediaResults);
                }
            } catch (error) {
                console.error("Search failed:", error);
                if (isMounted) setResults([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        performSearch();

        return () => {
            isMounted = false;
        };
    }, [query]);

    return (
        <div className="page-wrapper">
            <Header />

            <main className="search-main fade-in-up">
                <div className="search-header">
                    <h1 className="search-title">
                        {query ? `Search Results for "${query}"` : 'Search Movies & Shows'}
                    </h1>
                </div>

                {loading ? (
                    <div className="loading-center" style={{ padding: '8rem 0' }}>
                        <div className="spinner" />
                        <p>Searching for "{query}"...</p>
                    </div>
                ) : (
                    <>
                        {results.length > 0 ? (
                            <div className="search-grid">
                                {results.map((item, index) => (
                                    <div className="search-card-wrap" key={`${item.id}-${index}`}>
                                        <MovieCard
                                            movie={item}
                                            onClick={(m) => navigate(`/watch/${m.id}`)}
                                            animationDelay={`${(index % 20) * 30}ms`}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="search-empty">
                                {query ? (
                                    <>
                                        <h2>No results found for "{query}"</h2>
                                        <p>Try searching for different keywords or titles.</p>
                                    </>
                                ) : (
                                    <h2>Enter a query to start searching</h2>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Search;
