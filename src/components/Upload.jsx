import React, { useState } from 'react';
import { parseFile, getAvailableYears, filterBooksByYear } from '../utils/parseData';
import { calculateStats } from '../utils/calculateStats';

const Upload = ({ onComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [allBooks, setAllBooks] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);

    const handleFile = async (file) => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const books = await parseFile(file);

            if (books.length === 0) {
                throw new Error('No books found in file. Please check your export.');
            }

            // Get available years
            const years = getAvailableYears(books);

            if (years.length === 0) {
                throw new Error('No books with "Date Read" found. Make sure your export includes read books with dates.');
            }

            setAllBooks(books);
            setAvailableYears(years);
            setSelectedYear(years[0]); // Default to most recent year
            setUploading(false);
        } catch (err) {
            setError(err.message);
            setUploading(false);
        }
    };

    const handleYearSelection = (year) => {
        const booksForYear = filterBooksByYear(allBooks, year);
        const stats = calculateStats(booksForYear, userName || 'Reader', year);
        onComplete(stats, allBooks, availableYears);
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="upload-page">
            <div className="upload-content">
                <h2 className="upload-title">Upload Your Reading Data</h2>

                {!allBooks ? (
                    <>
                        <div className="name-input-section">
                            <label htmlFor="userName">Your Name (optional)</label>
                            <input
                                id="userName"
                                type="text"
                                placeholder="Enter your name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="name-input"
                            />
                        </div>

                        <div
                            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="drop-zone-content">
                                <div className="upload-icon">📚</div>
                                <p className="drop-text">
                                    {uploading ? 'Processing...' : 'Drag and drop your file here'}
                                </p>
                                <p className="drop-subtext">or</p>
                                <label htmlFor="file-upload" className="file-upload-label">
                                    Browse Files
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileInput}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                />
                                <p className="file-types">Accepts CSV or Excel files</p>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        <div className="upload-tips">
                            <h3>How it works:</h3>
                            <ol>
                                <li><a href="https://www.goodreads.com/review/import">Export your Goodreads library (Select Export Library, then download the file)</a></li>
                                <li>Upload your CSV or Excel file</li>
                                <li>Get your personalized Reading Wrapped!</li>
                            </ol>
                        </div>
                    </>
                ) : (
                    <div className="year-selection">
                        <h3 className="year-selection-title">Select a Year</h3>
                        <p className="year-selection-subtitle">
                            Choose which year's reading you'd like to see
                        </p>

                        <div className="year-grid">
                            {availableYears.map(year => {
                                const bookCount = filterBooksByYear(allBooks, year).length;
                                return (
                                    <button
                                        key={year}
                                        className={`year-card ${selectedYear === year ? 'selected' : ''}`}
                                        onClick={() => setSelectedYear(year)}
                                    >
                                        <div className="year-number">{year}</div>
                                        <div className="year-book-count">{bookCount} books</div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className="cta-button"
                            onClick={() => handleYearSelection(selectedYear)}
                            disabled={!selectedYear}
                            style={{ marginTop: '2rem' }}
                        >
                            Generate {selectedYear} Wrapped
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;