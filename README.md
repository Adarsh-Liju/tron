# TRON Notes - Next.js Edition

A Tron-themed note-taking application built with Next.js, React, TypeScript, shadcn/ui, and SQLite.

## Features

- 🎨 **Tron Theme** - Neon cyan aesthetic with animated grid background
- 📝 **SQLite Storage** - Client-side SQLite database for persistent storage
- ⌨️ **Keyboard Shortcuts** - Vim-like navigation (hjkl) and quick actions
- 🖱️ **Drag & Drop** - Drag notes between boards like Google Keep
- 🎯 **Command Palette** - Press `Ctrl+B` to open command palette
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQL.js (SQLite in the browser)
- **Language**: TypeScript

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Keyboard Shortcuts

- `h` / `l` / `←` / `→` - Navigate between boards
- `j` / `k` / `↓` / `↑` - Navigate between notes
- `n` - Add note to first board
- `N` - Add note to focused board
- `b` - Add new board
- `e` / `Enter` - Edit focused item
- `d` / `x` - Delete focused item
- `g` - Go to first board
- `G` - Go to last board
- `Ctrl+B` / `Ctrl+P` - Open command palette
- `Escape` - Close modals/palette

## Project Structure

```
├── app/              # Next.js app directory
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # App components
├── lib/              # Utilities and database
│   ├── db.ts        # SQLite database functions
│   └── utils.ts     # Utility functions
├── hooks/            # React hooks
└── public/           # Static assets
```

## Database

The app uses SQL.js to run SQLite in the browser. Data is stored in localStorage as a binary blob. The database automatically migrates from the old localStorage format on first load.

## License

MIT
