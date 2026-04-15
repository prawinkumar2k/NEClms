import { 
  LayoutDashboard, Users, Monitor, BookOpen, BarChart3, Shield, 
  ClipboardList, Activity, GraduationCap, UserCheck, AlertTriangle, Plus, 
  Sparkles, FileText, HelpCircle, Eye, User, CheckCircle2, Clock, 
  PlayCircle, Settings, ShieldCheck, Download
} from "lucide-react";
import { ROUTES } from "./routes";

export const getAdminNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.ADMIN_DASHBOARD },
  {
    label: "Users", icon: <Users className="w-4 h-4" />, children: [
      { label: "User List", path: ROUTES.ADMIN_USERS },
      { label: "Add One User", path: ROUTES.ADMIN_USERS_ADD },
      { label: "Add Many Users", path: ROUTES.ADMIN_USERS_BULK },
    ],
  },
  {
    label: "Computers", icon: <Monitor className="w-4 h-4" />, children: [
      { label: "PC List", path: ROUTES.ADMIN_DEVICES },
      { label: "Add New PC", path: ROUTES.ADMIN_DEVICES_REGISTER },
    ],
  },
  { label: "Lab Management", icon: <Activity className="w-4 h-4" />, path: ROUTES.ADMIN_LAB },
  { label: "All Tests", icon: <BookOpen className="w-4 h-4" />, path: ROUTES.ADMIN_EXAMS },
  { label: "Live View", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.ADMIN_MONITORING },
  {
    label: "History", icon: <ClipboardList className="w-4 h-4" />, children: [
      { label: "Login History", path: ROUTES.ADMIN_LOGS_LOGIN },
      { label: "Recent Actions", path: ROUTES.ADMIN_LOGS_ACTIVITY },
      { label: "Alerts", path: ROUTES.ADMIN_VIOLATIONS },
    ],
  },
  {
    label: "Security & Settings", icon: <Shield className="w-4 h-4" />, children: [
      { label: "System Settings", path: ROUTES.ADMIN_SETTINGS },
      { label: "Security rules", path: ROUTES.ADMIN_SECURITY },
    ],
  },
  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/admin/profile" },
];

export const getHODNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.HOD_DASHBOARD },
  {
    label: "Department", icon: <Users className="w-4 h-4" />, children: [
       { label: "Teacher List", path: ROUTES.HOD_FACULTY },
       { label: "Student List", path: ROUTES.HOD_STUDENTS },
    ]
  },
  {
    label: "Tests", icon: <BookOpen className="w-4 h-4" />, children: [
       { label: "Test List", path: ROUTES.HOD_EXAMS },
       { label: "Add Test", path: ROUTES.FACULTY_CREATE_EXAM },
       { label: "Questions", path: ROUTES.FACULTY_QUESTION_BANK },
       { label: "Results", path: ROUTES.FACULTY_RESULTS },
    ]
  },
  { label: "Watch Live", icon: <Eye className="w-4 h-4" />, path: ROUTES.HOD_MONITORING },
  { label: "Security Alerts", icon: <ShieldCheck className="w-4 h-4" />, path: ROUTES.FACULTY_VIOLATIONS },
  { label: "Evidence Vault", icon: <Camera className="w-4 h-4" />, path: ROUTES.FACULTY_EVIDENCE_VAULT },
  { label: "Result Paper", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.HOD_REPORTS },

  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/hod/profile" },
];

export const getFacultyNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.FACULTY_DASHBOARD },
  { label: "Create Test", icon: <FileText className="w-4 h-4" />, path: ROUTES.FACULTY_CREATE_EXAM },
  { label: "Question Bank", icon: <HelpCircle className="w-4 h-4" />, path: ROUTES.FACULTY_QUESTION_BANK },
  { label: "Live View", icon: <Eye className="w-4 h-4" />, path: ROUTES.FACULTY_MONITORING },
  { label: "Security Alerts", icon: <ShieldCheck className="w-4 h-4" />, path: ROUTES.FACULTY_VIOLATIONS },
  { label: "Test Results", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.FACULTY_RESULTS },

  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/faculty/profile" },
];

export const getStudentNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.STUDENT_DASHBOARD },
  { label: "My Tests", icon: <FileText className="w-4 h-4" />, path: ROUTES.STUDENT_EXAMS },
  { label: "Coding Lab", icon: <PlayCircle className="w-4 h-4" />, path: "/student/playground" },
  { label: "My Grades", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.STUDENT_RESULTS },
  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/student/profile" },
];
