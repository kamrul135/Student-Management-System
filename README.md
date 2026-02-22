# 🎓 Student Management System (SMS)

A modern, full-featured Student Management System built with Next.js 15, TypeScript, Prisma, and PostgreSQL. This production-ready application provides a comprehensive solution for managing students, teachers, attendance, and academic results with an elegant, responsive interface.

## 🌟 Key Features

- **👥 User Management** - Comprehensive admin, teacher, and student role management
- **📊 Student Records** - Complete student information and academic tracking
- **📅 Attendance System** - Digital attendance tracking and reporting
- **📈 Results Management** - Grade management and academic performance tracking
- **🔐 Secure Authentication** - Role-based access control with NextAuth.js
- **📱 Responsive Design** - Mobile-first UI with dark/light mode support
- **🎨 Modern UI** - Beautiful interface built with shadcn/ui components
- **🚀 Fast & Scalable** - Optimized for performance with Next.js 15

--- 

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 16** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Fetch** - Promise-based HTTP request

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why This System?

- **🏫 Complete Solution** - All-in-one platform for school management
- **🎨 Beautiful UI** - Modern, intuitive interface with shadcn/ui components
- **🔒 Type Safety** - Full TypeScript with Zod validation for data integrity
- **📱 Mobile First** - Responsive design that works on all devices
- **🗄️ PostgreSQL** - Robust database with Prisma ORM for type-safe queries
- **🔐 Secure Auth** - Role-based authentication with NextAuth.js
- **📊 Data Insights** - Charts and tables for academic performance tracking
- **🚀 Production Ready** - Optimized for deployment on Vercel
- **⚡ Performance** - Fast loading with Next.js 15 optimizations
- **🛠️ Developer Friendly** - Clean code structure and comprehensive tooling

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Database

This project uses PostgreSQL. For production deployment on Vercel, we recommend using [Neon](https://neon.tech) (free tier available).

#### **Option A: Using Neon (Recommended for Vercel)**

1. Go to [https://neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
4. Update your `.env` file:

```bash
DATABASE_URL="your-neon-connection-string"
```

#### **Option B: Local PostgreSQL**

1. Install PostgreSQL on your machine
2. Create a database
3. Update `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/sms"
```

### 3. Initialize the database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

### 5. Login Credentials (after seeding)

- **Admin:** `admin@school.edu` / `admin123`
- **Teacher:** `teacher1@school.edu` / `teacher123`  
- **Student:** `student1@school.edu` / `student123`

## 🚀 Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your Neon database connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
4. Deploy!
5. After first deployment, seed the database:
   - Go to your Vercel project → Settings → Functions
   - Or run locally: `DATABASE_URL="your-neon-url" npm run db:seed`



## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Fetch + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Authentication**: Role-based access control with secure session management
- **Database**: Type-safe PostgreSQL operations with Prisma ORM
- **API Integration**: RESTful API routes for all CRUD operations
- **State Management**: Efficient state handling with React hooks
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

---

## 🔒 Security Features

- **Authentication**: Secure NextAuth.js-based authentication
- **Authorization**: Role-based access control (Admin, Teacher, Student)
- **Password Hashing**: Secure password storage with bcrypt
- **Session Management**: Secure session handling
- **Environment Variables**: Sensitive data protected via .env files
- **SQL Injection Protection**: Prisma ORM prevents SQL injection attacks

---

## 📝 Database Schema

The system includes the following main entities:

- **Users** - System users (Admin, Teachers, Students)
- **Students** - Student profiles and academic information
- **Classes** - Class/Grade organization
- **Subjects** - Course/Subject management
- **Attendance** - Daily attendance records
- **Results** - Grade and examination results
- **Announcements** - School-wide announcements

For detailed schema, see [prisma/schema.prisma](prisma/schema.prisma).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ for modern educational institutions.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Neon](https://neon.tech/) - Serverless PostgreSQL

---

**Happy Coding! 🚀** 