import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/common/MovieCard';
import { useUserMovies } from '@/hooks/useUserMovies';
import { useNavigate } from 'react-router-dom';
import { formatWatchTime } from '@/utils/timeUtils';
import './styles.css';

const Profile = () => {
    const { currentUser } = useAuth();
    const { watchlist, continueWatching, totalWatchTime } = useUserMovies();
    const navigate = useNavigate();
    // Get backdrop from the first watchlist item that has one
    const heroBackdrop = watchlist.find(m => m.backdrop_path)?.backdrop_path;

    return (
        <div className="page-wrapper">
            <Header />

            <main className="profile-main fade-in-up">
                {/* Hero section */}
                <div className="profile-hero">
                    <div
                        className="profile-hero-bg"
                        style={heroBackdrop ? { backgroundImage: `url(https://image.tmdb.org/t/p/original${heroBackdrop})` } : {}}
                    >
                        <div className="profile-hero-overlay"></div>
                    </div>

                    <div className="profile-hero-content">
                        <div className="hub-account-card">
                            <div className="hub-avatar-col">
                                <div className="hub-avatar-wrapper">
                                    <img
                                        src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.email}&background=random`}
                                        alt="Profile"
                                        className="hub-avatar"
                                    />
                                </div>
                                <div className="hub-greeting">
                                    <h1>Hi, <span className="hub-name">{currentUser?.displayName?.split(' ')[0] || 'User'}</span></h1>
                                    <p>Welcome back to your hub</p>
                                </div>
                            </div>
                            <div className="hub-stats-col">
                                <div className="hub-stat-item">
                                    <span className="hub-stat-label">TIME WATCHED</span>
                                    <span className="hub-stat-value">{formatWatchTime((totalWatchTime || 0) / 60)}</span>
                                </div>
                                <div className="hub-stat-divider"></div>
                                <div className="hub-stat-item">
                                    <span className="hub-stat-label">JOINED</span>
                                    <span className="hub-stat-value">{currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 2026'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="profile-dashboard">
                    {/* Continue Watching Section */}
                    <section id="continue-watching" className="dashboard-section">
                        <div className="dashboard-header">
                            <h2>Continue Watching</h2>
                        </div>
                        {continueWatching.length === 0 ? (
                            <div className="dashboard-empty">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <p>You haven't started watching any movies yet.</p>
                            </div>
                        ) : (
                            <div className="dashboard-grid">
                                {continueWatching.map((movie, index) => (
                                    <MovieCard
                                        key={`cw-${movie.id}`}
                                        movie={movie}
                                        onClick={(m) => navigate(`/watch/${m.id}`)}
                                        animationDelay={`${index * 40}ms`}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Watchlist Section */}
                    <section id="watchlist" className="dashboard-section">
                        <div className="dashboard-header">
                            <h2>My Watchlist</h2>
                            <span className="dashboard-count">{watchlist.length} ITEMS</span>
                        </div>
                        {watchlist.length === 0 ? (
                            <div className="dashboard-empty">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <p>Discover movies and add them here!</p>
                            </div>
                        ) : (
                            <div className="dashboard-grid">
                                {watchlist.map((movie, index) => (
                                    <MovieCard
                                        key={`wl-${movie.id}`}
                                        movie={movie}
                                        onClick={(m) => navigate(`/watch/${m.id}`)}
                                        animationDelay={`${index * 40}ms`}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
