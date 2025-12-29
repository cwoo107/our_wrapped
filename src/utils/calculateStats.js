import { parseRating, parsePublicationYear, inferGenre, getEra } from './parseData';

export const calculateStats = (books, userName = 'Reader', year = null) => {
    const stats = {
        name: userName,
        year: year,
        totalBooks: books.length
    };

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