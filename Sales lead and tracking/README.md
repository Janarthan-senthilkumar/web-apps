# Sales Lead Tracking and CRM Management System (MERN)

This project is a full-stack MERN solution for managing the complete sales lead lifecycle, customer relationships, follow-up scheduling, and role-based accountability.

## Tech Stack
- MongoDB for leads, customers, users, follow-ups, and activity logs.
- Express.js + Node.js backend API with JWT auth and RBAC.
- React.js frontend with protected routes and role-aware workflows.

## Key Features
- JWT authentication with bootstrap admin setup.
- Role-based access (`admin`, `manager`, `executive`).
- Lead capture, assignment, status tracking, and conversion to customer.
- Follow-up scheduling and completion tracking.
- Customer management with interaction history.
- Analytics dashboard with conversion metrics, pipeline value, and activity feed.

## Project Structure
- `server/` - Express API, Mongo models, controllers, routes.
- `client/` - React application (Vite).

## Setup
1. Copy environment templates:
   - `server/.env.example` -> `server/.env`
   - `client/.env.example` -> `client/.env`
2. Install dependencies:
   ```bash
   npm install
   npm run install:all
   ```
3. Start both applications:
   ```bash
   npm run dev
   ```
4. Backend runs at `http://localhost:5000`, frontend at `http://localhost:5173`.

## First-Time Access
- Use **First Admin** on the login screen only when the users collection is empty.
- Use **Register** to create executive accounts.
- Admin users can create managers/executives from the Team page.

## Core API Routes
- `POST /api/auth/bootstrap-admin`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/leads`, `POST /api/leads`, `PATCH /api/leads/:id/status`, `PATCH /api/leads/:id/assign`
- `POST /api/leads/:id/convert`
- `GET /api/customers`, `POST /api/customers`, `POST /api/customers/:id/interactions`
- `GET /api/followups`, `POST /api/followups`, `PATCH /api/followups/:id/complete`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/conversion-report`

## Notes
- Ensure MongoDB is running locally or update `MONGO_URI`.
- Use a strong `JWT_SECRET` in production.
- For production hardening, add request validation, rate limiting, and audit alerting.
