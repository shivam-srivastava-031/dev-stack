# 📊 Stack — Project & Task Management

A modern, full-stack team collaboration platform for planning projects, assigning tasks, and tracking progress with role-based access control.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B6FF?logo=tailwindcss)

## 🎯 Features

- 🔐 **Secure Authentication** - Email/password and OAuth via Supabase
- 📊 **Project Management** - Create, organize, and manage team projects
- ✅ **Task Tracking** - Full task lifecycle with status, priority, and assignments
- 👥 **Team Collaboration** - Invite team members with role-based permissions (Admin/Member)
- 📱 **Responsive Design** - Beautiful UI that works on desktop, tablet, and mobile
- 🔄 **Real-time Data** - Live synchronization via Supabase PostgREST API
- 🛡️ **Row-Level Security** - Database-level access control for data protection
- ⚡ **Type-Safe APIs** - Full REST API layer with TypeScript interfaces
- 🎨 **Modern UI Components** - Built with shadcn/ui and Radix UI

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Sonner & Toaster** - Toast notifications

### Backend & Database
- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Relational database
- **PostgREST API** - Auto-generated REST API
- **Row-Level Security (RLS)** - Database-level access control
- **Supabase Auth** - Authentication service

### Development
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **Bun** - Fast JavaScript runtime (alternative: npm)

## 📋 Prerequisites

- **Node.js** 18+ or **Bun** latest
- **Supabase** account (free tier available)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd project-harmony-hub

# Install dependencies
bun install
# or
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

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### 3. Start Development Server

```bash
bun dev
# or
npm run dev
```

Visit `http://localhost:8080` in your browser.

### 4. Test the App

1. Sign up with email and password
2. Create a new project
3. Add team members
4. Create tasks and manage them
5. Check the browser console to see API calls in action

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
│   │   ├── Dashboard.tsx          # Main dashboard
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
│   │   ├── EXAMPLES.md            # Usage examples
│   │   └── useApi.ts              # Custom hooks
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication context
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Mobile detection
│   │   ├── use-toast.ts           # Toast notifications
│   │   └── useApi.ts              # Data fetching hooks
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client
│   │       └── types.ts           # Database types
│   │
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   │
│   ├── App.tsx                    # Main app component
│   ├── App.css                    # Global styles
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Base styles
│
├── supabase/
│   ├── config.toml                # Supabase config
│   └── migrations/                # Database migrations
│
├── public/                        # Static assets
│   ├── favicon.svg               # App favicon
│   ├── placeholder.svg           # Logo/branding
│   └── robots.txt
│
├── API_DOCUMENTATION.md          # Complete API reference
├── DATABASE_CONNECTION.md        # Database setup guide
├── SETUP.md                      # Quick start guide
├── README.md                     # This file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts               # Vite config
├── tailwind.config.ts           # Tailwind config
├── postcss.config.js            # PostCSS config
└── eslint.config.js             # ESLint config
```

## 🔌 REST API

Stack provides a **complete REST API layer** built on top of Supabase:

### Core Services

#### Projects API
```typescript
import { getProjects, createProject, updateProject } from "@/services";

// Get all projects
const { data: projects } = await getProjects();

// Create a project
const { data: project } = await createProject({
  name: "My Project",
  description: "Project description"
});

// Update a project
const { data } = await updateProject(projectId, { name: "Updated Name" });
```

#### Tasks API
```typescript
import { getProjectTasks, createTask, updateTaskStatus } from "@/services";

// Get project tasks
const { data: tasks } = await getProjectTasks(projectId);

// Create a task
const { data: task } = await createTask({
  project_id: projectId,
  title: "New Task",
  priority: "high",
  due_date: "2026-05-30"
});

// Update task status
const { data } = await updateTaskStatus(taskId, "in_progress");
```

#### User Profiles API
```typescript
import { getCurrentUserProfile, updateProfile } from "@/services";

// Get current user
const { data: profile } = await getCurrentUserProfile();

// Update profile
const { data } = await updateProfile({
  full_name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg"
});
```

#### Team Management API
```typescript
import { addProjectMember, getProjectMembers, removeProjectMember } from "@/services";

// Add team member
await addProjectMember(projectId, userId, "member");

// Get all members
const { data: members } = await getProjectMembers(projectId);

