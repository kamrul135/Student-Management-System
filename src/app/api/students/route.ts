import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch all students with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const search = searchParams.get("search");
    const semester = searchParams.get("semester");

    const where: Record<string, unknown> = {};

    if (department && department !== "all") {
      where.department = department;
    }

    if (semester && semester !== "all") {
      where.semester = parseInt(semester);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { roll: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const students = await db.student.findMany({
      where,
      include: {
        user: true,
        _count: {
          select: { attendance: true, results: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST - Create a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, department, semester, roll, address, dateOfBirth, gender, password } = body;

    // Create user first
    const user = await db.user.create({
      data: {
        email,
        password: password || "student123",
        name,
        role: "student",
      },
    });

    // Create student profile
    const student = await db.student.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        department,
        semester: parseInt(semester),
        roll,
        address,
        dateOfBirth,
        gender,
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        userId: user.id,
        type: "student_add",
        description: `New student ${name} registered in ${department}`,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
