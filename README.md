<div align="center">

# 🎓 NEC LMS — Enterprise Proctored Examination Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Monaco_Editor-0.55-0078D4?style=for-the-badge&logo=visual-studio-code&logoColor=white" />
  <img src="https://img.shields.io/badge/Netlify-Deploy-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-10.x-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
</p>

> **A production-grade, real-time proctored examination system for engineering colleges with live screen monitoring, integrated code execution engine, multi-role RBAC, and full hardware lab management.**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Application Flow](#application-flow)
- [Module Breakdown](#module-breakdown)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Database Setup](#database-setup)
- [Security & Anti-Cheat](#security--anti-cheat)
- [API Design](#api-design)
- [Database Design](#database-design)
- [DevOps & Deployment](#devops--deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**NEC LMS** solves a critical problem: conducting fair, scalable, monitored online examinations without expensive third-party proctoring software.

### The Problem
- Paper exams are slow to grade and vulnerable to cheating
- Generic platforms (Google Forms, etc.) have zero security
- Enterprise proctoring tools (ExamSoft, ProctorU) cost thousands per year
- Colleges lack a unified system for faculty, HODs, and admins

### The Solution

NEC LMS provides a **self-hosted, full-stack examination ecosystem**:
- Admins manage labs and hardware nodes in real time
- HODs oversee department-level exam governance
- Faculty design multi-type exams and monitor students live
- Students take secure, timed exams in a locked-down environment
- Lab PCs run as dedicated client kiosks linked to the server

### Target Users

| Role | Responsibility |
|------|---|
| **Admin** | Manages institution, users, devices, system settings |
| **HOD** | Approves exams, manages faculty, department analytics |
| **Faculty** | Creates exams, monitors students live, grades submissions |
| **Student** | Takes secure exams, views results, accesses code playground |
| **Client** | Lab PC running in kiosk/exam mode |

---

## System Architecture

### Architecture Overview

```
Client Layer (Browser/Kiosk)
├─ Student/Faculty/HOD/Admin Browsers
├─ Lab PC Kiosk (Exam Mode)
└─ All communicate via HTTPS + WSS

    ↓

Application Layer (Vite + Express)
├─ React 18 SPA (Frontend)
├─ Express 5 REST API (Backend)
└─ Socket.io Server (Real-time Events)

    ↓

Data Layer
├─ MongoDB Atlas/Local (Database)
└─ Temp Code Dir (Code Execution)

    ↓

Execution Engine
├─ Python Runtime
├─ Node.js Runtime
├─ GCC/G++ Compiler
└─ Java JDK
```

---

## Application Flow

### User Journey

1. **User Login** → Authenticate via JWT
2. **Role-based Dashboard** → Admin/HOD/Faculty/Student/Client sees appropriate UI
3. **Admin**:
   - Manage users (CRUD, bulk upload)
   - Register lab devices
   - Remote command control (lock/unlock/restart)
   - View system logs and violations

4. **Faculty**:
   - Create exams (MCQ, Text, Coding, Math, File Upload)
   - Monitor students in real-time
   - Review submissions and violations
   - Grade and publish results

5. **HOD**:
   - Approve exams before they go live
   - View department-level analytics
   - Manage faculty

6. **Student**:
   - View assigned exams
   - Start exam → Anti-cheat activated
   - Submit answers → Auto-graded (MCQ)
   - View results and feedback

7. **Lab PC Client**:
   - Wait for exam
   - Lock screen when exam starts
   - Stream screen to faculty
   - Unlock when exam ends

---

## Module Breakdown

### Admin Module
- Dashboard (KPIs, violations, device grid)
- User Management (CRUD, bulk upload, CSV)
- Device Registry (register, heartbeat, status)
- Lab Control (remote commands)
- Live Monitoring (real-time student screens)
- Logs & Reports (login logs, activity logs, violations)
- Settings (platform configuration)

### HOD Module
- Dashboard (department stats)
- Faculty Management
- Student Oversight
- Exam Approval
- Department Reports
- Monitoring

### Faculty Module
- Dashboard (exam stats)
- Create Exam (multi-type questions)
- Question Bank (reusable questions)
- Live Monitoring (student screens)
- Results Review & Grading
- Evidence Vault (violation screenshots)

### Student Module
- Dashboard (upcoming exams, grades)
- My Exams (assigned exams)
- Exam Interface (secured, anti-cheat enabled)
- Results View
- Coding Playground

### Client Module (Lab PC)
- Waiting Screen
- Exam Mode (locked interface)
- Lock Screen (admin-triggered)
- Violation Screen (max violations reached)

---

## Features

### Authentication & Access Control
- JWT-based authentication (24-hour expiry)
- 5-role RBAC: `admin`, `hod`, `faculty`, `student`, `client`
- Password hashing with bcrypt (12 salt rounds)
- Login failure logging with IP tracking

### Exam Engine
- **5 Question Types**: MCQ, Text (short/long), Coding, Math, File Upload
- **Auto-grading**: MCQ answers verified server-side
- **HOD Approval Workflow**: Exams require approval before going live
- **Lifecycle**: Draft → Scheduled → Active → Completed → Archived
- **Answer Persistence**: Auto-save every 5 seconds + localStorage backup
- **Question Flagging**: Students mark questions for review
- **Time Management**: Countdown timer with auto-submit on timeout

### Live Proctoring
- Real-time screen capture via `getDisplayMedia()` API
- Faculty sees live grid of all student screens
- Rate-limited streaming (1 frame per 2.5 seconds)
- Violation screenshots captured at 640×360
- Socket.io rooms scoped per exam

### Anti-Cheat System (14+ Violation Types)
| Violation | Detection |
|-----------|-----------|
| Tab switch | `visibilitychange` event |
| Copy/Paste | `copy`/`paste` event listeners |
| DevTools open | Window size detection (outerWidth vs innerWidth) |
| Screen share stopped | `videoTrack.onended` |
| Screen share denied | `getDisplayMedia` catch |
| Right-click | `contextmenu` prevented |
| Fullscreen exit | `fullscreenchange` event |
| Unauthorized face | Face detection API |
| Multiple faces | Face detection API |
| Keyboard shortcut | `keydown` event filter |
| Inactivity | No activity timeout |
| Periodic snapshot | Scheduled screenshot evidence |
| Window blur | `blur` event listener |

### Code Execution Engine
- **Languages**: Python, Node.js, C, C++, Java, Rust, Bash
- **Sandboxed**: Each run uses isolated temp file
- **5-second timeout**: Safety limit on execution
- **Error handling**: Structured error messages
- **Windows Support**: MinGW path injection for GCC/G++
- **Offline Monaco Editor**: Bundled in `public/monaco/`

### Lab Hardware Management
- Register physical lab PCs (hostname, IP, MAC, location, department)
- Real-time status monitoring: `online | offline | exam | locked | maintenance`
- Heartbeat janitor (checks every 30 seconds)
- Remote commands: `lock`, `unlock`, `restart`
- Current student + exam tracking per device

### Question Bank
- Faculty-owned repository
- Filter by difficulty and topic
- Test cases for coding questions
- Reusable across multiple exams

### Analytics & Reporting
- **Admin**: User counts, device stats, active exams, violations
- **HOD**: Department analytics, faculty performance
- **Faculty**: Per-exam results, submission counts, violation rates
- **Student**: Personal scores, exam history

---

## Tech Stack

### Frontend
- **React 18.3** — UI rendering with hooks
- **Vite 8.x** — Dev server + bundler
- **React Router 6** — Client-side routing with code splitting
- **TailwindCSS 3.4** — Utility-first styling with theme support
- **Radix UI** — Accessible component primitives
- **Socket.io-client 4.8** — Real-time bidirectional communication
- **Monaco Editor 0.55** — VS Code embedded for coding exams
- **TanStack Query 5.x** — Server state management
- **Framer Motion 12.x** — Animations
- **Recharts 2.12** — Analytics charts
- **Lucide Icons 0.539** — Icon library

### Backend
- **Node.js 20+** — JavaScript runtime
- **Express 5.x** — HTTP REST API framework
- **Mongoose 9.4** — MongoDB ODM with schema validation
- **Socket.io 4.8** — WebSocket server
- **jsonwebtoken 9.x** — JWT generation/verification
- **bcryptjs 3.x** — Password hashing
- **dotenv 17.x** — Environment variables
- **uuid 13.x** — Session ID generation

### Database
- **MongoDB 7+** — Document database (Atlas or local)
- **18 Collections** — User, Exam, Submission, Violation, Device, Lab, Course, Department, QuestionBank, LoginLog, ActivityLog, Notification, Mark, Attendance, LabSession, StudentProfile, Settings, and more

### DevOps
- **pnpm 10.x** — Package manager
- **Netlify** — Frontend hosting + serverless functions
- **Docker** — Containerization
- **GitHub Actions** — CI/CD pipeline

---

## Project Structure

```
NEClms/
├── client/                          # React Frontend (SPA)
│   ├── App.jsx                      # Root component with routing
│   ├── global.css                   # TailwindCSS directives
│   ├── components/                  # Generic UI components
│   │   └── ui/                      # shadcn/ui primitives
│   ├── contexts/                    # Auth, Socket, Theme, Notifications
│   ├── core/                        # API client, hooks, utils
│   └── modules/                     # Feature modules (admin, faculty, hod, student, client)
│
├── server/                          # Express Backend
│   ├── index.js                     # Main server setup
│   ├── models/                      # Mongoose schemas (18 models)
│   ├── routes/                      # API route handlers
│   ├── middleware/                  # Auth, RBAC middleware
│   ├── utils/                       # Helpers (codeExecutor.js)
│   └── socket.js                    # Socket.io event handlers
│
├── shared/                          # Shared types & constants
│   └── api.js
│
├── scripts/                         # DB seeding & maintenance
│   ├── seedAll.js
│   ├── createAdmin.js
│   ├── export_db.mjs
│   └── import_db.mjs
│
├── netlify/functions/               # Serverless API wrapper
│
├── public/monaco/                   # Bundled Monaco Editor
│
├── package.json                     # Dependencies
├── vite.config.js                   # Dev server config
├── tailwind.config.js               # TailwindCSS theme
├── netlify.toml                     # Netlify deployment
└── index.html                       # SPA entry point
```

---

## Installation & Setup

### System Requirements

| Item | Minimum | Recommended |
|------|---------|-------------|
| Node.js | 18.x | 20.x LTS |
| pnpm | 8.x | 10.x |
| MongoDB | 6.x | 7.x (Atlas) |
| RAM | 2 GB | 4+ GB |
| OS | Windows 10 / Ubuntu 20 | Windows 11 / Ubuntu 22 |

**For code execution (optional):**
- Python 3.x
- GCC/G++ (MinGW on Windows)
- Java JDK 17+
- Rust toolchain

### Installation Steps

**Step 1: Clone Repository**
```bash
git clone https://github.com/your-username/NEClms.git
cd NEClms
```

**Step 2: Install Dependencies**
```bash
pnpm install
```

**Step 3: Configure Environment**

Create `.env` file in project root:
```env
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/neclms

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h
```

**Step 4: Start Development Server**
```bash
pnpm run dev
```

Visit: **http://localhost:8080**

---

## Database Setup

### Option A: MongoDB Atlas (Cloud — Recommended)

1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster (free tier available)
3. Create database user with password
4. Whitelist your IP address (`0.0.0.0/0` for development)
5. Copy connection string
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/neclms?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

**macOS (Homebrew):**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt install mongodb
sudo systemctl start mongod
```

**Windows:**
- Download installer from [mongodb.com](https://www.mongodb.com)
- Run installer and select "Run as Service"
- MongoDB runs on `localhost:27017`

### Seed Database (Optional)

```bash
# Create admin user
node scripts/createAdmin.js

# Seed demo data (students, faculty, exams)
node scripts/seedAll.js
```

### Build & Run Commands

```bash
# Development
pnpm run dev

# Production build
pnpm run build

# Production start
pnpm start

# Tests
pnpm test

# Format code
pnpm format.fix
```

---

## Security & Anti-Cheat

### Authentication
- JWT tokens with 24-hour expiry
- Passwords hashed with bcrypt (cost 12)
- Session stored in `sessionStorage` (cleared on close)
- Login failures logged with IP + user-agent

### API Security Headers
- Cache-Control: no-store
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: HSTS enabled

### Role-Based Access Control (RBAC)
```
Admin   → Full system access
HOD     → Department management
Faculty → Exam creation & monitoring
Student → Exam taking & submissions
Client  → Lab PC kiosk mode
```

### Anti-Cheat Detection
- 14+ violation types detected automatically
- Screenshot evidence captured for each violation
- Severity levels (low, medium, high)
- Admin review and resolution system
- Auto-terminate exam on max violations

---

## API Design

### Base URL
- Development: `http://localhost:8080/api`
- Production: `https://your-site.netlify.app/api`

### Key Endpoints

**Authentication:**
```
POST /api/auth/login
POST /api/auth/logout
```

**Exams:**
```
GET  /api/exams
POST /api/exams (faculty)
GET  /api/exams/:id
```

**Submissions:**
```
POST /api/submissions/start
PUT  /api/submissions/:id/answers
POST /api/submissions/:id/submit
GET  /api/submissions/:id
```

**Violations:**
```
POST /api/violations
GET  /api/violations
GET  /api/violations/:examId
```

**Devices:**
```
POST /api/devices/register
POST /api/devices/heartbeat
GET  /api/devices
POST /api/lab/control (admin)
```

**Code Execution:**
```
POST /api/code/run
GET  /api/code/check (compilers available)
```

---

## Database Design

### 18 Collections

1. **User** — All roles with department reference
2. **Exam** — Exams with polymorphic questions
3. **Submission** — Student answers and violations
4. **Violation** — Anti-cheat evidence with screenshots
5. **Device** — Lab PC registry with status
6. **Lab** — Lab rooms and hardware info
7. **Course** — Academic courses
8. **Department** — Institution departments
9. **QuestionBank** — Reusable questions
10. **LoginLog** — Authentication audit trail
11. **ActivityLog** — User action log
12. **Notification** — In-app notifications
13. **Mark** — Grading records
14. **Attendance** — Attendance tracking
15. **LabSession** — Lab session records
16. **StudentProfile** — Extended student data
17. **Settings** — Platform configuration
18. **Others** — Additional administrative data

### Key Indexes
- `(role, department)` — Fast role-based queries
- `(exam, status)` — Exam status lookups
- `(student, exam)` — Submission retrieval
- `(createdAt)` — Time-series queries

---

## DevOps & Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 8080
CMD ["pnpm", "start"]
```

### Docker Compose
```yaml
version: "3.9"
services:
  app:
    build: .
    ports: ["8080:8080"]
    environment:
      - MONGODB_URI=mongodb://mongo:27017/neclms
      - JWT_SECRET=your-secret-here
    depends_on: [mongo]
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
volumes:
  mongo_data:
```

### Netlify Deployment
- Frontend: Deployed to Netlify CDN
- API: Wrapped with `serverless-http` in Netlify Functions
- Auto-deploy on `git push` to main branch

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update `JWT_SECRET` to long random string
- [ ] Use MongoDB Atlas (not local)
- [ ] Enable HTTPS only
- [ ] Set CORS to specific origin
- [ ] Enable rate limiting on auth routes
- [ ] Remove debug endpoints
- [ ] Enable database backups

---

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Test: `pnpm test`
5. Format: `pnpm format.fix`
6. Commit: `git commit -m "feat: your feature"`
7. Push and create Pull Request

### Branch Naming
- `feature/` — New features
- `fix/` — Bug fixes
- `security/` — Security patches
- `docs/` — Documentation

---

## License

MIT License — Free for personal, academic, and commercial use.

```
Copyright (c) 2026 NEC LMS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

**Built with care for engineering education.**

React · Express · MongoDB · Socket.io · Monaco Editor

**[⬆ back to top](#-nec-lms--enterprise-proctored-examination-platform)**

</div>
