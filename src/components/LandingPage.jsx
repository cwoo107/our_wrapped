import React from 'react';

const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="landing-page">
            <div className="landing-content">
                <h1 className="landing-title">
                    READING<br/>WRAPPED<br/>2025
                </h1>
                <p className="landing-subtitle">
                    Your year in books, reimagined
                </p>
                <p className="landing-description">
                    Create your personalized reading recap — Spotify Wrapped style for books!
                </p>

                <button className="cta-button" onClick={onGetStarted}>
                    Get Started
                </button>

                <div className="instructions">
                    <h3>How it works:</h3>
                    <ol>
                        <li>Export your Goodreads library (Library → Import/Export → Export Library)</li>
                        <li>Upload your CSV or Excel file</li>
                        <li>Get your personalized Reading Wrapped!</li>
                    </ol>
                </div>

                <div className="note">
                    <p>✨ Your data stays private — everything is processed locally in your browser</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;