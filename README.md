# Vacant Vectors Clipboard

A Next.js application that works as a simple clipboard manager with two modes: Copy and Paste.

**Disclaimer:** This is a demonstration tool for educational purposes only. Do not store sensitive or confidential information.

## Features

- **Landing Page**: Choose between Copy and Paste modes with disclaimer
- **Paste Mode**: No authentication required
  - Simple textarea for pasting content
  - Manual save button (no auto-sync)
  - Content cleared locally on browser exit/refresh but persists in database
  - Clear button to reset textarea
- **Copy Mode**: Password protected
  - Displays all previously pasted content from MongoDB
  - Each entry has a "Copy to Clipboard" button
  - Individual delete functionality for each entry
  - Bulk delete all entries option
  - Session expires on browser exit/refresh
- **Environment Password**: Simple passcode protection (not full authentication)

## Setup Instructions

### 1. Environment Variables

The application uses a `.env.local` file with the following variables:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/clipboard-manager

# Default passcode for Copy mode  
DEFAULT_PASSCODE=admin123

# Next.js URL (for production)
NEXTAUTH_URL=http://localhost:3000
```

### 2. MongoDB Setup

You need a running MongoDB instance. You can either:

**Option A: Local MongoDB**
- Install MongoDB locally
- The default connection string points to `mongodb://localhost:27017/clipboard-manager`

**Option B: MongoDB Atlas (Cloud)**
- Create a free MongoDB Atlas account
- Get your connection string and update `MONGODB_URI` in `.env.local`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Landing Page**: Visit the home page and select either "Paste Mode" or "Copy Mode"

2. **Paste Mode**:
   - No password required
   - Type or paste content in the textarea
   - Click "Save Content" button to manually save to MongoDB
   - Use "Clear" button to reset the textarea
   - Content is cleared locally when you close/refresh the browser

3. **Copy Mode**:
   - Enter the passcode (configurable in `.env.local`)
   - View all previously pasted content
   - Click "Copy" button next to any entry to copy it to your clipboard
   - Click "Delete" button to remove individual entries
   - Use "Delete All" button to remove all entries at once
   - Authentication expires when you close/refresh the browser

## Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **API**: Next.js API Routes

## API Endpoints

- `POST /api/clipboard` - Save clipboard content
- `GET /api/clipboard` - Retrieve all clipboard entries  
- `POST /api/verify-passcode` - Verify access passcode
- `DELETE /api/clipboard/delete?id={id}` - Delete specific entry
- `DELETE /api/clipboard/delete?deleteAll=true` - Delete all entries

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── clipboard/
│   │   │   └── route.ts          # Clipboard CRUD operations
│   │   └── verify-passcode/
│   │       └── route.ts          # Passcode verification
│   ├── copy/
│   │   └── page.tsx              # Copy mode (password protected)
│   ├── paste/
│   │   └── page.tsx              # Paste mode (no auth)
│   └── page.tsx                  # Landing page with mode selection
└── lib/
    └── mongodb.ts                # MongoDB connection utility
```

## Security Notes

- This uses a simple passcode system stored in environment variables
- Not suitable for production use without proper authentication
- Session state is stored in browser's sessionStorage
- No encryption for stored clipboard data
