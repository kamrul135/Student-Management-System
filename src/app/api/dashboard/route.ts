import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Get total counts
    const [totalStudents, totalTeachers, totalDepartments] = await Promise.all([
      db.student.count(),
      db.teacher.count(),
      db.department.count(),
    ]);

    // Get department-wise student count
    const studentsByDepartment = await db.student.groupBy({
      by: ["department"],
      _count: { id: true },
    });

    // Get attendance statistics for today
    const todayAttendance = await db.attendance.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { date: today },
    });

    // Get overall attendance percentage
    const totalAttendanceRecords = await db.attendance.count();
    const presentRecords = await db.attendance.count({
      where: { status: "present" },
    });
    const lateRecords = await db.attendance.count({
      where: { status: "late" },
    });

    const attendancePercentage = totalAttendanceRecords > 0
      ? Math.round(((presentRecords + lateRecords) / totalAttendanceRecords) * 100)
      : 0;

    // Get recent activities with user data
    const recentActivities = await db.activity.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
    });

    // Get semester-wise student count
    const studentsBySemester = await db.student.groupBy({
      by: ["semester"],
      _count: { id: true },
      orderBy: { semester: "asc" },
    });

    // Get average GPA by department
    const results = await db.result.findMany({
      where: { published: true },
      include: {
        student: { select: { department: true } },
      },
    });

    const gradePoints: Record<string, number> = {
      "A+": 4.0, "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "D": 1.0, "F": 0.0,
    };

    const departmentGpa: Record<string, { total: number; count: number }> = {};
    
    for (const result of results) {
      const dept = result.student.department;
      if (!departmentGpa[dept]) {
        departmentGpa[dept] = { total: 0, count: 0 };
      }
      departmentGpa[dept].total += gradePoints[result.grade || "F"] || 0;
      departmentGpa[dept].count++;
    }

    const averageGpaByDepartment = Object.entries(departmentGpa)
      .map(([department, data]) => ({
        department,
        averageGpa: data.count > 0 ? Number((data.total / data.count).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.averageGpa - a.averageGpa);

    // Monthly attendance trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    // Get all attendance records for the period
    const attendanceByDate = await db.attendance.groupBy({
      by: ["date"],
      _count: { id: true },
      where: { date: { gte: startDate } },
      orderBy: { date: "asc" },
    });

    const presentByDate = await db.attendance.groupBy({
      by: ["date"],
      _count: { id: true },
      where: {
        date: { gte: startDate },
        status: { in: ["present", "late"] },
      },
    });

    const attendanceTrend = attendanceByDate.map((day) => {
      const present = presentByDate.find((p) => p.date === day.date)?._count.id || 0;
      return {
        date: day.date,
        total: day._count.id,
        present,
        percentage: day._count.id > 0 ? Math.round((present / day._count.id) * 100) : 0,
      };
    });

    // Get top students by attendance
    const allAttendanceWithStudents = await db.attendance.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            department: true,
            semester: true,
          },
        },
      },
    });

    const studentAttendanceMap = new Map<string, {
      student: { id: string; name: string; department: string; semester: number };
      present: number;
      total: number;
    }>();

    for (const record of allAttendanceWithStudents) {
      if (!record.student) continue;
      
      const existing = studentAttendanceMap.get(record.studentId) || {
        student: record.student,
        present: 0,
        total: 0,
      };
      
      existing.total++;
      if (record.status === "present" || record.status === "late") {
        existing.present++;
      }
      
      studentAttendanceMap.set(record.studentId, existing);
    }

    const topStudents = Array.from(studentAttendanceMap.values())
      .map(s => ({
        ...s.student,
        percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);

    // Get gender distribution
    const genderDistribution = await db.student.groupBy({
      by: ["gender"],
      _count: { id: true },
    });

    return NextResponse.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalDepartments,
        attendancePercentage,
      },
      studentsByDepartment: studentsByDepartment.map((d) => ({
        department: d.department,
        count: d._count.id,
      })),
      studentsBySemester: studentsBySemester.map((s) => ({
        semester: s.semester,
        count: s._count.id,
      })),
      todayAttendance: todayAttendance.map((a) => ({
        status: a.status,
        count: a._count.id,
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        createdAt: a.createdAt,
        user: a.user,
      })),
      averageGpaByDepartment,
      attendanceTrend: attendanceTrend.slice(-14),
      topStudents,
      genderDistribution: genderDistribution.map(g => ({
        gender: g.gender || "Unknown",
        count: g._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
