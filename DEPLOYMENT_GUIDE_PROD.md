# 🚀 Production Deployment Guide

This guide covers deploying your **School Management System** to **Render (Backend)** and **Netlify (Frontend)**.

---

## 🏗️ Phase 1: Backend Deployment (Render)

1.  **Log in to Render**: Go to [dashboard.render.com](https://dashboard.render.com/).
2.  **New Web Service**: Click **New +** and select **Web Service**.
3.  **Connect GitHub**: Select your repository: `School_Management_System`.
4.  **Configure Service**:
    *   **Name**: `school-management-backend` (or similar)
    *   **Region**: Singapore (or nearest to you)
    *   **Branch**: `main`
    *   **Root Directory**: `backend` (⚠️ Important)
    *   **Runtime**: Node
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Plan**: Free (for now)

5.  **Environment Variables (Add these in the "Environment" tab)**:
    *   `NODE_ENV`: `production`
    *   `SUPABASE_URL`: *[Your Supabase Project URL]*
    *   `SUPABASE_KEY`: *[Your Supabase SERVICE_ROLE Key]* (Use Service Role for backend admin tasks)
    *   `FRONTEND_URL`: *[Leave blank for now, update after Netlify deploy]*

6.  **Deploy**: Click **Create Web Service**.
    *   ⏳ Wait for the deployment to finish.
    *   📋 **Copy your Backend URL** (e.g., `https://school-backend.onrender.com`).

---

## 🎨 Phase 2: Frontend Deployment (Netlify)

1.  **Log in to Netlify**: Go to [app.netlify.com](https://app.netlify.com/).
2.  **Add New Site**: Click **Add new site** > **Import from Git**.
3.  **Connect GitHub**: Choose `School_Management_System`.
4.  **Configure Build**:
    *   **Base Directory**: `frontend` (⚠️ Important)
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
5.  **Environment Variables**: Click **Advanced** or go to **Site Settings > configuration > Environment variables** after creation.
    *   `VITE_API_URL`: *[Paste your Render Backend URL here]* (Add `/api` at the end if your code expects it, e.g., `https://xx.onrender.com/api`)
        *   *Check `src/lib/api-client.ts`: logic uses the variable generally without appending `/api` inside the var if the base default has it. Recommend: `https://your-backend.onrender.com/api`*
    *   `VITE_SUPABASE_URL`: *[Your Supabase Project URL]*
    *   `VITE_SUPABASE_ANON_KEY`: *[Your Supabase ANON/PUBLIC Key]*

6.  **Deploy**: Click **Deploy Site**.
    *   ⏳ Wait for the build to finish.
    *   📋 **Copy your Frontend URL** (e.g., `https://school-system-sathish.netlify.app`).

---

## 🔗 Phase 3: Final Link & Security

1.  **Update Backend CORS**:
    *   Go back to **Render Dashboard**.
    *   Go to **Environment Variables**.
    *   Add/Update `FRONTEND_URL` with your **Netlify URL** (no trailing slash, e.g., `https://school-system-sathish.netlify.app`).
    *   **Manual Deploy**: Go to "Deploys" tab in Render and click **Deploy latest commit** (or "Clear build cache & deploy") to apply the new env var.

2.  **Update Supabase Auth Redirects**:
    *   Go to **Supabase Dashboard > Authentication > URL Configuration**.
    *   Add your **Netlify URL** to **Site URL** and **Redirect URLs** (e.g., `https://your-site.netlify.app/**`).

---

## ✅ Functional Check

1.  Open your **Netlify URL**.
2.  Open Browser Console (F12).
3.  Try to **Login**.
    *   If you see `404` on API calls -> Check `VITE_API_URL` in Netlify.
    *   If you see `CORS Error` -> Check `FRONTEND_URL` in Render.
    *   If login fails silently -> Check Supabase Redirect URLs.

**You are now Live! 🚀**
