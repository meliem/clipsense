# ClipSense

<div align="center">
  <h1>🧠 ClipSense</h1>
  <p><strong>Intelligent Clipboard Manager with AI-Powered Content Analysis</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="Platform">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
    <img src="https://img.shields.io/badge/version-1.0.0-green" alt="Version">
  </p>
</div>

## 🚀 Features

### 🧠 Intelligent Content Analysis
- **Auto-detection** of content types (URLs, emails, colors, JSON, code, etc.)
- **Smart suggestions** based on content type
- **Confidence scoring** for detected patterns
- **Context-aware** actions and transformations

### 📋 Advanced Clipboard Management
- **Real-time monitoring** of clipboard changes
- **Unlimited history** with configurable limits
- **Search and filter** through clipboard history
- **Favorites** and tagging system
- **Duplicate detection** and prevention

### 🎨 Modern User Interface
- **Clean, intuitive** design with dark/light themes
- **Responsive layout** with smooth animations
- **Keyboard shortcuts** for everything
- **System tray integration** for quick access
- **Global hotkeys** (Ctrl+Shift+V by default)

### 🔒 Privacy & Security
- **Local processing** - no cloud dependencies
- **Sensitive content detection** with automatic masking
- **Optional encryption** for stored data
- **Auto-delete** sensitive content after time limit
- **Configurable privacy** settings

### 🛠 Content Types Supported

| Type | Detection | Actions |
|------|-----------|---------|
| **URLs** | Domain extraction, validation | Open, shorten, copy domain |
| **Emails** | Format validation | Compose email, copy domain |
| **Colors** | HEX, RGB, HSL formats | Convert formats, generate palette |
| **JSON/XML** | Structure validation | Format, validate, minify |
| **Code** | Language detection | Syntax highlighting, format |
| **Phone Numbers** | International formats | Call, SMS |
| **IP Addresses** | IPv4/IPv6 detection | Geolocation lookup |
| **Coordinates** | Lat/lng patterns | Open in maps |
| **Dates/Times** | Various formats | Timezone conversion |
| **File Paths** | System path detection | Open location, get info |
| **UUIDs** | Standard format | Validation, generation |
| **Base64** | Encoded content | Decode, validate |
| **Credit Cards** | Number patterns | Masked display |

## 📥 Installation

### Download Pre-built Binaries
1. Go to the [Releases](https://github.com/meliem/clipsense/releases) page
2. Download the appropriate version for your platform:
   - **Windows**: `ClipSense-1.0.0-win-x64.exe`
   - **macOS**: `ClipSense-1.0.0-mac-universal.dmg`
   - **Linux**: `ClipSense-1.0.0-linux-x64.AppImage`

### Build from Source

#### Prerequisites
- Node.js 18+ and npm
- Git

#### Steps
```bash
# Clone the repository
git clone https://github.com/meliem/clipsense.git
cd clipsense

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Build platform-specific distributables
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🎮 Usage

### Getting Started
1. **Launch ClipSense** - It will start monitoring your clipboard automatically
2. **Copy anything** - Text, URLs, code, etc. will be automatically detected and stored
3. **Access your history** - Use `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) to open ClipSense
4. **Search and filter** - Find specific items using the search bar and filters
5. **Take actions** - Use suggested actions based on content type

### Keyboard Shortcuts
- `Ctrl+Shift+V` (Global) - Toggle ClipSense window
- `Ctrl+F` - Focus search bar
- `↑/↓` - Navigate through items
- `Enter` - Select item
- `Ctrl+C` - Copy selected item
- `Delete` - Delete selected item
- `Ctrl+D` - Toggle favorite
- `Escape` - Close window

### System Tray
ClipSense runs in the system tray for quick access:
- **Left click** - Toggle main window
- **Right click** - Context menu with recent items and settings

## ⚙️ Configuration

### Settings Overview
- **Appearance**: Light/dark/system theme
- **Behavior**: History limits, auto-start, notifications
- **Shortcuts**: Customizable global hotkeys
- **Privacy**: Encryption, sensitive content handling
- **Language**: Multi-language interface support

### Privacy Settings
ClipSense prioritizes your privacy:
- All processing happens **locally** on your machine
- No data is sent to external servers
- Sensitive content (passwords, keys) is automatically detected and masked
- Optional encryption for stored clipboard data
- Configurable auto-deletion of sensitive content

## 🏗 Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Electron + Node.js
- **Database**: SQLite with better-sqlite3
- **Build**: Vite + electron-vite
- **Testing**: Jest + React Testing Library

### Project Structure
```
clipsense/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts          # Application entry point
│   │   ├── clipboard-monitor.ts # Clipboard monitoring
│   │   ├── content-analyzer.ts  # AI content analysis
│   │   ├── database.ts      # SQLite database operations
│   │   ├── tray-manager.ts  # System tray integration
│   │   └── global-shortcuts.ts # Global keyboard shortcuts
│   ├── renderer/            # React frontend
│   │   ├── components/      # UI components
│   │   ├── stores/          # Zustand state management
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   ├── shared/              # Shared types and constants
│   └── preload/             # Electron preload scripts
├── public/                  # Static assets
├── resources/              # App icons and resources
└── release/                # Built distributables
```

### Database Schema
```sql
-- Clipboard items storage
CREATE TABLE clips (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL,
    detected_types TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    tags TEXT
);

-- Application settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User templates
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    template TEXT NOT NULL,
    variables TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Development

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for unit testing
- **Husky** for pre-commit hooks

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Cross-platform desktop app framework
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite database driver

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/meliem/clipsense/issues) page to report bugs or request features.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/meliem">meliem</a></p>
  <p>
    <a href="https://github.com/meliem/clipsense">⭐ Star on GitHub</a>
  </p>
</div>