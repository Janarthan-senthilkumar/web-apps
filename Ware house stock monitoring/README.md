# Time Warehouse Stock Monitoring System

A complete **MERN stack** application for warehouse stock monitoring and intelligent inventory control with real-time updates, demand forecasting, and automated alerts.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO, Nodemailer, node-cron
- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit, Recharts, React Router v6
- **DevOps**: Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** (local or Atlas)

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Copy env example (in /server)
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and settings
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

### 5. Open App
Navigate to **http://localhost:5173**

### Login Credentials (from seed data)

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@warehouse.com    | admin123   |
| Manager | manager@warehouse.com  | manager123 |
| Staff   | staff@warehouse.com    | staff123   |

## Docker Deployment

```bash
docker-compose up --build
```

## Project Structure

```
├── server/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (13 controllers)
│   ├── middleware/       # Auth, RBAC, error handling, validation
│   ├── models/          # Mongoose schemas (10 models)
│   ├── routes/          # Express routes (13 route files)
│   ├── services/        # Email, alert, inventory intelligence
│   ├── jobs/            # Cron jobs for scheduled checks
│   ├── utils/           # Helpers, pagination, audit logging
│   ├── seed/            # Database seed script
│   └── server.js        # Entry point
│
├── client/
│   ├── src/
│   │   ├── components/  # Sidebar, Navbar
│   │   ├── layouts/     # MainLayout
│   │   ├── pages/       # 12 pages
│   │   ├── services/    # API service layer
│   │   └── store/       # Redux Toolkit slices
│   └── index.html
│
├── docker-compose.yml
└── README.md
```

## Features

- **Authentication**: JWT + bcrypt with role-based access (Admin/Manager/Staff)
- **Real-time**: Socket.IO for live stock updates and alerts
- **Dashboard**: 10 stat cards, movement charts, category distribution, activity timeline
- **Products**: Full CRUD with SKU, barcode, categories, suppliers, demand history
- **Inventory**: Multi-warehouse stock tracking with availability status
- **Transactions**: 7 types (inward, outward, transfer, adjustment, return, damaged, expired)
- **Intelligence**: Low stock, overstock, near-expiry, aging analysis, demand forecasting (MA/WMA), safety stock, EOQ, reorder risk scoring
- **Alerts**: Severity-based (info/warning/critical) with email notifications, in-app center
- **Reports**: 9 report types (stock, movement, utilization, aging, reorder, expiry, supplier, category, valuation)
- **Audit Trail**: Full action logging with before/after change tracking
- **Dark Mode**: Toggle between light and dark themes
- **Cron Jobs**: Automated inventory checks every 6 hours, monthly demand history updates

## Deployment Notes

### Render / Railway
1. Set `MONGO_URI` to your MongoDB Atlas connection string
2. Deploy `/server` as a web service (start command: `npm start`)
3. Deploy `/client` as a static site (build: `npm run build`, publish: `dist`)
4. Set `CLIENT_URL` in server env to your frontend URL

### Vercel (Frontend Only)
1. Import `/client` directory
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add env var `VITE_API_URL` pointing to your backend URL
