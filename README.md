# School Management System

## Project Purpose
A production-grade School Management System designed to handle admissions, student management, exams, payments, and more with a focus on Role-Based Access Control (RBAC).

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS (implied by layout), Global State Management (Zustand/Context).
- **Backend:** Node.js, Express, TypeScript.
- **Database:** Supabase (PostgreSQL).
- **Auth:** Supabase Auth / Custom JWT.

## Folder Structure
- `apps/web/`: React frontend application.
- `apps/api/`: Node.js Express backend API.
- `apps/mobile/`: React Native Expo mobile application.
- `infrastructure/`: Docker, monitoring, and database scripts.
- `docs/`: Project documentation and specifications.

## Setup
1. Clone the repository.
2. Install dependencies across workspaces.
3. Configure `.env` files in respective application folders under `apps/`.
4. Run development servers (`npm run dev:api`, `npm run dev:web`, `npm run dev:mobile`).
