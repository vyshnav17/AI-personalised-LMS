# AI-Powered Personalized LMS

## Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- SQLite (included via Prisma)

### 1. Backend Setup
The backend is built with NestJS, Prisma, and SQLite.

1.  **Navigate to backend:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    -   Ensure `.env` exists in `backend/` (I have set this up for you).
    -   Key variables: `DATABASE_URL="file:./dev.db"`, `JWT_SECRET`, etc.
4.  **Database Migration:**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```
5.  **Run Server:**
    ```bash
    npm run start:dev
    ```
    *Server runs on http://localhost:3000*
    *Swagger Docs: http://localhost:3000/api*

### 2. Frontend Setup
The frontend is built with React, Vite, and Tailwind CSS.

1.  **Navigate to frontend:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    *Client runs on http://localhost:5173*

## Features (In Progress)
- [x] Auth (Login/Register)
- [ ] AI Curriculum Generator
- [ ] AI Tutor Chat
