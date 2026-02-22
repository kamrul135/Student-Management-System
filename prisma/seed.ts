import { PrismaClient, Teacher, Student } from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  { name: "Computer Science", code: "CSE" },
  { name: "Electrical Engineering", code: "EEE" },
  { name: "Mechanical Engineering", code: "ME" },
  { name: "Civil Engineering", code: "CE" },
  { name: "Business Administration", code: "BBA" },
];

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Programming",
  "Database Systems",
  "Data Structures",
  "Algorithms",
  "Operating Systems",
  "Computer Networks",
  "Software Engineering",
];

async function main() {
  // Create departments
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  // Create admin user
  const admin = await prisma.user.upsert({
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
  const teachers: Teacher[] = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `teacher${i}@school.edu` },
      update: {},
      create: {
        email: `teacher${i}@school.edu`,
        password: "teacher123",
        name: `Teacher ${i}`,
        role: "teacher",
      },
    });
    
    const teacher = await prisma.teacher.upsert({
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

  // Create student users with profiles
  const students: Student[] = [];
  for (let i = 1; i <= 30; i++) {
    const deptIndex = i % departments.length;
    const semester = (i % 8) + 1;
    
    const user = await prisma.user.upsert({
      where: { email: `student${i}@school.edu` },
      update: {},
      create: {
        email: `student${i}@school.edu`,
        password: "student123",
        name: `Student ${i}`,
        role: "student",
      },
    });
    
    const student = await prisma.student.upsert({
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

  // Create attendance records for the past 30 days
  const today = new Date();
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split("T")[0];

    for (const student of students) {
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Random attendance (80% present, 15% absent, 5% late)
      const rand = Math.random();
      let status = "present";
      if (rand > 0.95) status = "late";
      else if (rand > 0.80) status = "absent";

      await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date: dateStr,
          },
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

  // Create results for students
  for (const student of students) {
    for (let subj = 0; subj < 3; subj++) {
      const subject = subjects[(student.semester + subj) % subjects.length];
      const marks = Math.floor(Math.random() * 40) + 60; // 60-100
      
      // Calculate grade
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

      await prisma.result.create({
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
    }
  }

  // Create activities
  const activityTypes = [
    { type: "student_add", desc: "New student registered" },
    { type: "attendance", desc: "Attendance marked" },
    { type: "result", desc: "Result published" },
    { type: "login", desc: "User logged in" },
  ];

  for (let i = 0; i < 20; i++) {
    const activity = activityTypes[i % activityTypes.length];
    const user = i % 3 === 0 ? admin : (i % 3 === 1 ? { id: teachers[0].userId } : { id: students[0].userId });
    
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: activity.type,
        description: activity.desc + ` - ${new Date(Date.now() - i * 3600000).toLocaleString()}`,
      },
    });
  }

  console.log("Seed data created successfully!");
  console.log(`
    Created:
    - ${departments.length} departments
    - 1 admin (email: admin@school.edu, password: admin123)
    - ${teachers.length} teachers (email: teacher1-5@school.edu, password: teacher123)
    - ${students.length} students (email: student1-30@school.edu, password: student123)
    - Attendance records for 30 days
    - Results for all students
    - Activity logs
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
