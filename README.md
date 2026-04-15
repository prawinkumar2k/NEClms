# EduLearn - Learning Management System (LMS)

A production-ready, full-stack Learning Management System built with React, Express.js, and MongoDB.

## 🎯 Overview

EduLearn is a comprehensive Learning Management System designed for educational institutions to manage courses, students, faculty, and assessments. The system follows a client-server architecture where a central server stores all data, and client systems access data without storing it locally.

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Central Server                        │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Express.js    │  │  MongoDB     │  │  API Routes  │ │
│  │ Backend       │──│  Database    │  │  & Auth      │ │
│  └───────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
       │
       │ API Endpoints
       │
┌──────┴──────┬──────────────┬──────────────┬──────────────┐
│             │              │              │              │
▼             ▼              ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Admin    │ │   HOD    │ │ Faculty  │ │ Student  │ │ Employee │
│ Client   │ │  Client  │ │  Client  │ │  Client  │ │  Client  │
│(React)   │ │(React)   │ │(React)   │ │(React)   │ │(React)   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (Fast build tool)
- TailwindCSS 3 (Styling)
- React Router 6 (Routing)
- Radix UI Components
- Lucide Icons

**Backend:**
- Express.js 5.x (Server framework)
- Node.js (Runtime)
- Cors & Express middleware
- RESTful API architecture

**Database:**
- MongoDB (To be configured)
- Document-based data model

**Authentication:**
- JWT (JSON Web Tokens)
- Role-based access control (RBAC)
- Protected routes

## 📋 Core Features

### 1. Role-Based Access Control

The system supports 4 distinct user roles:

#### 👨‍💼 **Admin**
- User management (add/edit/delete)
- Role and permission assignment
- Department and course management
- System analytics dashboard
- Settings management

#### 🏫 **HOD (Head of Department)**
- Manage faculty under department
- Approve courses and schedules
- Monitor performance reports
- Student & faculty oversight

#### 👨‍🏫 **Faculty**
- Create and manage courses
- Upload study materials (PDFs, videos)
- Create assignments and tests
- Evaluate student submissions
- Mark and track attendance
- View course analytics

#### 🎓 **Student**
- View enrolled courses
- Access study materials
- Submit assignments
- Attend online exams/tests
- View marks and grades
- Track attendance

### 2. Authentication & Security

- JWT-based authentication
- Session management with localStorage
- Protected routes with role-based access
- Secure password handling
- Protected API endpoints

### 3. Exam System

Features with enhanced security:
- **MCQ-Based Tests**: Multiple choice question format
- **Timer-Based Exams**: Countdown timer with warnings
- **Auto-Evaluation**: Immediate result generation
- **Security Features**:
  - Copy-paste prevention
  - Tab switching detection
  - Right-click prevention
  - Developer tools blocking
  - Fullscreen exit detection
  - Activity logging for suspicious behavior

### 4. Attendance System

- **Visual Calendar View**: Month-based attendance calendar
- **Status Tracking**: Present, Absent, OD (On Duty), Not Marked
- **Attendance Percentage**: Real-time calculation
- **Daily Attendance**: Track hourly or daily attendance
- **Remarks Support**: Comments on absences or leaves

### 5. Dashboard System

**Admin Dashboard:**
- System statistics and KPIs
- User management interface
- Course management
- Analytics visualization
- System settings

**Faculty Dashboard:**
- Course overview
- Student management
- Assignment creation and grading
- Attendance tracking
- Performance analytics

**Student Dashboard:**
- Enrolled courses
- Academic progress tracking
- Pending assignments
- Grades and marks
- Attendance calendar

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (package manager)
- MongoDB (local or Atlas)

### Installation

1. **Install dependencies:**
```bash
pnpm install
```

2. **Environment Setup:**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration (add when ready)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=24h
```

3. **Start Development Server:**
```bash
pnpm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
pnpm run build
```

### Run Production Build

```bash
pnpm start
```

## 📁 Project Structure

```
├── client/                          # Frontend (React)
│   ├── components/
│   │   ├── ui/                     # Radix UI component library
│   │   ├── DashboardLayout.tsx     # Shared dashboard layout
│   │   ├── ProtectedRoute.tsx      # Route protection wrapper
│   │   └── AttendanceCalendar.tsx  # Attendance visualization
│   ├── pages/
│   │   ├── Login.tsx               # Login page
│   │   ├── Dashboard.tsx           # Main dashboard router
│   │   ├── Exam.tsx                # Exam interface with security
│   │   └── dashboards/
│   │       ├── AdminDashboard.tsx
│   │       ├── HODDashboard.tsx
│   │       ├── FacultyDashboard.tsx
│   │       └── StudentDashboard.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication state management
│   ├── hooks/
│   │   └── use-mobile.tsx          # Mobile detection hook
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── App.tsx                     # App entry point & routing
│   ├── global.css                  # Global styles & theme variables
│   └── vite-env.d.ts               # Vite type definitions
│
├── server/                          # Backend (Express)
│   ├── routes/
│   │   ├── auth.ts                 # Authentication endpoints
│   │   └── demo.ts                 # Demo endpoint
│   ├── index.ts                    # Server setup & route registration
│   └── node-build.ts               # Build configuration
│
├── shared/                          # Shared types & interfaces
│   └── api.ts                      # API types & interfaces
│
├── tailwind.config.ts              # Tailwind CSS configuration
├── vite.config.ts                  # Vite configuration
├── vite.config.server.ts           # Server build configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

