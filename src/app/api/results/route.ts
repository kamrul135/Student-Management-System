import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to calculate grade
function calculateGrade(marks: number, totalMarks: number): string {
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 85) return "A";
  if (percentage >= 80) return "A-";
  if (percentage >= 75) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 65) return "B-";
  if (percentage >= 60) return "C+";
  if (percentage >= 55) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

// Helper to calculate GPA points
function gradeToPoints(grade: string): number {
  switch (grade) {
    case "A+": return 4.0;
    case "A": return 4.0;
    case "A-": return 3.7;
    case "B+": return 3.3;
    case "B": return 3.0;
    case "B-": return 2.7;
    case "C+": return 2.3;
    case "C": return 2.0;
    case "D": return 1.0;
    default: return 0.0;
  }
}

// GET - Fetch results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const semester = searchParams.get("semester");
    const published = searchParams.get("published");

    const where: Record<string, unknown> = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (semester) {
      where.semester = parseInt(semester);
    }

    if (published !== null) {
      where.published = published === "true";
    }

    const results = await db.result.findMany({
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
      orderBy: [{ semester: "asc" }, { subject: "asc" }],
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}

// POST - Add result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, subject, marks, totalMarks, semester, examType, publish } = body;

    const grade = calculateGrade(marks, totalMarks || 100);

    const result = await db.result.create({
      data: {
        studentId,
        subject,
        marks: parseFloat(marks),
        totalMarks: parseFloat(totalMarks) || 100,
        grade,
        semester: parseInt(semester),
        examType: examType || "Final",
        published: publish || false,
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        studentId,
        type: "result",
        description: `Result added for ${subject}: ${marks}/${totalMarks || 100} (${grade})`,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error adding result:", error);
    return NextResponse.json({ error: "Failed to add result" }, { status: 500 });
  }
}

// PUT - Update/Publish results
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, marks, totalMarks, published, publishAll, studentId } = body;

    // Publish all results for a student
    if (publishAll && studentId) {
      await db.result.updateMany({
        where: { studentId },
        data: { published: true },
      });

      // Log activity
      await db.activity.create({
        data: {
          studentId,
          type: "result",
          description: "All results published",
        },
      });

      return NextResponse.json({ success: true, message: "All results published" });
    }

    // Update single result
    if (id) {
      const grade = marks !== undefined ? calculateGrade(marks, totalMarks || 100) : undefined;

      const result = await db.result.update({
        where: { id },
        data: {
          ...(marks !== undefined && { marks: parseFloat(marks) }),
          ...(totalMarks !== undefined && { totalMarks: parseFloat(totalMarks) }),
          ...(grade && { grade }),
          ...(published !== undefined && { published }),
        },
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json({ error: "Failed to update result" }, { status: 500 });
  }
}

// DELETE - Delete result
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Result ID required" }, { status: 400 });
    }

    await db.result.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json({ error: "Failed to delete result" }, { status: 500 });
  }
}

// Export GPA calculation helper
export { gradeToPoints };
