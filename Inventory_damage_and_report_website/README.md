# Inventory Damage & Replacement Tracking System

A production-quality inventory management system for logging items, recording damages, tracking replacements, and generating reports. Built with React, Node.js/Express, and SQLite.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios, React Toastify |
| Backend | Node.js, Express.js |
| Database | SQLite (local file via Sequelize ORM) |
| File Upload | Multer |

## Prerequisites

- **Node.js** v16+ and **npm** installed
- No cloud services required — runs entirely on localhost

## Project Structure

```
inventory-tracker/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Error handler, upload, validation
│   ├── models/          # Sequelize models & associations
│   ├── routes/          # API route definitions
│   ├── uploads/         # Uploaded images (auto-created)
│   ├── .env             # Environment variables
│   ├── database.sqlite  # SQLite database (auto-created)
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Routes & layout
│   │   ├── index.css    # Design system
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Setup & Installation

### 1. Clone / extract the project

```bash
cd inventory-tracker
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Start the backend server

```bash
cd ../backend
npm start
```

The backend runs on **http://localhost:5000**. The SQLite database file (`database.sqlite`) and all tables are created automatically on first start.

### 5. Start the frontend dev server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on **http://localhost:5173**.

## Database

- **Engine**: SQLite (local file `backend/database.sqlite`)
- **ORM**: Sequelize
- **Tables**: `inventory`, `damage_reports`, `replacement_records`
- **Initialization**: Automatic on server start (no manual migration needed)

### Schema

| Table | Key Columns |
|-------|-------------|
| `inventory` | id, name, category, quantity, location, image_path |
| `damage_reports` | id, inventory_id (FK), damage_description, damage_date, status |
| `replacement_records` | id, damage_id (FK), replacement_date, replacement_cost, notes |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/inventory` | List items (paginated, searchable) |
| GET | `/api/inventory/:id` | Get single item |
| POST | `/api/inventory` | Create item (multipart/form-data) |
| PUT | `/api/inventory/:id` | Update item |
| DELETE | `/api/inventory/:id` | Delete item + cascade |
| GET | `/api/damages` | List reports (filterable by status) |
| POST | `/api/damages` | Create damage report |
| PUT | `/api/damages/:id` | Update damage report |
| DELETE | `/api/damages/:id` | Delete report + cascade |
| GET | `/api/replacements` | List replacements |
| POST | `/api/replacements` | Create replacement |
| PUT | `/api/replacements/:id` | Update replacement |
| DELETE | `/api/replacements/:id` | Delete replacement |

## Port Configuration

| Service | Default Port | Config Location |
|---------|-------------|-----------------|
| Backend | 5000 | `backend/.env` → `PORT=5000` |
| Frontend | 5173 | `frontend/vite.config.js` |

## Environment Variables

```env
PORT=5000
NODE_ENV=development
```

## Features

- ✅ Full CRUD for Inventory, Damage Reports, and Replacements
- ✅ Real image upload (JPG/PNG, max 5MB)
- ✅ Dashboard with live statistics and status distribution
- ✅ Search & filter functionality
- ✅ Pagination on all list views
- ✅ Status workflow: Pending → Approved → Replaced
- ✅ Toast notifications & confirmation dialogs
- ✅ Responsive dark-themed UI
- ✅ Input validation (client + server)
- ✅ Secure file upload handling
- ✅ Foreign key constraints with cascade delete
