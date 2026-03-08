import React from 'react';
import { Flame } from 'lucide-react';
import { useUserMoviesContext } from '@/context/UserMoviesContext';
import './styles.css';

const StreakCounter = ({ className = "" }) => {
    const { streakData, loading } = useUserMoviesContext();

    if (loading || !streakData.current) return null;

    const isElite = streakData.current >= 7;
    const streakText = isElite ? `${streakData.current} Day Elite Streak!` : `${streakData.current} Day Streak`;

    return (
        <div
            className={`streak-counter ${isElite ? 'streak-elite' : 'streak-regular'} ${className}`}
            title={streakText}
        >
            <div className="streak-icon-wrapper">
                <Flame
                    size={20}
                    className={`streak-icon ${isElite ? 'flame-purple' : 'flame-orange'}`}
                    fill="currentColor"
                />
                <div className="streak-glow"></div>
            </div>
            <span className="streak-number">{streakData.current}</span>
        </div>
    );
};

export default StreakCounter;
