"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, GraduationCap, BookOpen, Calendar, BarChart3, Settings,
  LogOut, Moon, Sun, Search, Plus, Edit, Trash2, Download,
  Eye, Upload, Bell, Menu, X, Check, ChevronRight, ChevronLeft,
  Clock, TrendingUp, UserCheck, UserX, Home, FileText, Target,
  Award, Crown, Star, Filter, MoreVertical, Send, Mail, FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  studentId?: string | null;
  teacherId?: string | null;
  department?: string | null;
}

interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  semester: number;
  roll: string;
  profileImage?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: string;
  user?: User;
  _count?: { attendance: number; results: number };
  attendance?: Attendance[];
  results?: Result[];
}

interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: string;
  remark?: string;
  createdAt: string;
  student?: Student;
}

interface Result {
  id: string;
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade?: string;
  semester: number;
  examType: string;
  published: boolean;
  createdAt: string;
  student?: Student;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user?: { name: string; role: string };
}

interface DashboardData {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalDepartments: number;
    attendancePercentage: number;
  };
  studentsByDepartment: { department: string; count: number }[];
  studentsBySemester: { semester: number; count: number }[];
  todayAttendance: { status: string; count: number }[];
  recentActivities: Activity[];
  averageGpaByDepartment: { department: string; averageGpa: number }[];
  attendanceTrend: { date: string; total: number; present: number; percentage: number }[];
  topStudents: { id: string; name: string; department: string; semester: number; percentage: number }[];
  genderDistribution: { gender: string; count: number }[];
}

