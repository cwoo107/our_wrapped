import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Upload from './components/Upload';
import Wrapped from './components/Wrapped';
import './App.css';

function App() {
    const [stage, setStage] = useState('landing'); // 'landing', 'upload', 'wrapped'
    const [stats, setStats] = useState(null);
    const [allBooks, setAllBooks] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);

    const handleGetStarted = () => {
        setStage('upload');
    };

    const handleUploadComplete = (calculatedStats, books, years) => {
        setStats(calculatedStats);
        setAllBooks(books);
        setAvailableYears(years);
        setStage('wrapped');
    };

    const handleReset = () => {
        setStage('landing');
        setStats(null);
        setAllBooks(null);
        setAvailableYears([]);
    };

    return (
        <div className="App">
            {stage === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
            {stage === 'upload' && <Upload onComplete={handleUploadComplete} />}
            {stage === 'wrapped' && stats && (
                <>
                    <Wrapped
                        stats={stats}
                        allBooks={allBooks}
                        availableYears={availableYears}
                    />
                    <button className="reset-btn" onClick={handleReset}>
                        Create Another
                    </button>
                </>
            )}
        </div>
    );
}

export default App;