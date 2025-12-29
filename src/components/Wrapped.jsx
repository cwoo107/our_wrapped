import React, { useEffect, useState } from 'react';
import { filterBooksByYear } from '../utils/parseData';
import { calculateStats } from '../utils/calculateStats';

const Wrapped = ({ stats: initialStats, allBooks, availableYears, colorScheme = 'default' }) => {
    const [stats, setStats] = useState(initialStats);
    const [selectedYear, setSelectedYear] = useState(initialStats.year);
    const [showYearSelector, setShowYearSelector] = useState(false);

    useEffect(() => {
        // Smooth scroll behavior
        const container = document.querySelector('.wrapped-container');
        if (container) {
            container.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [stats]);

    const handleYearChange = (year) => {
        const booksForYear = filterBooksByYear(allBooks, year);
        const newStats = calculateStats(booksForYear, stats.name, year);
        setStats(newStats);
        setSelectedYear(year);
        setShowYearSelector(false);
    };

    const colorSchemes = {
        default: {
            primary: '#FF6B35',
            secondary: '#F7931E',
            accent: '#FDC500',
            teal: '#2EC4B6',
            purple: '#6A4C93'
        },
        teal: {
            primary: '#2EC4B6',
            secondary: '#6A4C93',
            accent: '#FDC500',
            teal: '#2EC4B6',
            purple: '#6A4C93'
        },
        purple: {
            primary: '#6A4C93',
            secondary: '#9D4EDD',
            accent: '#FDC500',
            teal: '#2EC4B6',
            purple: '#6A4C93'
        }
    };

    const colors = colorSchemes[colorScheme] || colorSchemes.default;

    const downloadWrapped = () => {
        const htmlContent = document.querySelector('.wrapped-container').innerHTML;
        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${stats.name}'s ${stats.year} Reading Wrapped</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Karla:wght@400;700&display=swap" rel="stylesheet">
  <style>${document.querySelector('style').innerHTML}</style>
</head>
<body>
  <div class="wrapped-container">${htmlContent}</div>
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${stats.name.replace(/\s+/g, '_')}_${stats.year}_Reading_Wrapped.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <style>{`
        .wrapped-container {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          height: 100vh;
          --primary: ${colors.primary};
          --secondary: ${colors.secondary};
          --accent: ${colors.accent};
          --teal: ${colors.teal};
          --purple: ${colors.purple};
        }
      `}</style>

            {availableYears && availableYears.length > 1 && (
                <button
                    className="year-selector-btn"
                    onClick={() => setShowYearSelector(!showYearSelector)}
                >
                    {selectedYear} ▼
                </button>
            )}

            {showYearSelector && (
                <div className="year-selector-dropdown">
                    {availableYears.map(year => (
                        <button
                            key={year}
                            className={`year-option ${year === selectedYear ? 'active' : ''}`}
                            onClick={() => handleYearChange(year)}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}

            <button className="download-btn" onClick={downloadWrapped}>
                Download Your Wrapped
            </button>

            <div className="wrapped-container">
                {/* Slide 1: Title */}
                <div className="slide">
                    <div className="slide-content" style={{ textAlign: 'center' }}>
                        <h1>{stats.name.toUpperCase()}'S<br/>{stats.year}<br/>READING<br/>WRAPPED</h1>
                        <p className="subtitle">Your year in books, reimagined</p>
                        <div className="scroll-hint">↓ Scroll to explore</div>
                    </div>
                </div>

                {/* Slide 2: Overview */}
                <div className="slide">
                    <div className="slide-content">
                        <h2>Your Year in Books</h2>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem', flexWrap: 'wrap', margin: '2rem 0' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="big-number">{stats.totalBooks}</div>
                                <h3>Books Read</h3>
                            </div>
                            {stats.totalPages > 0 && (
                                <div style={{ textAlign: 'center' }}>
                                    <div className="med-number">{stats.totalPages.toLocaleString()}</div>
                                    <h3>Pages Read</h3>
                                </div>
                            )}
                        </div>

                        <div className="stat-grid">
                            {stats.avgRating && (
                                <div className="stat-card">
                                    <div className="stat-label">Average Rating</div>
                                    <div className="stat-value">{stats.avgRating} ⭐</div>
                                    <div className="stat-desc">
                                        {stats.avgRating >= 4.5 ? 'Exceptional taste!' :
                                            stats.avgRating >= 4.0 ? 'You loved what you read' :
                                                'A balanced perspective'}
                                    </div>
                                </div>
                            )}
                            {stats.fiveStarPct && (
                                <div className="stat-card">
                                    <div className="stat-label">Five-Star Books</div>
                                    <div className="stat-value">{stats.fiveStarPct}%</div>
                                    <div className="stat-desc">
                                        {stats.fiveStarPct > 50 ? 'More than half were amazing' : 'Your favorites'}
                                    </div>
                                </div>
                            )}
                            {stats.fourPlusPct && (
                                <div className="stat-card">
                                    <div className="stat-label">Four Stars or Better</div>
                                    <div className="stat-value">{stats.fourPlusPct}%</div>
                                    <div className="stat-desc">
                                        {stats.fourPlusPct > 80 ? 'Nearly everything was great' : 'Quality reading'}
                                    </div>
                                </div>
                            )}
                            {stats.totalPages > 0 && (
                                <div className="stat-card">
                                    <div className="stat-label">Average Book Length</div>
                                    <div className="stat-value">{Math.round(stats.totalPages / stats.totalBooks)}</div>
                                    <div className="stat-desc">Pages per book</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Slide 3: Rating Distribution */}
                {stats.ratingDistribution && Object.keys(stats.ratingDistribution).length > 0 && (
                    <div className="slide">
                        <div className="slide-content">
                            <h2>How You Rated</h2>
                            <p className="subtitle">Your rating breakdown</p>

                            <div className="rating-bars">
                                {[5, 4, 3, 2, 1].map(rating => {
                                    const count = stats.ratingDistribution[rating] || 0;
                                    if (count === 0) return null;
                                    const maxCount = Math.max(...Object.values(stats.ratingDistribution));
                                    const width = (count / maxCount) * 100;

                                    return (
                                        <div key={rating} className="rating-bar-item">
                                            <div className="rating-label">{'⭐'.repeat(rating)} {rating === 1 ? 'One Star' : `${rating} Stars`}</div>
                                            <div className="rating-visual">
                                                <div className="rating-fill" style={{ width: `${width}%` }}></div>
                                            </div>
                                            <div className="rating-count">{count}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {stats.ratingPersonality && (
                                <>
                                    <div className="personality-badge badge">{stats.ratingPersonality}</div>
                                    <p className="subtitle" style={{ textAlign: 'center' }}>
                                        {stats.ratingVsGoodreads > 0
                                            ? `You rate ${Math.abs(stats.ratingVsGoodreads).toFixed(2)} stars higher than Goodreads average`
                                            : stats.ratingVsGoodreads < 0
                                                ? `You rate ${Math.abs(stats.ratingVsGoodreads).toFixed(2)} stars lower than Goodreads average`
                                                : 'Your ratings align perfectly with the Goodreads community'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* NEW SLIDE: Rating Insights */}
                {stats.ratingAnalysis && stats.ratingAnalysis.ratedHigherPct !== undefined && (
                    <div className="slide">
                        <div className="slide-content">
                            <h2>Your Rating Style</h2>
                            <p className="subtitle">How you compare to the crowd</p>

                            <div className="stat-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Rate Higher</div>
                                    <div className="stat-value">{stats.ratingAnalysis.ratedHigherPct}%</div>
                                    <div className="stat-desc">{stats.ratingAnalysis.ratedHigherCount} books rated above average</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Rate Lower</div>
                                    <div className="stat-value">{stats.ratingAnalysis.ratedLowerPct}%</div>
                                    <div className="stat-desc">{stats.ratingAnalysis.ratedLowerCount} books rated below average</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Consistency</div>
                                    <div className="stat-value">{stats.ratingAnalysis.consistencyType}</div>
                                    <div className="stat-desc">Your rating pattern</div>
                                </div>
                            </div>

                            {stats.ratingAnalysis.underratedGems && stats.ratingAnalysis.underratedGems.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3>Your Hidden Gems 💎</h3>
                                    <p className="subtitle">Books you loved that others overlooked</p>
                                    <div className="book-list">
                                        {stats.ratingAnalysis.underratedGems.slice(0, 3).map((book, idx) => (
                                            <div key={idx} className="book-item">
                                                <div className="book-title">{book.title}</div>
                                                <div className="book-rating">You: ⭐⭐⭐⭐⭐ | Community: {book.avgRating.toFixed(1)} ⭐</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {stats.ratingAnalysis.mostLoved && stats.ratingAnalysis.mostLoved.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3>Your Biggest Loves ❤️</h3>
                                    <p className="subtitle">Books you rated way higher than everyone else</p>
                                    <div className="book-list">
                                        {stats.ratingAnalysis.mostLoved.map((book, idx) => (
                                            <div key={idx} className="book-item">
                                                <div className="book-title">{book.title}</div>
                                                <div className="book-rating">
                                                    You: {book.userRating} ⭐ | Community: {book.avgRating.toFixed(1)} ⭐
                                                    <span className="diff-badge positive">+{book.difference.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {stats.ratingAnalysis.harshOnPopular && (
                                <div className="personality-badge badge">🎯 Harsh on Hype</div>
                            )}
                            {stats.ratingAnalysis.championOfUnderdogs && (
                                <div className="personality-badge badge">🦸 Champion of Underdogs</div>
                            )}
                        </div>
                    </div>
                )}

                {/* NEW SLIDE: Rating Disagreements */}
                {stats.ratingAnalysis && stats.ratingAnalysis.mostCritical && stats.ratingAnalysis.mostCritical.length > 0 && (
                    <div className="slide">
                        <div className="slide-content">
                            <h2>Hot Takes 🔥</h2>
                            <p className="subtitle">Where you disagreed with the masses</p>

                            <div style={{ marginTop: '2rem' }}>
                                <h3>Books You Weren't Impressed By</h3>
                                <div className="book-list">
                                    {stats.ratingAnalysis.mostCritical.map((book, idx) => (
                                        <div key={idx} className="book-item">
                                            <div className="book-title">{book.title}</div>
                                            <div className="book-rating">
                                                You: {book.userRating} ⭐ | Community: {book.avgRating.toFixed(1)} ⭐
                                                <span className="diff-badge negative">{book.difference.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {stats.ratingAnalysis.overratedBooks && stats.ratingAnalysis.overratedBooks.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3>Overrated Classics? 🤔</h3>
                                    <p className="subtitle">Popular books that didn't work for you</p>
                                    <div className="book-list">
                                        {stats.ratingAnalysis.overratedBooks.map((book, idx) => (
                                            <div key={idx} className="book-item">
                                                <div className="book-title">{book.title}</div>
                                                <div className="book-rating">
                                                    You: {book.userRating} ⭐ | Community: {book.avgRating.toFixed(1)} ⭐
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="quote" style={{ marginTop: '2rem' }}>
                                "Sometimes the best opinions are the unpopular ones."
                            </div>
                        </div>
                    </div>
                )}

                {/* Slide 4: Time Traveler Stats (if applicable) */}
                {stats.timeSpanYears && stats.timeSpanYears > 100 && (
                    <div className="slide">
                        <div className="slide-content">
                            <h2>{stats.timeSpanYears > 1000 ? 'Time Traveler' : 'Historical Reader'}</h2>
                            <p className="subtitle">
                                You journeyed through {stats.timeSpanYears.toLocaleString()} years of literature
                            </p>

                            <div className="stat-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Oldest Book</div>
                                    <div className="stat-value">
                                        {stats.oldestBookYear < 0 ? `${Math.abs(stats.oldestBookYear)} BC` : stats.oldestBookYear}
                                    </div>
                                    <div className="stat-desc">{stats.oldestBookTitle}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Average Year</div>
                                    <div className="stat-value">{stats.avgPubYear}</div>
                                    <div className="stat-desc">
                                        {stats.avgPubYear < 1900 ? 'You prefer the classics' :
                                            stats.avgPubYear < 2000 ? 'A mix of old and new' :
                                                'Modern reader'}
                                    </div>
                                </div>
                                {stats.booksAncient > 0 && (
                                    <div className="stat-card">
                                        <div className="stat-label">Ancient Books</div>
                                        <div className="stat-value">{stats.booksAncient}</div>
                                        <div className="stat-desc">From before 500 AD</div>
                                    </div>
                                )}
                            </div>

                            <div className="quote">
                                "From {stats.oldestBookYear < 0 ? 'Ancient Greece' : 'centuries past'} to modern day—you don't just read history, you live it."
                            </div>
                        </div>
                    </div>
                )}

                {/* Slide 5: Era Timeline */}
                {stats.eraBreakdown && Object.keys(stats.eraBreakdown).length > 0 && (
                    <div className="slide">
                        <div className="slide-content">
                            <h2>Your Reading Timeline</h2>
                            <p className="subtitle">Books across the centuries</p>

                            <div className="timeline">
                                {Object.entries(stats.eraBreakdown)
                                    .sort((a, b) => {
                                        const order = ["Ancient (BC)", "Ancient", "Medieval", "Early Modern", "19th Century", "20th Century", "21st Century"];
                                        return order.indexOf(a[0]) - order.indexOf(b[0]);
                                    })
                                    .map(([era, count]) => {
                                        const maxCount = Math.max(...Object.values(stats.eraBreakdown));
                                        const width = (count / maxCount) * 100;

                                        return (
                                            <div key={era} className="timeline-item">
                                                <div className="timeline-year">{era}</div>
                                                <div className="timeline-bar" style={{ width: `${width}%` }}></div>
                                                <div className="timeline-count">{count}</div>
                                            </div>
                                        );
                                    })}
                            </div>

                            <div className="stat-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Favorite Era</div>
                                    <div className="stat-value">{stats.favoriteEra}</div>
                                    <div className="stat-desc">{stats.eraBreakdown[stats.favoriteEra]} books from this period</div>
                                </div>
                                {stats.booksPre1900 > 0 && (
                                    <div className="stat-card">
                                        <div className="stat-label">Pre-1900 Books</div>
                                        <div className="stat-value">{stats.booksPre1900}</div>
                                        <div className="stat-desc">{Math.round((stats.booksPre1900 / stats.totalBooks) * 100)}% of your reading</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Slide 6: Author Stats */}
                {stats.uniqueAuthors && (
                    <div className="slide">
                        <div className="slide-content">
                            <h2>{stats.authorLoyalty === 'Explorer' ? 'Author Explorer' : stats.authorLoyalty === 'Superfan' ? 'Author Superfan' : 'Author Enthusiast'}</h2>

                            <div className="stat-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Unique Authors</div>
                                    <div className="stat-value">{stats.uniqueAuthors}</div>
                                    <div className="stat-desc">Out of {stats.totalBooks} books</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Books per Author</div>
                                    <div className="stat-value">{stats.booksPerAuthor}</div>
                                    <div className="stat-desc">{stats.booksPerAuthor < 1.2 ? 'You love variety' : stats.booksPerAuthor >= 2 ? 'You find favorites and stick with them' : 'Balanced approach'}</div>
                                </div>
                                {stats.topAuthorName && (
                                    <div className="stat-card">
                                        <div className="stat-label">Most Read Author</div>
                                        <div className="stat-value">{stats.topAuthorName}</div>
                                        <div className="stat-desc">{stats.topAuthorCount} {stats.topAuthorCount === 1 ? 'book' : 'books'}</div>
                                    </div>
                                )}
                            </div>

                            {stats.authorLoyalty && (
                                <>
                                    <div className="personality-badge badge">
                                        {stats.authorLoyalty === 'Explorer' ? '🗺️ Explorer' :
                                            stats.authorLoyalty === 'Superfan' ? '⭐ Superfan' :
                                                '📚 Balanced'}
                                    </div>
                                    <p className="subtitle" style={{ textAlign: 'center' }}>
                                        {stats.authorLoyalty === 'Explorer'
                                            ? 'You prefer discovering new voices over returning to favorites'
                                            : stats.authorLoyalty === 'Superfan'
                                                ? 'When you find an author you love, you read everything'
                                                : 'You balance discovering new authors with revisiting favorites'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Slide 7: Genre Breakdown */}
                {stats.genreBreakdown && (
                    <div className="slide">
                        <div className="slide-content">
                            <h2>Your Reading DNA</h2>

                            <div className="stat-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Top Genre</div>
                                    <div className="stat-value">{stats.topGenre}</div>
                                    <div className="stat-desc">{stats.genreBreakdown[stats.topGenre]} books ({Math.round((stats.genreBreakdown[stats.topGenre] / stats.totalBooks) * 100)}%)</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Genre Diversity</div>
                                    <div className="stat-value">{stats.genreDiversity} Genres</div>
                                    <div className="stat-desc">{stats.genreDiversity > 4 ? 'Wide-ranging interests' : 'Focused reading'}</div>
                                </div>
                                {Object.entries(stats.genreBreakdown).sort((a, b) => b[1] - a[1])[1] && (
                                    <div className="stat-card">
                                        <div className="stat-label">Second Place</div>
                                        <div className="stat-value">{Object.entries(stats.genreBreakdown).sort((a, b) => b[1] - a[1])[1][0]}</div>
                                        <div className="stat-desc">{Object.entries(stats.genreBreakdown).sort((a, b) => b[1] - a[1])[1][1]} books</div>
                                    </div>
                                )}
                            </div>

                            <div className="quote">
                                "Your reading list reflects a curious mind—exploring {Object.keys(stats.genreBreakdown).join(', ').toLowerCase()}."
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                {Object.entries(stats.genreBreakdown)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([genre, count]) => (
                                        <span key={genre} className="badge">{genre}: {count}</span>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Slide 8: Special Achievements */}
                <div className="slide">
                    <div className="slide-content">
                        <h2>Your Superpowers</h2>

                        <div className="stat-grid">
                            {stats.timeSpanYears > 100 && (
                                <div className="stat-card">
                                    <div className="stat-label">Time Span</div>
                                    <div className="stat-value">{stats.timeSpanYears.toLocaleString()}</div>
                                    <div className="stat-desc">
                                        Years—from {stats.oldestBookYear < 0 ? `${Math.abs(stats.oldestBookYear)} BC` : stats.oldestBookYear} to {stats.newestBookYear}
                                    </div>
                                </div>
                            )}

                            {stats.uniqueAuthors === stats.totalBooks && (
                                <div className="stat-card">
                                    <div className="stat-label">Perfect Diversity</div>
                                    <div className="stat-value">100%</div>
                                    <div className="stat-desc">Every single book from a different author!</div>
                                </div>
                            )}

                            {stats.fourPlusPct && stats.fourPlusPct > 80 && (
                                <div className="stat-card">
                                    <div className="stat-label">Quality Selector</div>
                                    <div className="stat-value">{stats.fourPlusPct}%</div>
                                    <div className="stat-desc">Rated 4+ stars—you know how to pick them</div>
                                </div>
                            )}

                            {stats.topAuthorCount && stats.topAuthorCount >= 5 && (
                                <div className="stat-card">
                                    <div className="stat-label">Author Devotion</div>
                                    <div className="stat-value">{stats.topAuthorCount}</div>
                                    <div className="stat-desc">Books by {stats.topAuthorName}—true dedication</div>
                                </div>
                            )}
                        </div>

                        <div className="quote">
                            "{stats.uniqueAuthors} unique authors, {stats.genreDiversity} different genres{stats.timeSpanYears > 100 ? `, spanning ${stats.timeSpanYears.toLocaleString()} years` : ''}. You're not just a reader—you're a literary {stats.authorLoyalty === 'Explorer' ? 'adventurer' : 'enthusiast'}."
                        </div>
                    </div>
                </div>

                {/* Slide 9: Final Message */}
                <div className="slide">
                    <div className="slide-content" style={{ textAlign: 'center' }}>
                        <h2>{stats.year} by the Numbers</h2>

                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-label">Books Read</div>
                                <div className="stat-value">{stats.totalBooks}</div>
                            </div>
                            {stats.uniqueAuthors && (
                                <div className="stat-card">
                                    <div className="stat-label">Authors Discovered</div>
                                    <div className="stat-value">{stats.uniqueAuthors}</div>
                                </div>
                            )}
                            {stats.timeSpanYears && (
                                <div className="stat-card">
                                    <div className="stat-label">Years Covered</div>
                                    <div className="stat-value">{stats.timeSpanYears.toLocaleString()}</div>
                                </div>
                            )}
                        </div>

                        <div className="quote" style={{ marginTop: '3rem' }}>
                            "Here's to another year of turning pages, exploring ideas, and collecting {stats.genreDiversity > 3 ? 'diverse' : ''} stories."
                        </div>

                        <h1 style={{ marginTop: '2rem', fontSize: 'clamp(2rem, 6vw, 5rem)' }}>{stats.year + 1} AWAITS</h1>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Wrapped;