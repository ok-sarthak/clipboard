# Vacant Vectors Clipboard Manager

A comprehensive Next.js application that provides secure clipboard management with two distinct modes: **Paste Mode** for creating content and **Copy Mode** for accessing stored content. The application includes complete audit logging for security monitoring and compliance.

**⚠️ Educational Use Only:** This is a demonstration tool for educational purposes. Please do not store sensitive, personal, or confidential information.

## ✨ Features

### 🏠 **Landing Page**
- Modern, responsive design with gradient backgrounds
- Clear mode selection with detailed feature descriptions  
- Educational disclaimer and security warnings
- Feature highlights and benefits overview

### ✏️ **Paste Mode** (No Authentication Required)
- Rich text editor with character count display
- Real-time save status indicators and unsaved changes warnings
- Manual save functionality with visual feedback
- Clear button with confirmation for unsaved content
- Modern card-based UI with enhanced UX

### 🔒 **Copy Mode** (Passcode Protected)
- Secure authentication with modern login interface
- **Paginated content browsing** (10 entries per page)
- **Advanced pagination controls** (Previous/Next, numbered pages with ellipsis)
- One-click clipboard copying with visual feedback
- Individual and bulk delete operations
- Real-time refresh functionality
- Session management with automatic expiration
- Responsive design for all screen sizes

### 🔍 **Complete Audit Logging System**
- **Paste Activity Logging**: Every content save operation
- **Copy Activity Logging**: Every clipboard copy action  
- **Delete Activity Logging**: All deletions with full content preservation
- **Login Activity Logging**: All authentication attempts (success/failure)
- **Metadata Tracking**: IP addresses, user agents, timestamps, session IDs
- **Security Monitoring**: Failed login detection and brute force protection

## 🛠️ Technical Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **Database**: MongoDB with multiple collections
- **API**: RESTful Next.js API Routes
- **Security**: Passcode-based authentication with audit logging

## 📦 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB connection string
MONGODB_URI=YOUR_MONGODB_URI

# Default passcode for Copy mode authentication
DEFAULT_PASSCODE=YOUR_DEFAULT_PASSCODE

# Application URL (for production deployment)
NEXTAUTH_URL=YOUR_NEXTAUTH_URL
```

### 2. Database Setup

**Option A: Local MongoDB**


**Option B: MongoDB Atlas (Recommended)**
1. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster and database
3. Get your connection string and update `MONGODB_URI`

### 3. Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Usage Guide

### **Landing Page**
1. Visit the homepage to see feature overview
2. Choose between **Paste Mode** (create content) or **Copy Mode** (access content)

### **Paste Mode**
1. No authentication required
2. Type or paste content in the rich text editor
3. Monitor character count and save status
4. Click **"Save Content"** to store in database
5. Use **"Clear"** to reset (with confirmation for unsaved changes)

### **Copy Mode**
1. Enter the configured passcode (default: `admin123`)
2. Browse paginated content with advanced navigation
3. Use **"Refresh"** to reload latest entries
4. Click **"Copy"** next to any entry to copy to clipboard
5. Use **"Delete"** for individual entries or **"Delete All"** for bulk removal
6. Navigate between pages using pagination controls

## 🔐 Security & Monitoring

### **Database Collections Created**
- `clipboard_entries` - Main content storage
- `paste_logs` - Audit trail of all saved content
- `copy_logs` - Record of all copied content  
- `delete_logs` - Preserved deleted content for security
- `login_logs` - Authentication attempts and outcomes


## 📡 API Endpoints

### **Public Endpoints**
- `POST /api/clipboard` - Save new clipboard content
- `GET /api/clipboard?page=1&limit=10` - Retrieve paginated entries
- `POST /api/verify-passcode` - Authenticate for Copy Mode

### **Protected Endpoints**
- `DELETE /api/clipboard/delete?id={id}` - Delete specific entry
- `DELETE /api/clipboard/delete?deleteAll=true` - Delete all entries
- `POST /api/log-copy` - Log copy activity

### **Admin Endpoints**
- `GET /api/admin/logs` - Access audit logs (requires Bearer token)

## 📁 Project Structure

```
clipboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/logs/          # Admin audit log access
│   │   │   ├── clipboard/           # CRUD operations + pagination
│   │   │   │   └── delete/          # Delete operations with logging
│   │   │   ├── log-copy/            # Copy activity logging
│   │   │   └── verify-passcode/     # Authentication with logging
│   │   ├── copy/                    # Copy Mode with pagination
│   │   ├── paste/                   # Paste Mode with rich editor  
│   │   ├── globals.css              # Tailwind CSS styles
│   │   ├── layout.tsx               # Root layout with metadata
│   │   └── page.tsx                 # Landing page with features
│   └── lib/
│       ├── auditLogger.ts           # Comprehensive audit logging
│       └── mongodb.ts               # Database connection
├── AUDIT_LOGGING.md                 # Complete audit documentation
├── test-audit-logging.js            # Testing script for audit system
└── README.md                        # This file
```

## 🔧 Advanced Features

### **Pagination System**
- 10 entries per page with customizable limits
- Smart pagination with ellipsis for large datasets
- Previous/Next navigation with disabled states
- Page number display and total entry counts

### **Audit Logging**
- **Non-intrusive**: Logging failures don't affect user experience
- **Complete trail**: All user actions tracked with full metadata
- **Security focused**: Failed login attempts and IP tracking
- **Content preservation**: Even deleted content stored for security analysis

### **Modern UI/UX**
- Responsive design for all devices
- Loading states and visual feedback
- Error handling with user-friendly messages
- Accessibility considerations
- Modern card-based layouts

## 📝 Development Notes

### **Security Considerations**
- Simple passcode system (not production-ready authentication)
- Audit logs contain sensitive information - secure database access
- Session management via sessionStorage (browser-only)
- No content encryption (suitable for non-sensitive data only)

### **Performance**
- Pagination prevents large dataset loading issues
- Efficient MongoDB queries with proper indexing
- Optimized for educational and demonstration use

### **Deployment**
- Compatible with Vercel, Netlify, and other Next.js hosts
- Requires MongoDB connection (Atlas recommended for production)
- Environment variables must be configured on deployment platform

## 📄 Documentation

- `AUDIT_LOGGING.md` - Complete audit logging system documentation
- `test-audit-logging.js` - Test script for verifying audit functionality

---

**Built for educational & demo purposes • Built with Next.js & MongoDB**
