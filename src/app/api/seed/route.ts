import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  try {
    const seeded = await ensureSeedData();
    
    const userCount = await db.user.count();
    
    if (seeded) {
      return NextResponse.json({ 
        message: "Database seeded successfully!",
        credentials: {
          admin: { email: "admin@school.edu", password: "admin123" },
          teacher: { email: "teacher1@school.edu", password: "teacher123" },
          student: { email: "student1@school.edu", password: "student123" },
        },
        totalUsers: userCount
      });
    }
    
    return NextResponse.json({ 
      message: "Database already seeded", 
      totalUsers: userCount,
      credentials: {
        admin: { email: "admin@school.edu", password: "admin123" },
        teacher: { email: "teacher1@school.edu", password: "teacher123" },
        student: { email: "student1@school.edu", password: "student123" },
      }
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