// Remove member
await removeProjectMember(projectId, userId);
```

**Full API documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🗄️ Database Schema

### Tables

#### profiles
Stores user profile information
- `id` - User ID (references auth.users)
- `email` - User email
- `full_name` - Display name
- `avatar_url` - Profile picture URL
- `created_at` / `updated_at`

#### projects
Team projects
- `id` - Project ID (UUID)
- `name` - Project name
- `description` - Project description
- `owner_id` - Creator's user ID
- `created_at` / `updated_at`

#### project_members
Team membership with roles
- `id` - Membership ID
- `project_id` - Reference to projects
- `user_id` - Reference to users
- `role` - Enum: `admin` | `member`
- `created_at`

#### tasks
Project tasks
- `id` - Task ID
- `project_id` - Reference to projects
- `title` - Task title
- `description` - Task description
- `status` - Enum: `todo` | `in_progress` | `done`
- `priority` - Enum: `low` | `medium` | `high`
- `due_date` - Optional deadline
- `assignee_id` - Assigned user
- `created_by` - Task creator
- `created_at` / `updated_at`

All tables have **Row-Level Security (RLS)** policies enabled.

## 🎨 Components

### UI Components (shadcn/ui)
Pre-built components for rapid development:
- Buttons, Inputs, Forms
- Cards, Dialogs, Modals
- Tabs, Dropdowns, Popovers
- Tables, Badges, Alerts
- And 40+ more...

### Custom Components
- `AppShell` - Main layout wrapper
- `ProtectedRoute` - Auth guards
- `TaskStatusBadge` - Status indicators
- `NavLink` - Navigation links

## 🎯 Use Cases

### For Teams
- **Project Planning** - Break down work into projects and tasks
- **Task Assignment** - Assign tasks to team members with priorities
- **Progress Tracking** - Monitor task status in real-time
- **Role Management** - Control permissions with Admin/Member roles

### For Managers
- **Team Collaboration** - Visualize all team activities
- **Workload Distribution** - Balance tasks across team
- **Deadline Management** - Track due dates and priorities
- **Performance Metrics** - Monitor task completion rates

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP.md](./SETUP.md) | Quick start guide with environment setup |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete REST API reference with examples |
| [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md) | Database connection guide and troubleshooting |
| [src/services/EXAMPLES.md](./src/services/EXAMPLES.md) | React component examples using APIs |

## 📦 Available Scripts

```bash
# Development
bun dev              # Start dev server at http://localhost:8080
bun dev --host       # Accessible from network

# Building
bun build            # Build for production
bun build:dev        # Build with development mode

# Preview & Testing
bun preview          # Preview production build
bun test             # Run tests
bun test:watch       # Watch mode testing

# Code Quality
bun lint             # Run ESLint
bun lint --fix       # Fix linting issues

# Package Management
bun install          # Install dependencies
bun update           # Update dependencies
```

## 🔐 Environment Variables

Create `.env.local` from `.env.example`:

```env
# Supabase API credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key

# Database connection URLs
DATABASE_URL=postgresql://user:password@host:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/postgres

# Application
VITE_APP_NAME=Stack
VITE_APP_ENV=development
```

⚠️ **Important**: Never commit `.env.local` - it's in `.gitignore`

## 🧪 Testing

```bash
# Run tests once
bun test

# Watch mode
bun test:watch

# With coverage
bun test:coverage
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to Other Platforms

**Netlify**, **GitHub Pages**, or **Self-hosted**:

```bash
# Build the app
bun build

# Output is in `dist/` directory
```

Then deploy the `dist/` folder to your hosting provider.

## 🐛 Troubleshooting

### Database Connection Issues
→ See [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md)

### API Not Working
- Check browser console for error messages
- Verify `.env.local` has correct Supabase credentials
- Check Supabase dashboard for RLS policies
- Ensure user is authenticated

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist bun.lockb
bun install
bun build
```

### Port Already in Use
```bash
# Use a different port
bun dev --port 3000
```

## 📖 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Guidelines
- Use TypeScript for all new code
- Follow ESLint rules: `bun lint --fix`
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙋 Support

Need help?
- 📖 Check the [documentation](./API_DOCUMENTATION.md)
- 🐛 Report [issues](../../issues) on GitHub
- 💬 Start a [discussion](../../discussions)
- 📧 Contact the team

## 🎉 Acknowledgments

Built with:
- [Supabase](https://supabase.com) - Backend & database
- [shadcn/ui](https://ui.shadcn.com) - Beautiful components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [React](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Vite](https://vitejs.dev) - Build tool

---

<div align="center">

**[SETUP →](./SETUP.md)** | **[API DOCS →](./API_DOCUMENTATION.md)** | **[DATABASE →](./DATABASE_CONNECTION.md)**

Made with ❤️ by the Stack team

</div>
