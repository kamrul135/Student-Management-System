import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");
    const department = searchParams.get("department");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (date) {
      where.date = date;
    }

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (department && department !== "all") {
      where.student = { department };
    }

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            roll: true,
            department: true,
            semester: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// POST - Mark attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle bulk attendance
    if (Array.isArray(body)) {
      const results = [];
      for (const record of body) {
        const attendance = await db.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: record.date,
            },
          },
          update: {
            status: record.status,
            remark: record.remark,
          },
          create: {
            studentId: record.studentId,
            date: record.date,
            status: record.status,
            remark: record.remark,
          },
        });
        results.push(attendance);
      }

      // Log activity
      await db.activity.create({
        data: {
          type: "attendance",
          description: `Bulk attendance marked for ${results.length} students`,
        },
      });

      return NextResponse.json(results);
    }

    // Single attendance
    const { studentId, date, status, remark } = body;

    const attendance = await db.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date,
        },
      },
      update: {
        status,
        remark,
      },
      create: {
        studentId,
        date,
        status,
        remark,
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        studentId,
        type: "attendance",
        description: `Attendance marked as ${status}`,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
