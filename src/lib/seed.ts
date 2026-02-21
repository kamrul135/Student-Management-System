import { db } from "@/lib/db";

const departments = [
  { name: "Computer Science", code: "CSE" },
  { name: "Electrical Engineering", code: "EEE" },
  { name: "Mechanical Engineering", code: "ME" },
  { name: "Civil Engineering", code: "CE" },
  { name: "Business Administration", code: "BBA" },
];

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Programming", "Database Systems",
  "Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Software Engineering",
];

let isSeeding = false;

export async function ensureSeedData() {
  // Prevent multiple seed operations
  if (isSeeding) return false;
  
  try {
    // Check if admin exists
    const admin = await db.user.findUnique({
      where: { email: "admin@school.edu" },
    });
    
    if (admin) return false; // Already seeded
    
    isSeeding = true;
    console.log("Seeding database...");
    
    // Create departments
    for (const dept of departments) {
      await db.department.upsert({
        where: { code: dept.code },
        update: {},
        create: dept,
      });
    }

    // Create admin user
    const adminUser = await db.user.upsert({
      where: { email: "admin@school.edu" },
      update: {},
      create: {
        email: "admin@school.edu",
        password: "admin123",
        name: "Admin User",
        role: "admin",
      },
    });

    // Create teacher users
    const teachers = [];
    for (let i = 1; i <= 5; i++) {
      const user = await db.user.upsert({
        where: { email: `teacher${i}@school.edu` },
        update: {},
        create: {
          email: `teacher${i}@school.edu`,
          password: "teacher123",
          name: `Teacher ${i}`,
          role: "teacher",
        },
      });
      
      const teacher = await db.teacher.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: `+8801${Math.floor(Math.random() * 900000000 + 100000000)}`,
          subject: subjects[i % subjects.length],
          department: departments[i % departments.length].name,
        },
      });
      teachers.push(teacher);
    }

    // Create student users
    const students = [];
    for (let i = 1; i <= 30; i++) {
      const deptIndex = i % departments.length;
      const semester = (i % 8) + 1;
      
      const user = await db.user.upsert({
        where: { email: `student${i}@school.edu` },
        update: {},
        create: {
          email: `student${i}@school.edu`,
          password: "student123",
          name: `Student ${i}`,
          role: "student",
        },
      });
      
      const student = await db.student.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: `+8801${Math.floor(Math.random() * 900000000 + 100000000)}`,
          department: departments[deptIndex].name,
          semester,
          roll: `ROLL-${String(i).padStart(4, "0")}`,
          gender: i % 2 === 0 ? "Male" : "Female",
          address: `Address ${i}, City`,
          dateOfBirth: `${1995 + (i % 10)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
        },
      });
      students.push(student);
    }

    // Create attendance records
    const today = new Date();
    for (let day = 0; day < 30; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split("T")[0];

      for (const student of students) {
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const rand = Math.random();
        let status = "present";
        if (rand > 0.95) status = "late";
        else if (rand > 0.80) status = "absent";

        await db.attendance.upsert({
          where: {
            studentId_date: { studentId: student.id, date: dateStr }
          },
          update: {},
          create: {
            studentId: student.id,
            date: dateStr,
            status,
          },
        });
      }
    }

    // Create results
    for (const student of students) {
      for (let subj = 0; subj < 3; subj++) {
        const subject = subjects[(student.semester + subj) % subjects.length];
        const marks = Math.floor(Math.random() * 40) + 60;
        
        let grade = "F";
        if (marks >= 90) grade = "A+";
        else if (marks >= 85) grade = "A";
        else if (marks >= 80) grade = "A-";
        else if (marks >= 75) grade = "B+";
        else if (marks >= 70) grade = "B";
        else if (marks >= 65) grade = "B-";
        else if (marks >= 60) grade = "C+";
        else if (marks >= 55) grade = "C";
        else if (marks >= 50) grade = "D";

        // Use create instead of upsert for results (no unique constraint)
        try {
          await db.result.create({
            data: {
              studentId: student.id,
              subject,
              marks,
              totalMarks: 100,
              grade,
              semester: student.semester,
              examType: "Final",
              published: true,
            },
          });
        } catch {
          // Result might already exist, ignore
        }
      }
    }

    console.log("Database seeded successfully!");
    isSeeding = false;
    return true;
  } catch (error) {
    console.error("Seed error:", error);
    isSeeding = false;
    return false;
  }
}
