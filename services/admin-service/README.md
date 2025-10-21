# Admin Service (PostgreSQL + Prisma + Express + JWT)

Implements **Feature 1: CRM User Management** for the CS301 project using PostgreSQL & Prisma.

## Quick Start (Local)
```bash
unzip admin-service-postgres-prisma.zip && cd admin-service-postgres-prisma
cp .env.example .env
docker compose up -d postgres
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Open Swagger at: `http://localhost:8080/docs`
```

## Endpoints (base `/api`)
- **POST** `/auth/login` — Authenticate user (returns access + refresh tokens)
- **POST** `/auth/refresh` — Refresh access token
- **POST** `/auth/reset-password` — Reset password (admin-only reset by email)
- **POST** `/users` — Create user (Admin only)
- **GET** `/users` — List users (Admin only)
- **GET** `/users/:id` — Get user (Admin only)
- **PUT** `/users/:id` — Update user (Admin only)
- **PATCH** `/users/:id/disable` — Disable/Enable user (Admin only)

## Roles
- `admin`: manage users
- `agent`: used by agents (created by admins)

## Root Admin Bootstrap
On first start, the service ensures a **root admin** exists using `ROOT_ADMIN_EMAIL` and `ROOT_ADMIN_PASSWORD`.
