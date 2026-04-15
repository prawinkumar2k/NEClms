-- 🏛️ LMS + Lab Control System: Production SQL Schema
-- Compatible with MySQL 8.0+ and SQL Server

-- 0. Cleanup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS submission_violations;
DROP TABLE IF EXISTS submission_answers;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS attendances;
DROP TABLE IF EXISTS course_enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS settings;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Departments
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 Labs
CREATE TABLE labs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    dept_id INT,
    location VARCHAR(255),
    capacity INT DEFAULT 30,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- 2. Users (Role-based identity)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hod', 'faculty', 'student', 'client') NOT NULL,
    dept_id INT,
    employee_id VARCHAR(50),      -- For staff
    roll_number VARCHAR(50),      -- For students
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. Courses
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    dept_id INT,
    faculty_id INT,               -- Primary instructor
    semester INT,
    academic_year VARCHAR(20),
    credits INT DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(id),
    FOREIGN KEY (faculty_id) REFERENCES users(id)
);

-- 4. Course Enrollments (M:N)
CREATE TABLE course_enrollments (
    course_id INT,
    student_id INT,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Devices (Lab Control)
CREATE TABLE devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hostname VARCHAR(100) UNIQUE NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(17),
    lab VARCHAR(100),
    dept_id INT,
    status ENUM('online', 'offline', 'locked', 'exam', 'maintenance') DEFAULT 'offline',
    last_seen DATETIME,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- 6. Exams
CREATE TABLE exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_id INT NOT NULL,
    faculty_id INT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration_min INT NOT NULL,
    total_marks INT NOT NULL,
    passing_marks INT DEFAULT 0,
    status ENUM('draft', 'scheduled', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    -- Security Flags
    disable_copy_paste BOOLEAN DEFAULT TRUE,
    require_fullscreen BOOLEAN DEFAULT TRUE,
    max_violations INT DEFAULT 5,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (faculty_id) REFERENCES users(id)
);

-- 7. Questions (Embedded approach in Mongo, relational here)
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL, -- A, B, C, D
    marks INT DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- 8. Submissions (Attempts)
CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    device_id INT,
    marks_obtained DECIMAL(5,2),
    status ENUM('in_progress', 'submitted', 'auto_submitted', 'terminated') DEFAULT 'in_progress',
    started_at DATETIME NOT NULL,
    submitted_at DATETIME,
    total_violations INT DEFAULT 0,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- 9. Violation Events
CREATE TABLE submission_violations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT,
    violation_type VARCHAR(50) NOT NULL, -- tab_switch, fullscreen_exit, etc.
    event_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- 📦 SAMPLE DATA
INSERT INTO departments (name, code, description) VALUES 
('Computer Science', 'CSE', 'Core engineering'),
('Cyber Security', 'CYBER', 'Network security');

INSERT INTO users (name, email, password_hash, role, dept_id) VALUES 
('System Admin', 'admin@example.com', 'hashed_pass', 'admin', 1),
('Dr. Smith', 'faculty@example.com', 'hashed_pass', 'faculty', 1);

INSERT INTO devices (hostname, ip_address, lab, status) VALUES 
('LAB-PC-01', '192.168.1.101', 'LAB-A', 'online'),
('LAB-PC-02', '192.168.1.102', 'LAB-A', 'offline');

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_submissions_exam ON submissions(exam_id);
CREATE INDEX idx_devices_status ON devices(status);
