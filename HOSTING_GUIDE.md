# Hosting Guide for AI LMS

This guide outlines the steps to deploy your AI LMS project to the web.

## Prerequisites
- GitHub account
- Accounts on hosting providers (suggestions: Render, Railway, or Vercel)
- PostgreSQL database (Supabase, Neon, or via hosting provider)

## 1. Database Setup (PostgreSQL)
Since we switched from SQLite to PostgreSQL for production:
1.  Create a new PostgreSQL database (e.g., on [Supabase.com](https://supabase.com) or [Neon.tech](https://neon.tech)).
2.  Get the **Connection String** (Transaction mode). It looks like: `postgresql://user:password@host:port/database`.
3.  Save this string; you'll need it for the backend environment variables.

## 2. Backend Deployment (Render/Railway)
We recommend **Render** or **Railway** for NestJS apps.

### Option A: Render
1.  Connect your GitHub repo to Render.
2.  Create a **Web Service** for the `backend` directory.
    -   **Root Directory**: `backend`
    -   **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
    -   **Start Command**: `npm run start:prod`
3.  **Environment Variables**:
    -   `DATABASE_URL`: Your PostgreSQL connection string.
    -   `JWT_SECRET`: A long random string.
    -   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
    -   `GROQ_API_KEY`: Your AI API key.
    -   `PORT`: `10000` (Render default).

### Option B: Railway
1.  Connect GitHub repo.
2.  Add service from the `backend` folder.
3.  Add a **PostgreSQL** database service within Railway (optional, or use external).
4.  Configure variables similar to Render.

## 3. Frontend Deployment (Vercel)
Vercel is best for Vite/React apps.

1.  Connect your GitHub repo to Vercel.
2.  Select the `frontend` directory as the project root.
3.  Vercel should auto-detect Vite.
    -   **Build Command**: `vite build`
    -   **Output Directory**: `dist`
4.  **Environment Variables**:
    -   `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://your-backend.onrender.com`).
        -   *Note: Do NOT add a trailing slash.*

## 4. Final Configuration
1.  **Google Cloud Console**: Update "Authorized Redirect URIs" to include your new production frontend URL:
    -   `https://your-frontend.vercel.app`
    -   `https://your-frontend.vercel.app/auth/callback` (if using a callback route)
2.  **CORS**: Ensure your Backend allows requests from your Frontend URL.
    -   In `backend/src/main.ts`, update `app.enableCors()` to:
        ```typescript
        app.enableCors({
          origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
          credentials: true,
        });
        ```

## 5. Verification
- Visit your frontend URL.
- Try logging in (Google Auth).
- Check if courses load (requires DB seeding or new generation).
