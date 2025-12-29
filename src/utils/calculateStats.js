import { parseRating, parsePublicationYear, inferGenre, getEra } from './parseData';

export const calculateStats = (books, userName = 'Reader', year = null) => {
    const stats = {
        name: userName,
        year: year,
        totalBooks: books.length
    };

    const pagesRead = books
        .map(b => {
            const pages = parseInt(b.pages || b['Number of Pages'] || 0);
            return isNaN(pages) ? 0 : pages;
        })
        .reduce((sum, pages) => sum + pages, 0);

    stats.totalPages = pagesRead;

    // Parse all ratings
    const ratings = books.map(b => parseRating(b.rating)).filter(r => r !== null);

    if (ratings.length > 0) {
        stats.avgRating = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
        stats.fiveStarPct = parseFloat(((ratings.filter(r => r === 5).length / ratings.length) * 100).toFixed(1));
        stats.fourPlusPct = parseFloat(((ratings.filter(r => r >= 4).length / ratings.length) * 100).toFixed(1));
        stats.mostCommonRating = getMostCommon(ratings);

        // Rating distribution
        stats.ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            const count = ratings.filter(r => r === i).length;
            if (count > 0) stats.ratingDistribution[i] = count;
        }

        // Compare to Goodreads average
        const validComparisons = books.filter(b => parseRating(b.rating) !== null && b.avgRating > 0);
        if (validComparisons.length > 0) {
            const diff = validComparisons.reduce((sum, b) => {
                return sum + (parseRating(b.rating) - b.avgRating);
            }, 0) / validComparisons.length;
            stats.ratingVsGoodreads = parseFloat(diff.toFixed(2));

            if (diff > 0.3) {
                stats.ratingPersonality = "Generous Reviewer";
            } else if (diff < -0.3) {
                stats.ratingPersonality = "Tough Critic";
            } else {
                stats.ratingPersonality = "Balanced Judge";
            }

            // NEW: Advanced rating analysis
            stats.ratingAnalysis = analyzeRatingBehavior(validComparisons);
        }
    }

    // Publication year stats
    const years = books.map(b => parsePublicationYear(b.datePublished)).filter(y => y !== null);

    if (years.length > 0) {
        stats.avgPubYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length);
        stats.oldestBookYear = Math.min(...years);
        stats.newestBookYear = Math.max(...years);
        stats.timeSpanYears = stats.newestBookYear - stats.oldestBookYear;

        // Find oldest book
        const oldestBook = books.find(b => parsePublicationYear(b.datePublished) === stats.oldestBookYear);
        stats.oldestBookTitle = oldestBook?.title || 'Unknown';

        // Era breakdown
        const eras = years.map(getEra);
        stats.favoriteEra = getMostCommon(eras);
        stats.eraBreakdown = countOccurrences(eras);

        // Time period counts
        stats.books2020Plus = years.filter(y => y >= 2020).length;
        stats.booksPre1900 = years.filter(y => y < 1900).length;
        stats.booksAncient = years.filter(y => y < 500).length;

        // Reading personality
        const ancientPct = stats.booksPre1900 / years.length;
        const recentPct = stats.books2020Plus / years.length;

        if (ancientPct > 0.3) {
            stats.readingPersonality = "Time Traveler";
        } else if (recentPct > 0.7) {
            stats.readingPersonality = "Trend Chaser";
        } else {
            stats.readingPersonality = "Balanced Reader";
        }
    }

    // Author stats
    const authors = books.map(b => b.author).filter(a => a);

    if (authors.length > 0) {
        stats.uniqueAuthors = new Set(authors).size;
        stats.booksPerAuthor = parseFloat((authors.length / stats.uniqueAuthors).toFixed(2));

        const authorCounts = countOccurrences(authors);
        const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0];
        stats.topAuthorName = topAuthor[0];
        stats.topAuthorCount = topAuthor[1];

        if (authors.length >= 5) {
            if (stats.booksPerAuthor >= 2.0) {
                stats.authorLoyalty = "Superfan";
            } else if (stats.booksPerAuthor < 1.2) {
                stats.authorLoyalty = "Explorer";
            } else {
                stats.authorLoyalty = "Balanced";
            }
        }
    }

    // Genre stats
    const genres = books.map(b => inferGenre(b.title));
    stats.topGenre = getMostCommon(genres);
    stats.genreBreakdown = countOccurrences(genres);
    stats.genreDiversity = Object.keys(stats.genreBreakdown).length;

    // Goodreads community average
    const validAvgRatings = books.filter(b => b.avgRating > 0).map(b => b.avgRating);
    if (validAvgRatings.length > 0) {
        stats.goodreadsAvg = parseFloat((validAvgRatings.reduce((a, b) => a + b, 0) / validAvgRatings.length).toFixed(2));

        if (stats.avgRating) {
            const diff = Math.abs(stats.avgRating - stats.goodreadsAvg);
            if (diff < 0.3) {
                stats.tasteAlignment = "Mainstream";
            } else if (stats.avgRating > stats.goodreadsAvg) {
                stats.tasteAlignment = "Optimist";
            } else {
                stats.tasteAlignment = "Contrarian";
            }
        }
    }

    return stats;
};

