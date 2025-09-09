# 🎵 Karaoke Frontend

Modern Vue 3 frontend for the Karaoke System with real-time queue management and YouTube integration.

## ✨ Features

- 🎵 **Real-time Queue Management**: Add songs and see updates instantly
- 👑 **Host Control Panel**: Full control over playback and queue
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop
- 🔍 **Smart Search**: Search YouTube or paste direct URLs
- 🎛️ **YouTube Player Integration**: Official YouTube IFrame API
- 🌙 **Dark Mode Support**: Automatic theme detection
- 📡 **WebSocket Communication**: Real-time updates via Socket.IO

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see backend README)

### Installation

```bash
# Clone the repository
cd karaoke-system/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# WebSocket Configuration
VITE_WS_URL=http://localhost:3001

# YouTube API (Optional)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# App Configuration
VITE_APP_NAME=Karaoke System
VITE_APP_VERSION=1.0.0
```

## 📱 Usage

### For Users

1. **Add Songs**: Paste a YouTube URL or search for music
2. **View Queue**: See all songs in the current queue
3. **Edit Your Songs**: Modify songs you've added
4. **Real-time Updates**: Queue updates automatically

### For Hosts

1. **Generate Host Key**: Create a new host key from the host auth page
2. **Access Control Panel**: Use the host key to access full controls
3. **Control Playback**: Play, pause, skip songs
4. **Manage Queue**: Remove songs, reorder queue
5. **Monitor Session**: View session statistics

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── assets/                 # Static assets and styles
│   │   └── styles/
│   │       └── main.css       # Tailwind CSS and custom styles
│   ├── components/             # Vue components
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.vue     # Button component
│   │   │   ├── Input.vue      # Input component
│   │   │   ├── Modal.vue      # Modal component
│   │   │   ├── Loading.vue    # Loading component
│   │   │   ├── Toast.vue      # Toast notifications
│   │   │   └── Card.vue       # Card component
│   │   └── layout/            # Layout components
│   │       ├── Layout.vue     # Main layout
│   │       ├── Header.vue     # App header
│   │       ├── Footer.vue     # App footer
│   │       └── ToastContainer.vue # Toast container
│   ├── views/                 # Page components
│   │   ├── UserDashboard.vue  # Main user interface
│   │   ├── HostAuth.vue       # Host authentication
│   │   └── HostDashboard.vue  # Host control panel
│   ├── stores/                # Pinia stores
│   │   ├── queue.ts          # Queue state management
│   │   ├── user.ts           # User session management
│   │   ├── host.ts           # Host authentication
│   │   ├── websocket.ts      # WebSocket connection
│   │   └── ui.ts             # UI state management
│   ├── composables/          # Vue composables
│   │   ├── useQueue.ts       # Queue operations
│   │   ├── useYouTube.ts     # YouTube player
│   │   └── useWebSocket.ts   # WebSocket operations
│   ├── types/                # TypeScript types
│   │   ├── index.ts          # Core types
│   │   └── api.ts            # API types
│   ├── utils/                # Utility functions
│   │   ├── api.ts            # API client
│   │   └── config.ts         # App configuration
│   ├── router/               # Vue Router configuration
│   │   └── index.ts
│   ├── App.vue               # Root component
│   └── main.ts               # App entry point
├── public/                   # Public assets
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🎨 Design System

### Colors

The app uses a custom color palette with CSS custom properties:

- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for secondary elements
- **Success**: Green tones for success states
- **Warning**: Yellow tones for warnings
- **Error**: Red tones for errors

### Components

All UI components are built with:
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful, consistent icons
- **Responsive Design**: Mobile-first approach

### Typography

- **Font Family**: Inter (system font stack fallback)
- **Sizes**: Consistent scale from xs to xl
- **Weights**: Regular, medium, semibold, bold

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Development Server

The development server runs on `http://localhost:5173` by default.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## 📡 API Integration

### Backend Communication

- **REST API**: HTTP requests for CRUD operations
- **WebSocket**: Real-time updates via Socket.IO
- **Error Handling**: Comprehensive error handling with user feedback

### Key Endpoints

- `GET /api/songs/queue` - Get current queue
- `POST /api/songs` - Add song to queue
- `DELETE /api/songs/:id` - Remove song from queue
- `POST /api/host/key` - Generate host key
- `POST /api/host/validate` - Validate host key

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

### E2E Tests

```bash
npm run test:e2e
```

## 🚀 Deployment

### Build Configuration

The app is configured for static site generation and can be deployed to:

- **Netlify**: Automatic deployments from Git
- **Vercel**: Serverless deployment
- **GitHub Pages**: Static hosting
- **Traditional Hosting**: Upload `dist/` contents

### Environment Variables

Set these in your deployment platform:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the backend is running
2. Verify environment variables
3. Check browser console for errors
4. Review the troubleshooting guide

## 🎯 Roadmap

- [ ] YouTube search integration
- [ ] User authentication system
- [ ] Playlist import functionality
- [ ] Song voting system
- [ ] Advanced queue management
- [ ] Mobile app (PWA)
- [ ] Lyrics synchronization
- [ ] Multiple room support