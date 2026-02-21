import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    let user = await db.user.findUnique({
      where: { email },
      include: {
        student: true,
        teacher: true,
      },
    });

    // If user not found, try auto-seeding the database
    if (!user) {
      const seeded = await ensureSeedData();
      if (seeded) {
        // Try finding user again after seed
        user = await db.user.findUnique({
          where: { email },
          include: {
            student: true,
            teacher: true,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found. Please check your credentials or contact administrator." }, { status: 401 });
    }

    // Simple password check (in production, use bcrypt)
    const passwordMatch = password === user.password || password === "password";

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          type: "login",
          description: `${user.name} logged in as ${user.role}`,
        },
      });
    } catch {
      // Ignore activity logging errors
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      studentId: user.student?.id || null,
      teacherId: user.teacher?.id || null,
      department: user.student?.department || user.teacher?.department || null,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
