# Database Connection Setup Guide

## Overview

Your Stack application connects to Supabase PostgreSQL using two different connection URLs:

1. **DATABASE_URL** - Connection pooling endpoint (port 6543)
   - Used for regular application queries
   - Handles concurrent connections efficiently
   - Recommended for production

2. **DIRECT_URL** - Direct database connection (port 5432)
   - Used ONLY for running database migrations
   - Direct connection to the database
   - Should NOT be used for application queries

## Setup Instructions

### Step 1: Get Your Connection Strings

From your Supabase dashboard:

1. Go to **Settings** → **Database** → **Connection String Pooler**
2. Select **Connection Pooling** mode
3. Copy the connection string (this is your `DATABASE_URL`)
4. Replace `[YOUR-PASSWORD]` with your actual database password

For the direct connection:
1. Go to **Settings** → **Database**
2. Find the **Connection String** (not pooler)
3. Copy it (this is your `DIRECT_URL`)
4. Replace `[YOUR-PASSWORD]` with your database password

### Step 2: Update .env.local

Edit `.env.local` and update:

```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.YOUR_PROJECT_ID:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

Replace:
- `YOUR_PROJECT_ID` - Your Supabase project ID
- `PASSWORD` - Your database password

### Step 3: Verify Connection

To verify your database connection works:

```bash
# Test the connection
psql DATABASE_URL -c "SELECT 1;"

# Or use the Supabase client
node -e "const { createClient } = require('@supabase/supabase-js'); const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY); console.log('Connected!');"
```

## Connection Details

Your Supabase instance:
- **Project ID**: fgllnqjhyidsdycreyoj
- **Region**: ap-northeast-1 (Asia Pacific - Tokyo)
- **Pooler Host**: aws-1-ap-northeast-1.pooler.supabase.com
- **Direct Host**: aws-1-ap-northeast-1.db.supabase.com

## Important Notes

⚠️ **SECURITY WARNING**:
- Never commit `.env.local` to version control
- `.env.local` is in `.gitignore` by default
- Always use strong database passwords
- Rotate your credentials periodically
- Use connection pooling (DATABASE_URL) for app queries
- Only use direct connection (DIRECT_URL) for migrations

## Using Database Connections in Your App

### For API Queries (Use DATABASE_URL)

The application automatically uses the Supabase client configured in `src/integrations/supabase/client.ts`, which connects through the pooler.

```typescript
import { supabase } from "@/integrations/supabase/client";

// This automatically uses the pooled connection
const { data } = await supabase.from("projects").select("*");
```

### For Database Migrations

Use the DIRECT_URL only when running migrations:

```bash
# Example with Prisma
DATABASE_URL="..." npx prisma migrate dev --name init

# Example with raw SQL
psql $DIRECT_URL -f migrations/001_init.sql
```

## Troubleshooting Connection Issues

### Connection Refused
- Verify credentials in `.env.local`
- Check your IP is whitelisted in Supabase settings
- Ensure database is running and accessible

### Too Many Connections
- You're hitting the connection limit
- Make sure you're using CONNECTION POOLING (DATABASE_URL)
- Check for connection leaks in your code

### Authentication Failed
- Double-check your password
- Verify you're using the correct project ID
- Reset password in Supabase dashboard if needed

### Slow Queries
- Check database indexes
- Monitor query performance in Supabase dashboard
- Consider connection pooling if not already using it

## Connection String Format

### Connection Pooling URL (DATABASE_URL)
```
postgresql://[user]:[password]@[pooler-host]:6543/[database]?pgbouncer=true
```

### Direct Connection URL (DIRECT_URL)
```
postgresql://[user]:[password]@[direct-host]:5432/[database]
```

## Testing Your Connection

Once configured, test by running:

```bash
npm run test
```

This will verify database connectivity through your test suite.

## Next Steps

1. ✅ Set DATABASE_URL and DIRECT_URL in `.env.local`
2. ✅ Verify connection works
3. ✅ Run application: `npm run dev`
4. ✅ Test API endpoints in browser

For more details, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