const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Business Administration"];
const subjects = ["Mathematics", "Physics", "Chemistry", "Programming", "Database Systems", "Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Software Engineering"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// Modern Teal/Blue color scheme
const COLORS = {
  primary: "#0D9488", // Teal 600
  primaryDark: "#0F766E", // Teal 700
  green: "#10B981", // Emerald 500
  coral: "#F97316", // Orange 500
  yellow: "#FBBF24", // Amber 400
  blue: "#3B82F6", // Blue 500
  navy: "#1e293b",
};

export default function StudentManagementSystem() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [studentForm, setStudentForm] = useState({
    name: "", email: "", phone: "", department: "Computer Science",
    semester: "1", roll: "", address: "", dateOfBirth: "", gender: "Male"
  });

  const [resultForm, setResultForm] = useState({
    studentId: "", subject: "Mathematics", marks: "", totalMarks: "100",
    semester: "1", examType: "Final", publish: false
  });

  const [emailForm, setEmailForm] = useState({
    subject: "", message: "", recipients: "all"
  });

  const [csvData, setCsvData] = useState<string>("");

  const filterParams = useMemo(() => ({
    search: searchQuery,
    department: departmentFilter,
    semester: semesterFilter,
  }), [searchQuery, departmentFilter, semesterFilter]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    }
  }, []);

  const fetchStudents = useCallback(async (search?: string, dept?: string, sem?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (dept && dept !== "all") params.append("department", dept);
      if (sem && sem !== "all") params.append("semester", sem);
      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  }, []);

  const fetchAttendance = useCallback(async (date?: string, dept?: string) => {
    try {
      const params = new URLSearchParams();
      params.append("date", date || dateFilter);
      if (dept && dept !== "all") params.append("department", dept);
      const res = await fetch(`/api/attendance?${params}`);
      const data = await res.json();
      setAttendanceRecords(data);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
  }, [dateFilter]);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch("/api/results");
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  }, []);

  // Load user from localStorage after mount (fixes hydration error)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchData = async () => {
      await Promise.all([fetchDashboard(), fetchStudents(), fetchAttendance(), fetchResults()]);
    };
    if (isMounted) fetchData();
    return () => { isMounted = false; };
  }, [user, fetchDashboard, fetchStudents, fetchAttendance, fetchResults]);

  useEffect(() => {
    if (!user || activeTab !== "students") return;
    const timeoutId = setTimeout(() => {
      fetchStudents(filterParams.search, filterParams.department, filterParams.semester);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [user, activeTab, filterParams, fetchStudents]);

  useEffect(() => {
    if (!user || activeTab !== "attendance") return;
    fetchAttendance(dateFilter, departmentFilter);
  }, [user, activeTab, dateFilter, departmentFilter, fetchAttendance]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        toast.success(`Welcome back, ${data.name}!`);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
  }, []);

  const handleAddStudent = useCallback(async () => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm),
      });
      if (res.ok) {
        toast.success("Student added successfully!");
        setStudentDialogOpen(false);
        setStudentForm({ name: "", email: "", phone: "", department: "Computer Science", semester: "1", roll: "", address: "", dateOfBirth: "", gender: "Male" });
        fetchStudents();
        fetchDashboard();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add student");
      }
    } catch {
      toast.error("Failed to add student");
    }
  }, [studentForm, fetchStudents, fetchDashboard]);

  const handleUpdateStudent = useCallback(async () => {
    if (!editingStudent) return;
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm),
      });
      if (res.ok) {
        toast.success("Student updated successfully!");
        setEditingStudent(null);
        setStudentDialogOpen(false);
        fetchStudents();
      } else {
        toast.error("Failed to update student");
      }
    } catch {
      toast.error("Failed to update student");
    }
  }, [editingStudent, studentForm, fetchStudents]);

  const handleDeleteStudent = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Student deleted successfully!");
        fetchStudents();
        fetchDashboard();
      }
    } catch {
      toast.error("Failed to delete student");
    }
  }, [fetchStudents, fetchDashboard]);

  const handleMarkAttendance = useCallback(async (studentId: string, status: string) => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, date: dateFilter, status }),
      });
      if (res.ok) {
        toast.success(`Attendance marked as ${status}`);
        fetchAttendance();
        fetchDashboard();
      }
    } catch {
      toast.error("Failed to mark attendance");
    }
  }, [dateFilter, fetchAttendance, fetchDashboard]);

  const handleBulkAttendance = useCallback(async (status: string) => {
    try {
      const records = students.map((s) => ({ studentId: s.id, date: dateFilter, status }));
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });
      if (res.ok) {
        toast.success(`Bulk attendance marked as ${status}`);
        fetchAttendance();
        fetchDashboard();
      }
    } catch {
      toast.error("Failed to mark bulk attendance");
    }
  }, [students, dateFilter, fetchAttendance, fetchDashboard]);

  const handleAddResult = useCallback(async () => {
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultForm),
      });
      if (res.ok) {
        toast.success("Result added successfully!");
        setResultDialogOpen(false);
        setResultForm({ studentId: "", subject: "Mathematics", marks: "", totalMarks: "100", semester: "1", examType: "Final", publish: false });
        fetchResults();
      } else {
        toast.error("Failed to add result");
      }
    } catch {
      toast.error("Failed to add result");
    }
  }, [resultForm, fetchResults]);

  const handlePublishResults = useCallback(async (studentId: string) => {
    try {
      const res = await fetch("/api/results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishAll: true, studentId }),
      });
      if (res.ok) {
        toast.success("Results published!");
        fetchResults();
      }
    } catch {
      toast.error("Failed to publish results");
    }
  }, [fetchResults]);

  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    try {
      const csvContent = [
        ["ID", "Name", "Email", "Department", "Semester", "Roll", "Phone", "Gender"],
        ...students.map(s => [s.id, s.name, s.email, s.department, s.semester, s.roll, s.phone || "", s.gender || ""])
      ].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export CSV");
    }
    setIsExporting(false);
  }, [students]);

  const handleImportCSV = useCallback(() => {
    try {
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",");
      const data = lines.slice(1).map(line => {
        const values = line.split(",");
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim() || "");
        return obj;
      });
      
      // Process each row
      data.forEach(async (row) => {
        if (row.Name && row.Email) {
          await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row.Name,
              email: row.Email,
              phone: row.Phone || "",
              department: row.Department || "Computer Science",
              semester: row.Semester || "1",
              roll: row.Roll || "",
              gender: row.Gender || "Male",
            }),
          });
        }
      });
      
      toast.success(`Imported ${data.length} students!`);
      setCsvImportOpen(false);
      setCsvData("");
      fetchStudents();
      fetchDashboard();
    } catch {
      toast.error("Failed to import CSV. Please check the format.");
    }
  }, [csvData, fetchStudents, fetchDashboard]);

  const handleSendEmail = useCallback(() => {
    // Simulate sending email
    toast.success(`Email sent to ${emailForm.recipients === "all" ? "all users" : emailForm.recipients}!`);
    setEmailDialogOpen(false);
    setEmailForm({ subject: "", message: "", recipients: "all" });
  }, [emailForm]);

  const handleExportPDF = useCallback((student: Student) => {
    const content = `
      <html>
        <head><title>Result - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #0D9488; border-bottom: 3px solid #10B981; padding-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background: #0D9488; color: white; }
            .info { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
            .gpa { background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>🎓 Student Result Report</h1>
          <div class="info">
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Roll No:</strong> ${student.roll}</p>
            <p><strong>Department:</strong> ${student.department}</p>
            <p><strong>Semester:</strong> ${student.semester}</p>
          </div>
          <table>
            <tr><th>Subject</th><th>Marks</th><th>Total</th><th>Grade</th></tr>
            ${student.results?.map(r => `<tr><td>${r.subject}</td><td>${r.marks}</td><td>${r.totalMarks}</td><td>${r.grade || 'N/A'}</td></tr>`).join("") || '<tr><td colspan="4">No results available</td></tr>'}
          </table>
          <div class="gpa">
            <span style="font-size: 14px; color: #666;">GPA</span><br>
            <span style="font-size: 32px; font-weight: bold; color: #10B981;">${student.results ? calculateGPA(student.results) : "0.00"}</span>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
      toast.success("PDF ready for download!");
    }
  }, []);

  const calculateGPA = useCallback((resultsList: Result[]) => {
    if (!resultsList.length) return "0.00";
    const gradePoints: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "D": 1.0, "F": 0.0 };
    const total = resultsList.reduce((sum, r) => sum + (gradePoints[r.grade || "F"] || 0), 0);
    return (total / resultsList.length).toFixed(2);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      document.documentElement.classList.toggle("dark", newValue);
      return newValue;
    });
  }, []);

  // Get top students from dashboard data
  const getTopStudents = useCallback(() => {
    return dashboardData?.topStudents || [];
  }, [dashboardData]);

  // Get students by gender from dashboard data
  const getStudentsByGender = useCallback(() => {
    if (!dashboardData?.genderDistribution) {
      return [
        { name: "Male", value: 0, color: COLORS.primary },
        { name: "Female", value: 0, color: COLORS.green },
      ];
    }
    return dashboardData.genderDistribution.map(g => ({
      name: g.gender,
      value: g.count,
      color: g.gender === "Male" ? COLORS.primary : COLORS.green,
    }));
  }, [dashboardData]);

  // Get weekly absent data
  const getWeeklyAbsent = useCallback(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(day => ({
      day,
      absent: Math.floor(Math.random() * 10) + 1,
    }));
  }, []);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "students", icon: Users, label: "Students" },
    { id: "attendance", icon: Calendar, label: "Attendance" },
    { id: "results", icon: FileText, label: "Results" },
  ];

  // Show loading while checking localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-[#0D9488] rounded-xl flex items-center justify-center animate-pulse">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Login Page
  if (!user) {
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D9488] via-teal-600 to-[#065F46] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Smart SMS</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Manage Your Students<br />With Ease</h1>
            <p className="text-white/80 text-lg">A comprehensive student management system for modern educational institutions.</p>
            
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Students", value: "30+", icon: Users },
                { label: "Teachers", value: "5+", icon: GraduationCap },
                { label: "Courses", value: "10+", icon: BookOpen },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <stat.icon className="h-6 w-6 text-white/70 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 text-white/60 text-sm">© 2024 Smart SMS. All rights reserved.</div>
        </div>
        
        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="h-10 w-10 bg-[#0D9488] rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Smart SMS</span>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Please enter your details to sign in</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleLogin(formData.get("email") as string, formData.get("password") as string);
            }} className="space-y-5">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="Enter your email" required className="h-12 bg-slate-100 dark:bg-slate-800 border-0" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input name="password" type="password" placeholder="Enter your password" required className="h-12 bg-slate-100 dark:bg-slate-800 border-0" />
              </div>
              <Button type="submit" className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">Demo Credentials</p>
              <div className="space-y-2">
                {[
                  { role: "Admin", email: "admin@school.edu", pass: "admin123", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
                  { role: "Teacher", email: "teacher1@school.edu", pass: "teacher123", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                  { role: "Student", email: "student1@school.edu", pass: "student123", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
                ].map((cred) => (
                  <div key={cred.role} className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded-lg">
                    <Badge className={cred.color}>{cred.role}</Badge>
                    <span className="text-xs text-gray-500">{cred.email} / {cred.pass}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${sidebarCollapsed ? "w-20" : "w-64"} bg-[#0D9488] transition-all duration-300 z-50 flex flex-col`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && <span className="text-xl font-bold text-white">Smart SMS</span>}
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          
          {user.role === "admin" && (
            <>
              <div className="h-px bg-white/20 my-4" />
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "settings" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
              </button>
            </>
          )}
        </div>
        
        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
        </button>
        
        {/* User Profile */}
        <div className="mt-auto p-4">
          <div className="h-px bg-white/20 mb-4" />
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white/30">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-white/20 text-white">{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/60 capitalize">{user.role}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="text-white/60 hover:text-white">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-green-400">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-green-500 text-white">{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">Hello, {user.name.split(" ")[0]}! 👋</p>
                  <p className="text-slate-400 text-sm">We hope you&apos;re having a great day.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search..." className="pl-10 w-64 bg-slate-700 border-0 text-white placeholder:text-slate-400" />
              </div>
              
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-slate-300 hover:text-white">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <p className="font-semibold mb-3">Notifications</p>
                    <div className="space-y-2">
                      <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <UserCheck className="h-4 w-4 text-green-500 mt-0.5" />
                        <div><p className="text-sm">New student registered</p><p className="text-xs text-gray-500">2 mins ago</p></div>
                      </div>
                      <div className="flex gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div><p className="text-sm">Results published</p><p className="text-xs text-gray-500">1 hour ago</p></div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-slate-300 hover:text-white">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-[#0D9488] text-white">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && dashboardData && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Total Students", value: dashboardData.stats.totalStudents, icon: Users, color: "bg-[#FF9A8B]" },
                    { label: "Total Teachers", value: dashboardData.stats.totalTeachers, icon: GraduationCap, color: "bg-[#0D9488]" },
                    { label: "Present Today", value: attendanceRecords.filter(a => a.status === "present").length, icon: UserCheck, color: "bg-green-500" },
                    { label: "Absent Today", value: attendanceRecords.filter(a => a.status === "absent").length, icon: UserX, color: "bg-red-500" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card className="border-0 shadow-sm overflow-hidden">
                        <div className={`h-1 ${stat.color}`} />
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`h-12 w-12 rounded-xl ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                              <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Main Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Attendance Trend */}
                  <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Attendance Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dashboardData.attendanceTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="percentage" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Students by Gender */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Students by Gender</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={getStudentsByGender()} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                            {getStudentsByGender().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-6 mt-4">
                        {getStudentsByGender().map((g) => (
                          <div key={g.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                            <span className="text-sm text-gray-500">{g.name}: {g.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Second Row */}
                <div className="grid gap-6 lg:grid-cols-4">
                  {/* Calendar Attendance */}
                  <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Calendar Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {years.map((y) => (
                          <button
                            key={y}
                            onClick={() => setSelectedYear(y)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedYear === y ? "bg-[#0D9488] text-white" : "bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {months.map((m, i) => (
                          <button
                            key={m}
                            onClick={() => setSelectedMonth(i)}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              selectedMonth === i ? "bg-green-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Students */}
                  <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Top Students</CardTitle>
                      <Button variant="ghost" size="sm" className="text-green-600">View All</Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getTopStudents().slice(0, 3).map((s, i) => (
                          <div key={s.id} className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              i === 0 ? "bg-green-100 text-green-600" : i === 1 ? "bg-purple-100 text-purple-600" : "bg-amber-100 text-amber-600"
                            }`}>
                              {i === 0 ? <Crown className="h-5 w-5" /> : i === 1 ? <Award className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{s.name}</p>
                              <p className="text-xs text-gray-500">{s.department}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{s.percentage}%</p>
                              <p className="text-xs text-gray-500">Attendance</p>
                            </div>
                            <Badge className={i === 0 ? "bg-green-100 text-green-700" : i === 1 ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}>
                              {i + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Third Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Students by Department */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Students by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dashboardData.studentsByDepartment} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" />
                          <YAxis dataKey="department" type="category" width={80} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Weekly Absent */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Weekly Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={getWeeklyAbsent()}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="day" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis />
                          <Radar name="Absent" dataKey="absent" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* GPA by Department */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Avg GPA by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dashboardData.averageGpaByDepartment}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="department" tick={{ fontSize: 9 }} />
                          <YAxis domain={[0, 4]} />
                          <Tooltip />
                          <Bar dataKey="averageGpa" fill="#0D9488" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <motion.div key="students" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Card className="border-0 shadow-sm flex-1 w-full">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-50 dark:bg-slate-800 border-0" />
                        </div>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger className="w-full sm:w-48 bg-slate-50 dark:bg-slate-800 border-0"><SelectValue placeholder="Department" /></SelectTrigger>
                          <SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                          <SelectTrigger className="w-full sm:w-32 bg-slate-50 dark:bg-slate-800 border-0"><SelectValue placeholder="Semester" /></SelectTrigger>
                          <SelectContent><SelectItem value="all">All</SelectItem>{[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCSV} disabled={isExporting} className="bg-white dark:bg-slate-800">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    {(user.role === "admin" || user.role === "teacher") && (
                      <>
                        <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="bg-white dark:bg-slate-800">
                              <Upload className="h-4 w-4 mr-2" /> Import CSV
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Import Students from CSV</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-sm text-gray-500">CSV format: Name, Email, Phone, Department, Semester, Roll, Gender</p>
                              <Textarea 
                                placeholder="Paste CSV data here..." 
                                value={csvData} 
                                onChange={(e) => setCsvData(e.target.value)}
                                className="h-48 font-mono text-sm"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setCsvImportOpen(false)}>Cancel</Button>
                              <Button onClick={handleImportCSV} className="bg-green-500 hover:bg-green-600">Import</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={studentDialogOpen} onOpenChange={(open) => { setStudentDialogOpen(open); if (!open) { setEditingStudent(null); setStudentForm({ name: "", email: "", phone: "", department: "Computer Science", semester: "1", roll: "", address: "", dateOfBirth: "", gender: "Male" }); }}}>
                          <DialogTrigger asChild>
                            <Button className="bg-[#0D9488] hover:bg-[#0F766E]"><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader><DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2"><Label>Full Name *</Label><Input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} /></div>
                              <div className="grid gap-2"><Label>Email *</Label><Input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} /></div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Department</Label>
                                  <Select value={studentForm.department} onValueChange={(v) => setStudentForm({ ...studentForm, department: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2"><Label>Semester</Label>
                                  <Select value={studentForm.semester} onValueChange={(v) => setStudentForm({ ...studentForm, semester: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Roll Number *</Label><Input value={studentForm.roll} onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Phone</Label><Input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} /></div>
                              </div>
                              <div className="grid gap-2"><Label>Gender</Label>
                                <Select value={studentForm.gender} onValueChange={(v) => setStudentForm({ ...studentForm, gender: v })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2"><Label>Address</Label><Textarea value={studentForm.address} onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })} /></div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                              <Button onClick={editingStudent ? handleUpdateStudent : handleAddStudent} className="bg-[#0D9488] hover:bg-[#0F766E]">{editingStudent ? "Update" : "Add Student"}</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                          <TableHead className="font-semibold">Student</TableHead>
                          <TableHead className="font-semibold">Roll No</TableHead>
                          <TableHead className="font-semibold">Department</TableHead>
                          <TableHead className="font-semibold">Semester</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={student.profileImage} />
                                  <AvatarFallback className="bg-[#0D9488] text-white">{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div><p className="font-medium">{student.name}</p><p className="text-sm text-gray-500">{student.email}</p></div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">{student.roll}</TableCell>
                            <TableCell>{student.department}</TableCell>
                            <TableCell><Badge variant="secondary">Sem {student.semester}</Badge></TableCell>
                            <TableCell className="text-gray-500">{student.phone || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Sheet>
                                  <SheetTrigger asChild><Button variant="ghost" size="icon" onClick={() => setSelectedStudent(student)}><Eye className="h-4 w-4" /></Button></SheetTrigger>
                                  <SheetContent>
                                    <SheetHeader><SheetTitle>Student Profile</SheetTitle></SheetHeader>
                                    <div className="mt-6 space-y-6">
                                      <div className="flex flex-col items-center">
                                        <Avatar className="h-20 w-20">
                                          <AvatarImage src={selectedStudent?.profileImage} />
                                          <AvatarFallback className="bg-[#0D9488] text-white text-xl">{selectedStudent?.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="mt-4 text-xl font-semibold">{selectedStudent?.name}</h3>
                                        <Badge>{selectedStudent?.department}</Badge>
                                      </div>
                                      <div className="grid gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        {[["Email", selectedStudent?.email], ["Roll No", selectedStudent?.roll], ["Semester", `Semester ${selectedStudent?.semester}`], ["Phone", selectedStudent?.phone || "-"], ["Gender", selectedStudent?.gender || "-"]].map(([l, v]) => (
                                          <div key={l as string} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{l}</span>
                                            <span className="font-medium">{v}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <span className="font-medium">GPA</span>
                                        <span className="text-2xl font-bold text-green-600">{selectedStudent?.results ? calculateGPA(selectedStudent.results) : "0.00"}</span>
                                      </div>
                                      {selectedStudent?.results && selectedStudent.results.length > 0 && (
                                        <Button onClick={() => handleExportPDF(selectedStudent)} variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download Result PDF</Button>
                                      )}
                                    </div>
                                  </SheetContent>
                                </Sheet>
                                {(user.role === "admin" || user.role === "teacher") && (
                                  <>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingStudent(student); setStudentForm({ name: student.name, email: student.email, phone: student.phone || "", department: student.department, semester: String(student.semester), roll: student.roll, address: student.address || "", dateOfBirth: student.dateOfBirth || "", gender: student.gender || "Male" }); setStudentDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                    {user.role === "admin" && <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {students.length === 0 && <div className="text-center py-12 text-gray-500">No students found</div>}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-44 bg-slate-50 dark:bg-slate-800 border-0" />
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger className="w-48 bg-slate-50 dark:bg-slate-800 border-0"><SelectValue placeholder="Department" /></SelectTrigger>
                          <SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {(user.role === "admin" || user.role === "teacher") && (
                    <Button variant="outline" onClick={() => handleBulkAttendance("present")} className="bg-white dark:bg-slate-800"><Check className="h-4 w-4 mr-2" /> Mark All Present</Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: "Present", value: attendanceRecords.filter(a => a.status === "present").length, icon: UserCheck, bg: "bg-green-500" },
                    { label: "Absent", value: attendanceRecords.filter(a => a.status === "absent").length, icon: UserX, bg: "bg-red-500" },
                    { label: "Late", value: attendanceRecords.filter(a => a.status === "late").length, icon: Clock, bg: "bg-amber-500" },
                  ].map((s) => (
                    <Card key={s.label} className="border-0 shadow-sm">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                          <s.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold">{s.value}</p>
                          <p className="text-sm text-gray-500">{s.label} Today</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Mark Attendance - {dateFilter}</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                          <TableHead className="font-semibold">Student</TableHead>
                          <TableHead className="font-semibold">Roll No</TableHead>
                          <TableHead className="font-semibold">Department</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          {(user.role === "admin" || user.role === "teacher") && <TableHead className="text-center font-semibold">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const attendance = attendanceRecords.find(a => a.studentId === student.id);
                          return (
                            <TableRow key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-[#0D9488] text-white text-xs">{student.name.charAt(0)}</AvatarFallback></Avatar>
                                  <span className="font-medium">{student.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">{student.roll}</TableCell>
                              <TableCell>{student.department}</TableCell>
                              <TableCell>
                                <Badge variant={attendance?.status === "present" ? "default" : attendance?.status === "absent" ? "destructive" : attendance?.status === "late" ? "secondary" : "outline"}>
                                  {attendance?.status || "Not Marked"}
                                </Badge>
                              </TableCell>
                              {(user.role === "admin" || user.role === "teacher") && (
                                <TableCell>
                                  <div className="flex justify-center gap-1">
                                    <Button size="sm" variant={attendance?.status === "present" ? "default" : "outline"} onClick={() => handleMarkAttendance(student.id, "present")} className="w-8 h-8 p-0 bg-green-500 hover:bg-green-600"><Check className="h-4 w-4" /></Button>
                                    <Button size="sm" variant={attendance?.status === "late" ? "secondary" : "outline"} onClick={() => handleMarkAttendance(student.id, "late")} className="w-8 h-8 p-0"><Clock className="h-4 w-4" /></Button>
                                    <Button size="sm" variant={attendance?.status === "absent" ? "destructive" : "outline"} onClick={() => handleMarkAttendance(student.id, "absent")} className="w-8 h-8 p-0"><X className="h-4 w-4" /></Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Results Tab */}
            {activeTab === "results" && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Results Management</h2>
                    <p className="text-sm text-gray-500">Manage and publish student results</p>
                  </div>
                  {(user.role === "admin" || user.role === "teacher") && (
                    <div className="flex gap-2">
                      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="bg-white dark:bg-slate-800"><Mail className="h-4 w-4 mr-2" /> Send Notification</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Send Email Notification</DialogTitle></DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2"><Label>Recipients</Label>
                              <Select value={emailForm.recipients} onValueChange={(v) => setEmailForm({ ...emailForm, recipients: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Students</SelectItem>
                                  <SelectItem value="published">Students with Published Results</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2"><Label>Subject</Label><Input value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} placeholder="Results Published" /></div>
                            <div className="grid gap-2"><Label>Message</Label><Textarea value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} placeholder="Your results have been published..." className="h-32" /></div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSendEmail} className="bg-[#0D9488]"><Send className="h-4 w-4 mr-2" /> Send Email</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-[#0D9488] hover:bg-[#0F766E]"><Plus className="h-4 w-4 mr-2" /> Add Result</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader><DialogTitle>Add New Result</DialogTitle></DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2"><Label>Student</Label>
                              <Select value={resultForm.studentId} onValueChange={(v) => setResultForm({ ...resultForm, studentId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.roll})</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2"><Label>Subject</Label>
                                <Select value={resultForm.subject} onValueChange={(v) => setResultForm({ ...resultForm, subject: v })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2"><Label>Semester</Label>
                                <Select value={resultForm.semester} onValueChange={(v) => setResultForm({ ...resultForm, semester: v })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>{[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2"><Label>Marks</Label><Input type="number" value={resultForm.marks} onChange={(e) => setResultForm({ ...resultForm, marks: e.target.value })} /></div>
                              <div className="grid gap-2"><Label>Total</Label><Input type="number" value={resultForm.totalMarks} onChange={(e) => setResultForm({ ...resultForm, totalMarks: e.target.value })} /></div>
                            </div>
                            <div className="grid gap-2"><Label>Exam Type</Label>
                              <Select value={resultForm.examType} onValueChange={(v) => setResultForm({ ...resultForm, examType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Mid-term", "Final", "Quiz", "Assignment"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2"><Checkbox id="publish" checked={resultForm.publish} onCheckedChange={(c) => setResultForm({ ...resultForm, publish: c as boolean })} /><Label htmlFor="publish">Publish immediately</Label></div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setResultDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddResult} className="bg-[#0D9488]">Add Result</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                          <TableHead className="font-semibold">Student</TableHead>
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="font-semibold">Marks</TableHead>
                          <TableHead className="font-semibold">Grade</TableHead>
                          <TableHead className="font-semibold">Semester</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.slice(0, 20).map((result) => (
                          <TableRow key={result.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell><p className="font-medium">{result.student?.name}</p><p className="text-sm text-gray-500">{result.student?.roll}</p></TableCell>
                            <TableCell>{result.subject}</TableCell>
                            <TableCell><span className="font-bold text-[#0D9488]">{result.marks}</span>/{result.totalMarks}</TableCell>
                            <TableCell>
                              <Badge variant={result.grade?.startsWith("A") ? "default" : result.grade?.startsWith("B") ? "secondary" : "destructive"}>{result.grade}</Badge>
                            </TableCell>
                            <TableCell>Sem {result.semester}</TableCell>
                            <TableCell><Badge variant={result.published ? "default" : "secondary"} className={result.published ? "bg-green-500" : ""}>{result.published ? "Published" : "Draft"}</Badge></TableCell>
                            <TableCell className="text-right">
                              {(user.role === "admin" || user.role === "teacher") && !result.published && (
                                <Button size="sm" onClick={() => handlePublishResults(result.studentId)} className="bg-green-500 hover:bg-green-600">Publish</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && user.role === "admin" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-2xl">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look of your dashboard</CardDescription></CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="h-5 w-5 text-[#0D9488]" /> : <Sun className="h-5 w-5 text-amber-500" />}
                        <div><p className="font-medium">Dark Mode</p><p className="text-sm text-gray-500">Toggle dark theme</p></div>
                      </div>
                      <Button onClick={toggleDarkMode}>{darkMode ? "Light Mode" : "Dark Mode"}</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div><p className="font-medium">Export Students</p><p className="text-sm text-gray-500">Download as CSV</p></div>
                      <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" /> Export</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div><p className="font-medium">Import Students</p><p className="text-sm text-gray-500">Upload CSV file</p></div>
                      <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Import</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>System Info</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      {[["Version", "1.0.0"], ["Database", "SQLite"], ["Framework", "Next.js 16"]].map(([l, v]) => (
                        <div key={l} className="flex justify-between text-sm">
                          <span className="text-gray-500">{l}</span>
                          <span className="font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
