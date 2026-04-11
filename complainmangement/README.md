# README — College Complaint Management System

## Overview
A full-stack MERN (MongoDB + Express + React + Node.js) Complaint Management System built for college projects. Supports three user roles: **Admin**, **Staff**, and **Student (User)**, with real-time updates, file uploads, and a modern Tailwind CSS dashboard UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB (local) |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io + polling |
| Charts | Recharts |
| File Upload | Multer |

---

## Prerequisites

Ensure you have these installed:
- **Node.js** (v18+): https://nodejs.org
- **MongoDB** (local): https://www.mongodb.com/try/download/community
- **Git** (optional)

Start MongoDB before running the project:
```bash
# If MongoDB is installed as a service, it starts automatically.
# Otherwise, run: mongod
```

---

## Project Structure

```
complaint mangement/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route handlers
│   ├── middleware/       # Auth, upload middleware
│   ├── seed/            # Demo data seed script
│   ├── uploads/         # File upload storage
│   ├── .env             # Environment variables
│   └── server.js        # Main server entry point
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance
    │   ├── components/   # Shared UI (Sidebar, Topbar, Layout)
    │   ├── context/      # Auth context
    │   └── pages/        # Role pages (admin/, staff/, user/)
    └── vite.config.js
```

---

## How to Run

### Step 1 — Seed the Database (one time)

```bash
cd "d:\complaint mangement\backend"
node seed/seed.js
```

You should see: `✅ DATABASE SEEDED SUCCESSFULLY!`

### Step 2 — Start the Backend

Open a terminal:

```bash
cd "d:\complaint mangement\backend"
node server.js
```

Backend starts at: `http://localhost:5000`

### Step 3 — Start the Frontend

Open a **second** terminal:

```bash
cd "d:\complaint mangement\frontend"
npm run dev
```

Frontend starts at: `http://localhost:5173`

### Step 4 — Open the App

Go to: **http://localhost:5173**

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| 👑 Admin | admin@college.edu | Admin@123 |
| 👨 Staff 1 | staff1@college.edu | Staff@123 |
| 👨 Staff 2 | staff2@college.edu | Staff@123 |
| 👨 Staff 3 | staff3@college.edu | Staff@123 |
| 🎓 Student 1 | user1@college.edu | User@123 |
| 🎓 Student 2 | user2@college.edu | User@123 |

> These are also accessible via "Quick Demo Login" buttons on the login page.

---

## Features by Role

### Admin
- Dashboard with charts (complaints by category, status distribution)
- View & manage all 22+ complaints
- Assign complaints to staff members
- Update complaint status (Pending → In Progress → Resolved → Closed)
- Manage all users (edit role, department, active status, delete)
- Staff overview with workload and resolution rates
- Notification bell with unread count

### Staff
- Personal dashboard showing assigned complaint counts + bar chart
- Expandable complaint cards with internal notes
- One-click status updates (Pending / In Progress / Resolved)
- Send responses visible to the student
- Real-time assignment notifications

### Student (User)
- Welcome dashboard with personal complaint stats
- Submit new complaints with:
  - Category & priority selection
  - Drag-and-drop file upload (image/PDF/Word, max 5MB)
- Track all complaints with visual status timeline
- View full response thread from Admin/Staff
- Bell notifications for status changes

---

## API Endpoints

| Route | Method | Role | Description |
|---|---|---|---|
| /api/auth/register | POST | Public | Register new student |
| /api/auth/login | POST | Public | Login |
| /api/auth/me | GET | All | Current user |
| /api/admin/stats | GET | Admin | Dashboard stats |
| /api/admin/complaints | GET | Admin | All complaints (filter/paginate) |
| /api/admin/complaints/:id/assign | PUT | Admin | Assign to staff |
| /api/admin/complaints/:id/status | PUT | Admin | Update status |
| /api/admin/users | GET | Admin | All users |
| /api/staff/complaints | GET | Staff | Assigned complaints |
| /api/staff/complaints/:id | PUT | Staff | Update status/notes |
| /api/complaints | POST | User | Submit complaint + upload |
| /api/complaints/my | GET | User | Own complaints |
| /api/responses | POST | All | Add response |
| /api/responses/:id | GET | All | Get responses |
| /api/notifications | GET | All | Get notifications |

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/complaint_management
JWT_SECRET=complaint_mgmt_super_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

---

*Built with ❤️ for college academic demonstration — MERN Stack Project*
