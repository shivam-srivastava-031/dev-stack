# Stack Application - Quick Start Setup Guide

## Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Git

## Step 1: Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd project-harmony-hub

# Install dependencies
bun install
# or
npm install
```

## Step 2: Configure Database Connection

### Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **Stack**
3. Go to **Settings** → **Database**

### Create .env.local

1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:

   ```env
   # Get from Supabase Settings → API
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

   # Get from Settings → Database → Connection Pooler
   DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Get from Settings → Database (without pooler)
   DIRECT_URL="postgresql://postgres.YOUR_PROJECT_ID:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

   VITE_APP_NAME=Stack
   VITE_APP_ENV=development
   ```

### Update Your Database Password

In both `DATABASE_URL` and `DIRECT_URL`, replace:
- `YOUR_PROJECT_ID` → Your Supabase project ID
- `[PASSWORD]` → Your database password

⚠️ **Important**: Never commit `.env.local` - it's already in `.gitignore`

## Step 3: Verify Configuration

Test your database connection:

```bash
# Start development server
bun dev
# or
npm run dev
```

Visit `http://localhost:8080` and test:
1. Sign up with email/password
2. Create a project
3. Add tasks
4. Verify API calls work

## Step 4: Project Structure

```
project-harmony-hub/
├── src/
│   ├── services/          # REST API layer
│   │   ├── api.ts         # Core utilities
│   │   ├── projects.ts    # Project APIs
│   │   ├── tasks.ts       # Task APIs
│   │   └── profiles.ts    # User APIs
│   ├── pages/             # Route pages
│   ├── components/        # React components
│   └── integrations/
│       └── supabase/      # Database client
├── supabase/              # Migration files
├── API_DOCUMENTATION.md   # API reference
├── DATABASE_CONNECTION.md # Connection guide
└── .env.local            # Your credentials (not committed)
```

## Step 5: Usage Examples

### In React Components

```typescript
import { getProjects, createTask, updateTaskStatus } from "@/services";

export const MyComponent = () => {
  useEffect(() => {
    const load = async () => {
      const { data: projects, error } = await getProjects();
      if (error) {
        console.error(error);
      } else {
        console.log(projects);
      }
    };
    load();
  }, []);
};
```

See `API_DOCUMENTATION.md` and `src/services/EXAMPLES.md` for more.

## Available Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build
bun test         # Run tests
bun lint         # Lint code
```

## API Endpoints

All APIs are client-side and communicate directly with Supabase:

- **Projects**: Get, create, update, delete projects and members
- **Tasks**: Create, update, manage tasks (status, priority, assignments)
- **Profiles**: Get user profiles, update info

Full API docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Database Schema

### Tables
- `profiles` - User profiles
- `projects` - Team projects
- `project_members` - Team membership
- `tasks` - Project tasks

All protected with Row-Level Security (RLS) policies.

## Troubleshooting

### Database Connection Issues
See [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md)

### Authentication Errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`
- Check Supabase dashboard for API key settings

### API Errors
- Check browser console for error messages
- Verify database tables have correct RLS policies
- Check Supabase logs for database errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_SUPABASE_URL | ✅ | Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | ✅ | Supabase public API key |
| DATABASE_URL | ✓ | Connection pooling URL (for migrations) |
| DIRECT_URL | ✓ | Direct database URL (migrations only) |
| VITE_APP_NAME | ❌ | Application name (default: Stack) |
| VITE_APP_ENV | ❌ | Environment (development/production) |

✅ = Required for app to work  
✓ = Required for database migrations

## Next Steps

1. ✅ Set up `.env.local` with your credentials
2. ✅ Run `bun dev` or `npm run dev`
3. ✅ Test sign up and create a project
4. ✅ Play with the API
5. 📖 Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full API reference

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Need Help?

Check these files:
- `API_DOCUMENTATION.md` - Complete API reference
- `DATABASE_CONNECTION.md` - Database connection guide
- `src/services/EXAMPLES.md` - Component examples
- `README.md` - Project overview
