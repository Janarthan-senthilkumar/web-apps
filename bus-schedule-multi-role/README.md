# 🚌 BusNav — 3-Level Role Bus Schedule System

A full-stack MERN bus schedule management app with **3 user roles**: Organisation Head, Staff, and Customer.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios, React Hot Toast, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Auth (bcryptjs + jsonwebtoken)

---

## 👥 User Roles & Permissions

| Feature                    | Organisation Head | Staff | Customer |
|----------------------------|:-----------------:|:-----:|:--------:|
| Search schedules           | ✅                | ✅    | ✅       |
| View buses/routes/schedules| ✅                | ✅    | ✅       |
| Create buses/routes        | ✅                | ❌    | ❌       |
| Edit buses/routes          | ✅                | ✅    | ❌       |
| Delete buses/routes        | ✅                | ❌    | ❌       |
| Create/delete schedules    | ✅                | ❌    | ❌       |
| Edit schedule status       | ✅                | ✅    | ❌       |
| View dashboard stats       | ✅ (full)         | ✅    | ✅ (basic)|
| Manage users               | ✅                | ❌    | ❌       |
| Reset user passwords       | ✅                | ❌    | ❌       |

---

## 🔑 Demo Login Credentials

| Role              | Email                  | Password    |
|-------------------|------------------------|-------------|
| Organisation Head | head@busnav.in         | head@123    |
| Staff             | priya@busnav.in        | staff@123   |
| Staff             | arjun@busnav.in        | staff@123   |
| Customer          | senthil@gmail.com      | cust@123    |
| Customer          | anitha@gmail.com       | cust@123    |

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally (default: `mongodb://localhost:27017/busnav`)

### 1. Backend Setup
```bash
cd backend
npm install
# Seed the database with demo data:
npm run seed
# Start the server:
npm run dev
```
Backend runs on: http://localhost:5000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 📁 Project Structure

```
bus-schedule-multi/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js      ← login, register, profile
│   │   ├── userController.js      ← user CRUD (org head only)
│   │   ├── busController.js
│   │   ├── routeController.js
│   │   └── scheduleController.js
│   ├── middleware/
│   │   ├── auth.js                ← JWT protect + role authorize
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js                ← NEW: roles, bcrypt password
│   │   ├── Bus.js
│   │   ├── Route.js
│   │   └── Schedule.js
│   ├── routes/
│   │   ├── authRoutes.js          ← NEW
│   │   ├── userRoutes.js          ← NEW
│   │   ├── busRoutes.js           ← role-protected
│   │   ├── routeRoutes.js         ← role-protected
│   │   └── scheduleRoutes.js      ← role-protected
│   ├── seed.js                    ← 8 users + 10 buses + 8 routes + 12 schedules
│   └── server.js
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx     ← NEW: auth state + role helpers
        ├── pages/
        │   ├── LoginPage.jsx       ← NEW: login/register + demo creds
        │   ├── Dashboard.jsx       ← role-aware stats
        │   ├── BusesPage.jsx       ← role-based CRUD
        │   ├── RoutesPage.jsx      ← role-based CRUD
        │   ├── SchedulesPage.jsx   ← role-based CRUD
        │   ├── SearchPage.jsx      ← public search (all roles)
        │   ├── UsersPage.jsx       ← NEW: org head only
        │   └── ProfilePage.jsx     ← NEW: personal profile
        ├── services/api.js         ← authAPI + userAPI added
        ├── App.jsx                 ← auth gate + role-nav
        └── index.css
```

---

## 🔒 API Endpoints

### Auth (public)
- `POST /api/auth/login` — login
- `POST /api/auth/register` — register as customer
- `GET  /api/auth/me` — get current user (protected)
- `PUT  /api/auth/profile` — update profile (protected)
- `PUT  /api/auth/change-password` — change password (protected)

### Users (organisation_head only)
- `GET    /api/users` — list all users
- `POST   /api/users` — create staff/customer
- `PUT    /api/users/:id` — update user
- `DELETE /api/users/:id` — delete user
- `PUT    /api/users/:id/reset-password` — reset password

### Buses, Routes, Schedules (role-gated)
All existing endpoints now require JWT. Write operations restricted by role.
