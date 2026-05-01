# 📊 Harmony Hub — Project & Task Management

A modern, full-stack team collaboration platform for planning projects, assigning tasks, and tracking progress with advanced role-based access control and interactive visualizations.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B6FF?logo=tailwindcss)
![Railway](https://img.shields.io/badge/Railway-Deployed-000000?logo=railway)

## 🎯 Features

- 🔐 **Secure Authentication** - Refined Google OAuth and Email/Password flows via Supabase.
- 📊 **Interactive Dashboard** - Real-time task distribution visualizations (Bar/Line charts) and personalized welcome.
- ✅ **Task Tracking** - Full lifecycle with priority-coded indicators, drag-and-drop Kanban board, and bulk actions.
- 👥 **Advanced RBAC** - Robust Role-Based Access Control featuring **Super Admin**, Admin, and Member roles.
- 🛡️ **Harden Security** - Optimized Row-Level Security (RLS) with deep database relationships.
- 📱 **Premium UI** - High-end glassmorphism design with modern animations and micro-interactions.
- 🔄 **Real-time Data** - Live synchronization via Supabase PostgREST API and Real-time engine.
- ⚡ **Type-Safe APIs** - Full REST API layer with TypeScript interfaces for every service.
- 🎨 **Modern UI Components** - Built with shadcn/ui, Radix UI, and Framer Motion.

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Recharts** - Interactive data visualizations
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Sonner & Toaster** - Toast notifications

### Backend & Database
- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Relational database
- **PostgREST API** - Auto-generated REST API
- **Row-Level Security (RLS)** - Database-level access control
- **Supabase Auth** - Authentication service (Email & Google)

### Infrastructure & Operations
- **Node.js / Express** - Production server logic
- **Railway** - Production hosting and deployment
- **Docker / Nixpacks** - Containerized builds
- **ESLint** - Code linting
- **Vitest** - Unit testing

## 📋 Prerequisites

- **Node.js** 18+
- **Supabase** account
- **Railway** account (for production deployment)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd project-harmony-hub

# Install dependencies
npm install
```

### 2. Setup Environment

```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_key
# DATABASE_URL=your_connection_string
# DIRECT_URL=your_direct_connection
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Database Setup
1. Create a new Supabase project.
2. Run the SQL migrations in `supabase/migrations/` to set up tables, RLS policies, and RBAC roles (Super Admin, Admin, Member).
3. Update your `.env.local` with the new project credentials.

## 📁 Project Structure

```
project-harmony-hub/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── AppShell.tsx           # Main layout wrapper
│   │   ├── NavLink.tsx            # Navigation component
│   │   ├── ProtectedRoute.tsx     # Auth route guard
│   │   └── TaskStatusBadge.tsx    # Task status display
│   │
│   ├── pages/
│   │   ├── Index.tsx              # Landing page
│   │   ├── Auth.tsx               # Auth page (sign in/up)
│   │   ├── Dashboard.tsx          # Main dashboard with charts
│   │   ├── Projects.tsx           # Projects list
│   │   ├── ProjectDetail.tsx      # Project details
│   │   └── NotFound.tsx           # 404 page
│   │
│   ├── services/                  # REST API layer
│   │   ├── api.ts                 # Core utilities & error handling
│   │   ├── projects.ts            # Project CRUD operations
│   │   ├── tasks.ts               # Task management
│   │   ├── profiles.ts            # User profiles
│   │   ├── index.ts               # Centralized exports
│   │   └── useApi.ts              # Custom hooks
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client
│   │       └── types.ts           # Database types
│   │
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # Entry point
│
├── server.js                      # Production Express server
├── railway.json                   # Railway deployment config
├── Procfile                       # Process file for hosting
├── API_DOCUMENTATION.md          # Complete API reference
└── package.json                  # Dependencies
```

## 🔌 REST API

Harmony Hub provides a **complete REST API layer** built on top of Supabase:

### Example Usage

#### Projects API
```typescript
import { getProjects, createProject } from "@/services";

// Get all projects
const { data: projects } = await getProjects();

// Create a project
const { data: project } = await createProject({
  name: "My Project",
  description: "Project description"
});
```

#### Tasks API
```typescript
import { getProjectTasks, updateTaskStatus } from "@/services";

// Get project tasks
const { data: tasks } = await getProjectTasks(projectId);

// Update task status
const { data } = await updateTaskStatus(taskId, "in_progress");
```

**Full API documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🗄️ Database Schema

### Tables

- **profiles**: User profile info linked to auth.
- **projects**: Team projects with ownership tracking.
- **project_members**: RBAC mappings (Super Admin, Admin, Member).
- **tasks**: Project tasks with priority and status states.

All tables have **Row-Level Security (RLS)** policies enabled to ensure data isolation.

## 🚢 Deployment

### Deploy to Railway (Production)

Harmony Hub is configured for seamless deployment to **Railway**:

1.  Connect your GitHub repository to Railway.
2.  The platform will automatically detect `railway.json` and use `node server.js` as the start command.
3.  Add your environment variables (`VITE_SUPABASE_URL`, etc.) in the Railway "Variables" tab.
4.  The health check endpoint is available at `/health`.

### Manual Build

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch
```

## 🔐 Environment Variables

Create `.env.local` from `.env.example`:

```env
# Supabase API credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key

# Database connection URLs
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Application
VITE_APP_NAME="Harmony Hub"
VITE_APP_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📄 License

MIT License

## 🙋 Support

- 📖 Check the [documentation](./API_DOCUMENTATION.md)
- 🐛 Report [issues](../../issues) on GitHub
- 💬 Start a [discussion](../../discussions)

---

<div align="center">

**[API DOCS →](./API_DOCUMENTATION.md)**

</div>
