# 🔐 BlockVerify — Blockchain-Based Secure Document Verification System

A full-stack MERN application for secure, tamper-proof document verification using blockchain-inspired hashing.

---

## 🧱 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios        |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB + Mongoose                      |
| Styling   | Custom CSS (light theme, no UI library) |
| Hashing   | SHA-256 via Node.js `crypto` module     |
| Toasts    | react-toastify                          |

---

## 📁 Project Structure

```
blockchain-doc-verify/
├── server/               # Express + MongoDB backend
│   ├── models/
│   │   └── Document.js   # Mongoose schema with blockchain fields
│   ├── routes/
│   │   └── documents.js  # Full CRUD + verify + stats routes
│   ├── .env              # Environment config
│   └── server.js         # Entry point
│
└── client/               # React frontend
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Sidebar.js
        │   ├── Topbar.js
        │   ├── DocumentForm.js    # Create/Edit modal
        │   ├── DocumentDetail.js  # View modal
        │   └── ConfirmDelete.js   # Delete confirmation
        ├── pages/
        │   ├── Dashboard.js       # Stats + recent docs
        │   ├── Documents.js       # Full CRUD table
        │   ├── VerifyDocument.js  # Hash/ID verification
        │   └── Blockchain.js      # Ledger chain view
        ├── utils/
        │   └── api.js             # Axios API calls
        ├── styles/
        │   └── global.css         # Light theme CSS vars
        ├── App.js
        └── index.js
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally on port 27017 (or update MONGO_URI)

---

### 1. Start MongoDB
Make sure MongoDB is running:
```bash
mongod
# or on macOS with Homebrew:
brew services start mongodb-community
```

---

### 2. Setup & Run Backend

```bash
cd server
npm install
npm run dev       # uses nodemon for hot reload
# or
npm start         # production
```

Server starts at: **http://localhost:5000**

Test health check: http://localhost:5000/api/health

---

### 3. Setup & Run Frontend

In a new terminal:
```bash
cd client
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 📡 API Endpoints

### Documents (CRUD)
| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | /api/documents            | Get all documents (filterable)     |
| GET    | /api/documents/:id        | Get single document                |
| POST   | /api/documents            | Create/register new document       |
| PUT    | /api/documents/:id        | Update document                    |
| DELETE | /api/documents/:id        | Delete document                    |

### Verification
| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| POST   | /api/documents/verify/hash      | Verify by SHA-256 hash          |
| POST   | /api/documents/verify/id        | Verify by document ID           |

### Stats
| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| GET    | /api/documents/stats/overview   | System-wide statistics          |

### Query Parameters (GET /api/documents)
- `search` — search title, holder, org, or ID
- `status` — Active | Expired | Revoked | Pending
- `documentType` — Certificate | Identity | Medical | Legal | Academic | Financial | Government | Other
- `page` — page number (default: 1)
- `limit` — items per page (default: 10)

---

## 🔐 Blockchain Features

- **SHA-256 Hashing** — Each document generates a unique hash from its content
- **Chain Linking** — Every document stores the `previousHash`, creating a chain
- **Block Index** — Sequential numbering for ledger ordering
- **Verification Count** — Tracks how many times a document has been verified
- **Tamper Detection** — Hash changes if data is altered
- **Genesis Block** — First document marked as genesis block in ledger view

---

## 🎨 Features

- ✅ Dashboard with real-time stats and charts
- ✅ Full CRUD for documents (Create, Read, Update, Delete)
- ✅ Search and filter by type, status, or keyword
- ✅ Paginated document list
- ✅ Verify documents by hash OR document ID
- ✅ Blockchain ledger view (chain visualization)
- ✅ Document detail modal with hash info
- ✅ Toast notifications for all actions
- ✅ Clean light theme with Syne + DM Sans fonts
- ✅ Responsive layout

---

## 🌱 Sample Data

After setup, register a document via the UI or use curl:

```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bachelor of Computer Science",
    "documentType": "Academic",
    "issuerName": "Dr. Jane Smith",
    "issuerOrganization": "MIT University",
    "holderName": "John Doe",
    "holderEmail": "john@example.com",
    "issueDate": "2024-05-01",
    "description": "Awarded with distinction"
  }'
```

---

## 🔧 Environment Variables

**server/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/blockchain_docs
NODE_ENV=development
```

For a cloud MongoDB (Atlas), replace MONGO_URI:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blockchain_docs
```

---

## 📦 Build for Production

```bash
# Build frontend
cd client && npm run build

# Serve with backend (add static serving to server.js)
cd server && npm start
```

---

Built with ❤️ using the MERN Stack
