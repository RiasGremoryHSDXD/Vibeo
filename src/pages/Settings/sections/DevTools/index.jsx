import React, { useState } from 'react';
import { Terminal, RotateCcw, Trash2, Power } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserMoviesContext } from '@/context/UserMoviesContext';
import { triggerError } from '@/components/common/ErrorToast';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import './styles.css';

const DevToolsSection = () => {
    const { currentUser } = useAuth();
    const {
        clearWatchlist,
        clearWatchHistory,
        activityPoints
    } = useUserMoviesContext();

    const [isResetting, setIsResetting] = useState(false);

    // Function to simulate clicking "Reset Onboarding"
    const handleResetOnboarding = async () => {
        if (!currentUser) return;
        if (!window.confirm("Are you sure you want to reset your onboarding status? This will wipe your favorite movies and force you to re-do the wizard on next reload.")) return;

        setIsResetting(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                onboarded: false,
                favoriteMovies: [] // Clear favorites to force fresh selection
            });
            triggerError('Onboarding reset! Reloading...', 'success');

            // Reload the page after a short delay to trigger the AuthContext & App.jsx routing logic
            setTimeout(() => {
                window.location.href = '/onboarding';
            }, 1000);

        } catch (error) {
            console.error("Error resetting onboarding:", error);
            triggerError('Failed to reset onboarding', 'error');
            setIsResetting(false);
        }
    };

    const handleClearLibrary = async () => {
        if (!window.confirm("WARNING: This will clear your entire Watchlist and Watch History. Proceed?")) return;
        const successList = await clearWatchlist();
        const successHistory = await clearWatchHistory();

        if (successList && successHistory) {
            triggerError('Library cleared successfully', 'success');
        } else {
            triggerError('Failed to clear some library data', 'error');
        }
    };

    const handleResetActivity = async () => {
        if (!currentUser) return;
        if (!window.confirm("Reset all activity points and streaks?")) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                activityPoints: {},
                streak: { current: 0, highest: 0, lastActiveDate: '' },
                totalWatchTime: 0
            });
            triggerError('Activity data reset', 'success');
        } catch (error) {
            console.error("Error resetting activity:", error);
            triggerError('Failed to reset activity', 'error');
        }
    };

    return (
        <div className="settings-section devtools-section">
            <div className="section-header">
                <h2>Developer Mode</h2>
                <p>Dangerous tools for testing and debugging. Use with caution.</p>
            </div>

            <div className="settings-card dev-card-danger">
                <div className="settings-row">
                    <div className="settings-info">
                        <h3>Reset Onboarding</h3>
                        <p>Sets `onboarded: false` and clears favorites to test the wizard flow again.</p>
                    </div>
                    <div className="settings-action">
                        <button
                            className="btn-dev-action"
                            onClick={handleResetOnboarding}
                            disabled={isResetting}
                        >
                            <RotateCcw size={16} />
                            {isResetting ? 'Resetting...' : 'Reset Flow'}
                        </button>
                    </div>
                </div>

                <div className="settings-row">
                    <div className="settings-info">
                        <h3>Clear Entire Library</h3>
                        <p>Wipes both Watchlist and Watch History (Continue Watching) arrays.</p>
                    </div>
                    <div className="settings-action">
                        <button className="btn-dev-action btn-danger" onClick={handleClearLibrary}>
                            <Trash2 size={16} />
                            Clear Data
                        </button>
                    </div>
                </div>

                <div className="settings-row">
                    <div className="settings-info">
                        <h3>Reset Activity & Gamification</h3>
                        <p>Resets Watch Time, Streaks, and daily Activity Points to zero.</p>
                    </div>
                    <div className="settings-action">
                        <button className="btn-dev-action btn-danger" onClick={handleResetActivity}>
                            <Power size={16} />
                            Reset Stats
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-card dev-card-info">
                <h3>Debug Information</h3>
                <pre className="debug-pre">
                    {JSON.stringify({
                        uid: currentUser?.uid,
                        email: currentUser?.email,
                        pointsCount: Object.keys(activityPoints || {}).length,
                        environment: import.meta.env.MODE
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default DevToolsSection;
