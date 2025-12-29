# Reading Wrapped 2025 📚

Create your personalized reading recap — Spotify Wrapped style for books!

## Features

- 📊 Beautiful, animated statistics about your reading year
- 🎨 Dynamic visualization of your reading patterns
- 📖 Genre analysis, author diversity, publication timeline
- 🏆 Personality badges and achievements
- 💾 Download your Wrapped as a standalone HTML file
- 🔒 Privacy-first: All processing happens locally in your browser

## How to Use

1. Export your Goodreads library:
    - Go to Goodreads.com → My Books
    - Click "Import and export" in the left sidebar
    - Click "Export Library"
    - Save the CSV file

2. Upload your file to Reading Wrapped

3. Get your personalized reading recap!

## Local Development

### Prerequisites
- Node.js 14 or higher
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## Deploy to Netlify

### Option 1: Deploy from GitHub

1. Push this repo to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repo
5. Build settings are already configured in `netlify.toml`
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

### Option 3: Drag and Drop

1. Run `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `build` folder

## File Format Support

- ✅ Goodreads CSV export
- ✅ Excel files (.xlsx, .xls)
- ✅ Custom CSV with columns: Title, Author, My Rating, Date Read

## Tech Stack

- **React** - UI framework
- **Papa Parse** - CSV parsing
- **xlsx** - Excel file support
- **CSS3** - Animations and styling
- **Netlify** - Hosting

## Privacy

All data processing happens entirely in your browser. No data is sent to any server. Your reading data stays private and secure on your device.

## Credits

Inspired by Spotify Wrapped, built for book lovers who want more than just "pages read" and "books finished."

## License

MIT