# Earnest Task Management System — Track A


NOTE- If there is any confusion 
I would love to assist you guys, please reach me at 
email: nikhilanand020@gmail.com
phone: +91 8287916141


> ⚠️ **Note**
> I have deployed the backend on Render and the frontend on Vercel.

The web app is fully functional and all features mentioned in the assessment are implemented and tested.

👉 Live Demo:
https://earnest-task-manager.vercel.app/

'''''''''''''You can register using your email and password.
**Important:** Please use a password with at least 8 characters, otherwise a validation error will be shown.'''''''''''''

Also, since I am using free-tier services (Render + Vercel), the app might feel slow initially. This is because the backend server goes to sleep after inactivity and takes some time to wake up.

---

## 🧾 Project Overview

This is a full-stack Task Management System built with a focus on clean architecture and real-world practices.

It includes secure JWT-based authentication (with HTTP-only refresh tokens), proper error handling, and a responsive UI. Users can:

* Register, log in securely and logout 
* Create, edit, delete tasks
* Toggle task status (pending/completed)
* Search and filter tasks
* Navigate through paginated results

---

## 🛠️ Tech Stack

**Frontend**

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* `react-hot-toast` (for notifications)

**Backend**

* Node.js
* Express.js
* TypeScript

**Database & ORM**

* PostgreSQL (hosted on Neon)
* Prisma ORM

**Authentication**

* JWT (Access + Refresh Tokens)
* bcrypt (password hashing)
* HTTP-only cookies (for refresh token)

**Validation**

* Zod

---

## ✨ Features

* **Authentication**

  * Secure signup and login
  * Token-based session handling

* **Task Management**

  * Full CRUD operations
  * Tasks are user-specific

* **Search & Filter**

  * Search tasks by title
  * Filter by status (pending/completed)

* **Pagination**

  * Server-side pagination for better performance

* **UI/UX**

  * Responsive design (mobile + desktop)
  * Inline editing
  * Toast notifications for feedback

---

## 📁 Folder Structure

```text
earnest_vs/
├── frontend/             # Next.js Application
│   ├── src/app/          # Pages & layouts (App Router)
│   ├── src/lib/          # API utilities (token handling, fetch wrappers)
│   └── package.json
├── backend/              # Express + Prisma API
│   ├── src/routes/       # Auth & Task routes
│   ├── src/middleware/   # Validation, auth, error handling
│   ├── prisma/           # Schema & migrations
│   └── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

* `POST /auth/register` → Register new user
* `POST /auth/login` → Login user (returns access token + sets refresh cookie)
* `POST /auth/refresh` → Generate new access token
* `POST /auth/logout` → Logout user

### Tasks

* `GET /tasks` → Get tasks (supports pagination, filter, search)
* `POST /tasks` → Create task
* `PATCH /tasks/:id` → Update task
* `PATCH /tasks/:id/toggle` → Toggle status
* `DELETE /tasks/:id` → Delete task

Example:

```
/tasks?page=1&limit=6&status=pending&search=Design
```

---

## ⚙️ Local Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd earnest_vs
```

---

### 2. Environment Variables

**backend/.env**

```env
DATABASE_URL=postgres://user:password@hostname.neon.tech/dbname?sslmode=require
JWT_SECRET=your-secret
REFRESH_SECRET=your-refresh-secret
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

### 3. Install & Run

**Backend**

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## ☁️ Deployment Steps

---

### 🚀 Backend Deployment (Render)

1. Push code to GitHub
2. Create Web Service on Render
3. Set Root Directory → `backend`

**Configuration**

* Build Command:

```bash
npm install && npx prisma generate && npm run build
```

* Start Command:

```bash
npm run start
```

**Environment Variables**

```env
DATABASE_URL=your_neon_url
JWT_SECRET=your_secret
REFRESH_SECRET=your_secret
FRONTEND_URL=your_vercel_url
```

---

### 🌐 Frontend Deployment (Vercel)

1. Import repo into Vercel
2. Set Root Directory → `frontend`
3. Add environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

4. Deploy

---

### 🔁 Final Step (Important)

After deployment:

* Copy your Vercel URL
* Update `FRONTEND_URL` in Render
* Redeploy backend

👉 This ensures CORS works properly

---

## ⚠️ Known Behavior

* First request may be slow due to **Render cold start**
* Database (Neon) may also take time to wake up
* After first request → app works fast

---

## 💡 Final Note

This project focuses on:

* Clean backend structure
* Proper authentication flow
* Real-world deployment setup

It is intentionally kept simple while covering all required features from the assessment.

---


Neon console 

<img width="1918" height="1072" alt="image" src="https://github.com/user-attachments/assets/c66ce09b-daf1-4c34-a604-8cf726454927" />

dashboard 

<img width="1919" height="1073" alt="image" src="https://github.com/user-attachments/assets/3b6941c4-006b-4679-bc77-dd919f6603f0" />