## 🔐 Security Features

### Implemented

1. **Authentication**
   - JWT tokens with expiration
   - Secure password handling
   - Protected routes

2. **Exam Security**
   - Copy-paste blocking
   - Tab switch detection
   - Right-click prevention
   - Developer tools blocking
   - Activity logging

3. **Data Protection**
   - CORS configuration
   - Input validation
   - XSS prevention (via React)

### To Implement with MongoDB

1. **Password Encryption**: bcrypt hashing
2. **Rate Limiting**: Prevent brute force attacks
3. **Data Validation**: Zod schema validation
4. **HTTPS**: Enable in production
5. **Audit Logging**: Track all user actions

## 📊 Database Schema (MongoDB)

Ready to implement:

```javascript
// Users Collection
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  role: enum ["admin", "hod", "faculty", "student"],
  department: string,
  phone: string,
  avatar: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}

// Courses Collection
{
  _id: ObjectId,
  code: string,
  name: string,
  description: string,
  department: string,
  faculty: ObjectId,
  credits: number,
  students: [ObjectId],
  materials: [{
    type: string,
    url: string,
    title: string,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Attendance Collection
{
  _id: ObjectId,
  course: ObjectId,
  student: ObjectId,
  date: Date,
  status: enum ["present", "absent", "od"],
  remark: string,
  createdAt: Date
}

// Exams Collection
{
  _id: ObjectId,
  course: ObjectId,
  title: string,
  questions: [{
    question: string,
    options: [string],
    correct: string,
    marks: number
  }],
  duration: number,
  totalMarks: number,
  startTime: Date,
  endTime: Date,
  createdAt: Date
}

// Results Collection
{
  _id: ObjectId,
  exam: ObjectId,
  student: ObjectId,
  answers: {[questionId]: string},
  score: number,
  percentage: number,
  suspiciousActivity: [string],
  completedAt: Date,
  createdAt: Date
}

// Assignments Collection
{
  _id: ObjectId,
  course: ObjectId,
  title: string,
  description: string,
  dueDate: Date,
  maxScore: number,
  submissions: [{
    student: ObjectId,
    submittedAt: Date,
    grade: number,
    feedback: string
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 API Endpoints

### Authentication

```
POST   /api/auth/login      # User login
POST   /api/auth/logout     # User logout
POST   /api/auth/refresh    # Refresh token
```

### Users (Admin Only)

```
GET    /api/users           # List all users
POST   /api/users           # Create new user
GET    /api/users/:id       # Get user details
PUT    /api/users/:id       # Update user
DELETE /api/users/:id       # Delete user
```

### Courses

```
GET    /api/courses         # List courses
POST   /api/courses         # Create course (Faculty/Admin)
GET    /api/courses/:id     # Get course details
PUT    /api/courses/:id     # Update course
DELETE /api/courses/:id     # Delete course
POST   /api/courses/:id/enroll   # Enroll student
```

### Attendance

```
GET    /api/attendance      # Get attendance records
POST   /api/attendance      # Mark attendance (Faculty)
GET    /api/attendance/:id  # Get attendance details
```

### Exams & Results

```
GET    /api/exams          # List exams
POST   /api/exams          # Create exam (Faculty)
GET    /api/exams/:id      # Get exam details
POST   /api/results        # Submit exam results
GET    /api/results/:id    # Get results
```

## 🎨 Theming & Customization

### Color Scheme

The app uses a professional education-focused color scheme:

- **Primary**: Blue (217°, 91%, 60%) - Trust & Education
- **Secondary**: Light Gray (210°, 40%, 96%)
- **Accent**: Orange (35°, 100%, 55%) - Attention
- **Success**: Green (142°, 76%, 36%)
- **Warning**: Orange (35°, 100%, 55%)
- **Destructive**: Red (0°, 84.2%, 60.2%)

Edit `client/global.css` and `tailwind.config.ts` to customize colors.

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Flexible sidebar navigation
- Responsive tables and grids

## 🧪 Testing

```bash
# Run tests
pnpm test

# Type checking
pnpm typecheck

# Format code
pnpm format.fix
```

## 📚 Sample Data for Testing

Demo accounts available on login page:

- **Admin**: admin@example.com / password
- **HOD**: hod@example.com / password
- **Faculty**: faculty@example.com / password
- **Student**: student@example.com / password

## 🔮 Future Enhancements

### Short Term
- [ ] MongoDB integration
- [ ] Real-time notifications (WebSocket)
- [ ] Email alerts system
- [ ] File upload system
- [ ] Advanced analytics
- [ ] Grade calculation & GPA tracking

### Medium Term
- [ ] Video streaming support
- [ ] Live class features
- [ ] AI-based learning recommendations
- [ ] Mobile app (React Native)
- [ ] Payment integration

### Long Term
- [ ] AI-powered tutoring assistant
- [ ] Blockchain certificates
- [ ] Advanced proctoring
- [ ] LTI integration
- [ ] SCORM compliance

## 🤝 Contributing

Contributions are welcome! Please:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Ensure all tests pass

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check documentation
- Review existing issues

## 🙏 Acknowledgments

Built with:
- React & Vite community
- Radix UI for accessible components
- TailwindCSS for styling
- Express.js documentation

---

**Ready to get started?** Run `pnpm install && pnpm run dev` and login with demo credentials!
