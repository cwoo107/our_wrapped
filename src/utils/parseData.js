import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseFile = (file) => {
    return new Promise((resolve, reject) => {
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.csv')) {
            // Parse CSV
            Papa.parse(file, {
                complete: (results) => {
                    resolve(parseGoodreadsData(results.data));
                },
                error: (error) => {
                    reject(new Error('Failed to parse CSV: ' + error.message));
                },
                header: true,
                skipEmptyLines: true
            });
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            // Parse Excel
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(parseGoodreadsData(jsonData));
                } catch (error) {
                    reject(new Error('Failed to parse Excel: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        } else {
            reject(new Error('Unsupported file format. Please upload CSV or Excel file.'));
        }
    });
};

const parseGoodreadsData = (data) => {
    // Filter out empty rows
    const books = data.filter(row => row.Title || row.title);

    return books.map(row => {
        // Handle different column name formats (Goodreads CSV uses Title, custom exports might use title)
        const getField = (field) => {
            const lowerField = field.toLowerCase();
            const key = Object.keys(row).find(k => k.toLowerCase() === lowerField);
            return row[key];
        };

        return {
            title: getField('title') || '',
            author: getField('author') || '',
            rating: getField('my rating') || getField('rating') || '',
            avgRating: parseFloat(getField('average rating') || getField('avg rating') || 0),
            dateRead: getField('date read') || getField('date   read') || '',
            datePublished: getField('original publication year') || getField('date pub') || '',
            isbn: getField('isbn') || getField('isbn13') || '',
            shelves: getField('bookshelves') || getField('shelves') || ''
        };
    });
};

export const parseDateRead = (dateStr) => {
    if (!dateStr) return null;

    const str = String(dateStr).trim();

    // Handle YYYY/MM/DD format from Goodreads
    const match = str.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // JS months are 0-indexed
        const day = parseInt(match[3]);
        return new Date(year, month, day);
    }

    // Try parsing as a general date
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return null;
};

export const getAvailableYears = (books) => {
    const years = new Set();

    books.forEach(book => {
        const date = parseDateRead(book.dateRead);
        if (date) {
            years.add(date.getFullYear());
        }
    });

    return Array.from(years).sort((a, b) => b - a); // Most recent first
};

export const filterBooksByYear = (books, year) => {
    return books.filter(book => {
        const date = parseDateRead(book.dateRead);
        return date && date.getFullYear() === year;
    });
};

export const parseRating = (ratingStr) => {
    if (!ratingStr) return null;

    const str = String(ratingStr);

    // Look for bracketed rating (actual rating given)
    const bracketMatch = str.match(/\[\s*(\d)\s*of 5 stars\s*\]/);
    if (bracketMatch) return parseInt(bracketMatch[1]);

    // Look for any number in "X of 5 stars" format
    const starMatch = str.match(/(\d)\s*of 5 stars/);
    if (starMatch) return parseInt(starMatch[1]);

    // Text ratings
    const textRatings = {
        'it was amazing': 5,
        'really liked it': 4,
        'liked it': 3,
        'it was ok': 2,
        'did not like it': 1
    };

    return textRatings[str.toLowerCase()] || null;
};

export const parsePublicationYear = (dateVal) => {
    if (!dateVal) return null;

    const str = String(dateVal);
    if (str.toLowerCase() === 'unknown') return null;

    // Extract year from string
    const yearMatch = str.match(/\b(\d{4})\b/);
    if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= -5000 && year <= 2025) return year;
    }

    // Handle negative years (BC)
    if (str.startsWith('-')) {
        try {
            const year = parseInt(str);
            if (year >= -5000 && year <= 0) return year;
        } catch (e) {
            // ignore
        }
    }

    return null;
};

export const inferGenre = (title) => {
    const titleLower = String(title).toLowerCase();

    if (/theology|god|christ|gospel|faith|prayer|christian|holy|doxology/.test(titleLower)) {
        return 'Theology/Religion';
    } else if (/philosophy|ethics|republic|nicomachean/.test(titleLower)) {
        return 'Philosophy';
    } else if (/history|war|political|world/.test(titleLower)) {
        return 'History/Politics';
    } else if (/love|heart|romance|kiss|rose|fates|blood|vampire|fae|fate|stars/.test(titleLower)) {
        return 'Romance/Fantasy';
    } else if (/guide|how to|handbook|manual|empathy|toxic|discipline|parenting|pregnancy|childbirth|leadership/.test(titleLower)) {
        return 'Self-Help/Practical';
    } else {
        return 'Fiction/Other';
    }
};

export const getEra = (year) => {
    if (year < 0) return "Ancient (BC)";
    if (year < 500) return "Ancient";
    if (year < 1500) return "Medieval";
    if (year < 1800) return "Early Modern";
    if (year < 1900) return "19th Century";
    if (year < 2000) return "20th Century";
    return "21st Century";
};