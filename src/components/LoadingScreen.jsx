import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <div className="loading-brand">
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="loading-logo"
                >
                    <rect width="32" height="32" rx="8" fill="#1a1a1a" />
                    <path
                        d="M10 22L16 10L22 22H10Z"
                        fill="#faf9f7"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="loading-name">My-GPT</span>
            </div>
            <div className="loading-dots">
                <span className="dot" style={{ animationDelay: '0ms' }} />
                <span className="dot" style={{ animationDelay: '160ms' }} />
                <span className="dot" style={{ animationDelay: '320ms' }} />
            </div>
        </div>
    );
};

export default LoadingScreen;
