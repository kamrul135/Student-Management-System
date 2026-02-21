import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id },
      include: {
        user: true,
        attendance: {
          orderBy: { date: "desc" },
          take: 30,
        },
        results: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, department, semester, roll, address, dateOfBirth, gender, profileImage } = body;

    const student = await db.student.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        department,
        semester: parseInt(semester),
        roll,
        address,
        dateOfBirth,
        gender,
        profileImage,
      },
    });

    // Update user email if changed
    if (email) {
      await db.user.update({
        where: { id: student.userId },
        data: { email, name },
      });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get student to find userId
    const student = await db.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete student (cascade will handle related records)
    await db.student.delete({
      where: { id },
    });

    // Delete user
    await db.user.delete({
      where: { id: student.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