// NEW: Analyze rating behavior in detail
const analyzeRatingBehavior = (booksWithComparisons) => {
    const analysis = {};

    // Books where user rated higher than Goodreads
    const ratedHigher = booksWithComparisons.filter(b => {
        const userRating = parseRating(b.rating);
        return userRating > b.avgRating;
    });

    // Books where user rated lower than Goodreads
    const ratedLower = booksWithComparisons.filter(b => {
        const userRating = parseRating(b.rating);
        return userRating < b.avgRating;
    });

    // Books rated exactly the same
    const ratedSame = booksWithComparisons.filter(b => {
        const userRating = parseRating(b.rating);
        return Math.abs(userRating - b.avgRating) < 0.1;
    });

    analysis.ratedHigherCount = ratedHigher.length;
    analysis.ratedLowerCount = ratedLower.length;
    analysis.ratedSameCount = ratedSame.length;
    analysis.ratedHigherPct = parseFloat((ratedHigher.length / booksWithComparisons.length * 100).toFixed(1));
    analysis.ratedLowerPct = parseFloat((ratedLower.length / booksWithComparisons.length * 100).toFixed(1));

    // Find biggest disagreements
    const disagreements = booksWithComparisons.map(b => ({
        title: b.title,
        userRating: parseRating(b.rating),
        avgRating: b.avgRating,
        difference: parseRating(b.rating) - b.avgRating
    }));

    // Most loved (rated much higher than average)
    const mostLoved = disagreements
        .filter(d => d.difference > 0)
        .sort((a, b) => b.difference - a.difference)
        .slice(0, 3);

    // Most critical (rated much lower than average)
    const mostCritical = disagreements
        .filter(d => d.difference < 0)
        .sort((a, b) => a.difference - b.difference)
        .slice(0, 3);

    analysis.mostLoved = mostLoved;
    analysis.mostCritical = mostCritical;

    // Underrated gems (gave 5 stars, Goodreads average < 4.0)
    const underratedGems = booksWithComparisons.filter(b => {
        const userRating = parseRating(b.rating);
        return userRating === 5 && b.avgRating < 4.0;
    });

    analysis.underratedGems = underratedGems.map(b => ({
        title: b.title,
        avgRating: b.avgRating
    }));

    // Overrated books (gave 1-2 stars, Goodreads average > 4.0)
    const overratedBooks = booksWithComparisons.filter(b => {
        const userRating = parseRating(b.rating);
        return userRating <= 2 && b.avgRating > 4.0;
    });

    analysis.overratedBooks = overratedBooks.map(b => ({
        title: b.title,
        avgRating: b.avgRating,
        userRating: parseRating(b.rating)
    }));

    // Rating consistency - standard deviation
    const differences = disagreements.map(d => d.difference);
    const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
    const variance = differences.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / differences.length;
    analysis.ratingStdDev = parseFloat(Math.sqrt(variance).toFixed(2));

    // Determine consistency personality
    if (analysis.ratingStdDev < 0.5) {
        analysis.consistencyType = "Predictable";
    } else if (analysis.ratingStdDev > 1.0) {
        analysis.consistencyType = "Unpredictable";
    } else {
        analysis.consistencyType = "Moderate";
    }

    // Harsh on popular books?
    const popularBooks = booksWithComparisons.filter(b => b.avgRating >= 4.2);
    if (popularBooks.length > 0) {
        const popularAvgDiff = popularBooks.reduce((sum, b) => {
            return sum + (parseRating(b.rating) - b.avgRating);
        }, 0) / popularBooks.length;
        analysis.harshOnPopular = popularAvgDiff < -0.3;
    }

    // Champion of underdogs?
    const unpopularBooks = booksWithComparisons.filter(b => b.avgRating < 3.8);
    if (unpopularBooks.length > 0) {
        const unpopularAvgDiff = unpopularBooks.reduce((sum, b) => {
            return sum + (parseRating(b.rating) - b.avgRating);
        }, 0) / unpopularBooks.length;
        analysis.championOfUnderdogs = unpopularAvgDiff > 0.3;
    }

    return analysis;
};

const getMostCommon = (arr) => {
    const counts = countOccurrences(arr);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
};

const countOccurrences = (arr) => {
    return arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
};