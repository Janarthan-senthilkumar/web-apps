# 💰 BudgetWise – Budget Planning & Monitoring System

A full-stack **MERN** application for personal and organizational budget planning, expense tracking, and financial analytics.

---

## 🗂 Project Structure

```
budgetwise/
├── backend/                  ← Node.js + Express + MongoDB
│   ├── server.js             ← Entry point, DB connection, seeding
│   ├── .env                  ← Environment variables
│   ├── models/
│   │   ├── Budget.js         ← Mongoose Budget schema
│   │   └── Expense.js        ← Mongoose Expense schema
│   └── routes/
│       ├── budgets.js        ← GET / PUT budget routes
│       ├── expenses.js       ← Full CRUD expense routes
│       └── stats.js          ← Analytics & aggregation routes
│
└── frontend/                 ← React + Vite
    ├── index.html
    ├── vite.config.js        ← Proxy /api → localhost:5000
    ├── src/
    │   ├── main.jsx          ← React entry point
    │   ├── App.jsx           ← Router + Nav layout
    │   ├── index.css         ← Global styles
    │   ├── utils/
    │   │   ├── api.js        ← Axios API functions
    │   │   └── helpers.js    ← Formatters, constants
    │   ├── components/
    │   │   ├── Shared.jsx    ← StatCard, ProgressBar, Toast, etc.
    │   │   └── Shared.module.css
    │   └── pages/
    │       ├── Dashboard.jsx ← Overview charts & stats
    │       ├── Budgets.jsx   ← Budget management
    │       ├── Expenses.jsx  ← Expense CRUD tracker
    │       └── Reports.jsx   ← Analytics & recommendations
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

| Tool      | Version   | Download                          |
|-----------|-----------|-----------------------------------|
| Node.js   | ≥ 18.x    | https://nodejs.org                |
| MongoDB   | ≥ 6.x     | https://www.mongodb.com/try/download/community |
| npm       | ≥ 9.x     | Comes with Node.js                |

---

## 🚀 Setup & Run

### Step 1 — Start MongoDB

**Windows:**
```bash
mongod
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

### Step 2 — Setup & Run the Backend

```bash
cd budgetwise/backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected: mongodb://localhost:27017/budgetwise
🌱 Seeded default budgets
🌱 Seeded default expenses
🚀 Server running on http://localhost:5000
```

> The server auto-seeds 8 budget categories and 12 sample expenses on first launch.

---

### Step 3 — Setup & Run the Frontend

Open a **new terminal**:

```bash
cd budgetwise/frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

---

### Step 4 — Open in Browser

Visit **http://localhost:5173** 🎉

---

## 🔌 API Endpoints

### Budgets
| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| GET    | `/api/budgets`          | Get all budgets with spend |
| GET    | `/api/budgets/:category`| Get single budget          |
| PUT    | `/api/budgets/:category`| Update budget limit        |

### Expenses
| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/expenses`        | Get all (supports filters) |
| GET    | `/api/expenses/:id`    | Get single expense       |
| POST   | `/api/expenses`        | Create expense           |
| PUT    | `/api/expenses/:id`    | Update expense           |
| DELETE | `/api/expenses/:id`    | Delete expense           |

### Stats
| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/stats/summary`   | Dashboard KPIs           |
| GET    | `/api/stats/trends`    | 6-month trend data       |
| GET    | `/api/stats/categories`| Category breakdown       |

### Query Parameters (GET /api/expenses)
```
?category=food
?startDate=2025-03-01
?endDate=2025-03-31
?limit=50&page=1
```

---

## 🛠 Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Database   | MongoDB + Mongoose ODM      |
| Backend    | Node.js + Express.js        |
| Frontend   | React 18 + Vite             |
| Routing    | React Router DOM v6         |
| Charts     | Recharts                    |
| HTTP       | Axios                       |

---

## 🌱 Changing MongoDB URI

Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/budgetwise
```

For MongoDB Atlas (cloud):
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/budgetwise
```
