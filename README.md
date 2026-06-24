# Inventory System

Full-stack inventory management system with React Frontend and Node.js Backend.

## Project Structure

```
inventory-system/
├── Frontend/          # React + Vite frontend application
│   ├── src/          # React components and logic
│   ├── public/       # Static assets
│   └── package.json
├── Backend/          # Express.js backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── index.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm install

# Or for individual workspaces
cd Frontend && npm install
cd Backend && npm install
```

### Development

```bash
# Run both Frontend and Backend
npm run dev

# Or individually
cd Frontend && npm run dev    # Frontend on http://localhost:5173
cd Backend && npm run dev     # Backend on http://localhost:5000
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## API Endpoints

- `GET /api/health` - Backend health check

## License

MIT
