# Harmony Hub — REST API & Database Documentation

## Overview

Harmony Hub is built with a comprehensive REST API layer on top of **Supabase (PostgreSQL)** for all data persistence and real-time capabilities.

## Database Architecture

### Tables

#### `profiles`
User profiles linked to authentication users
- `id` (UUID) - Primary key, references `auth.users`
- `email` - User email
- `full_name` - User's full name
- `avatar_url` - User's profile picture
- `created_at` - Timestamp
- `updated_at` - Timestamp

#### `projects`
Project entities created by users
- `id` (UUID) - Primary key
- `name` - Project title
- `description` - Project description
- `owner_id` (UUID) - Project owner reference
- `created_at` - Timestamp
- `updated_at` - Timestamp

#### `project_members`
Team members assigned to projects with roles
- `id` (UUID) - Primary key
- `project_id` (UUID) - Foreign key to projects
- `user_id` (UUID) - Foreign key to auth.users
- `role` - Enum: `admin`, `member`
- `created_at` - Timestamp

#### `tasks`
Tasks within projects
- `id` (UUID) - Primary key
- `project_id` (UUID) - Foreign key to projects
- `title` - Task title
- `description` - Task description
- `status` - Enum: `todo`, `in_progress`, `done`
- `priority` - Enum: `low`, `medium`, `high`
- `due_date` - Optional deadline
- `assignee_id` (UUID) - Optional assigned user
- `created_by` (UUID) - Task creator
- `created_at` - Timestamp
- `updated_at` - Timestamp

## REST API Services

All API services are located in `src/services/` and return standardized `ApiResponse<T>` types.

### API Response Format

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
```

### Projects API (`src/services/projects.ts`)

#### Get All Projects
```typescript
import { getProjects } from "@/services";

const { data, error, status } = await getProjects();
```

#### Get Project by ID
```typescript
import { getProject } from "@/services";

const { data, error } = await getProject(projectId);
```

#### Get Project with Members
```typescript
import { getProjectWithMembers } from "@/services";

const { data, error } = await getProjectWithMembers(projectId);
```

#### Create Project
```typescript
import { createProject } from "@/services";

const { data, error } = await createProject({
  name: "New Project",
  description: "Project description"
});
```

#### Update Project
```typescript
import { updateProject } from "@/services";

const { data, error } = await updateProject(projectId, {
  name: "Updated Name",
  description: "Updated description"
});
```

#### Delete Project
```typescript
import { deleteProject } from "@/services";

const { data, error } = await deleteProject(projectId);
```

#### Project Members Management
```typescript
import { 
  addProjectMember, 
  updateProjectMember, 
  removeProjectMember,
  getProjectMembers 
} from "@/services";

// Add member
await addProjectMember(projectId, userId, "member");

// Update role
await updateProjectMember(projectId, userId, "admin");

// Remove member
await removeProjectMember(projectId, userId);

// Get all members
const { data: members } = await getProjectMembers(projectId);
```

### Tasks API (`src/services/tasks.ts`)

#### Get Tasks by Project
```typescript
import { getProjectTasks } from "@/services";

const { data: tasks } = await getProjectTasks(projectId);
```

#### Get Task by ID
```typescript
import { getTask } from "@/services";

const { data: task } = await getTask(taskId);
```

#### Create Task
```typescript
import { createTask } from "@/services";

const { data: task } = await createTask({
  project_id: projectId,
  title: "New Task",
  description: "Task description",
  priority: "high",
  due_date: "2026-05-30T00:00:00Z"
});
```

#### Update Task
```typescript
import { updateTask } from "@/services";

const { data } = await updateTask(taskId, {
  title: "Updated Title",
  description: "New description",
  status: "in_progress",
  priority: "medium"
});
```

#### Update Task Status
```typescript
import { updateTaskStatus } from "@/services";

const { data } = await updateTaskStatus(taskId, "done");
```

#### Update Task Priority
```typescript
import { updateTaskPriority } from "@/services";

const { data } = await updateTaskPriority(taskId, "high");
```

#### Assign Task
```typescript
import { assignTask, unassignTask } from "@/services";

// Assign to user
await assignTask(taskId, userId);

// Unassign
await unassignTask(taskId);
```

#### Delete Task
```typescript
import { deleteTask } from "@/services";

const { data, error } = await deleteTask(taskId);
```

#### Get Tasks by Status
```typescript
import { getTasksByStatus } from "@/services";

const { data: todoTasks } = await getTasksByStatus(projectId, "todo");
const { data: inProgress } = await getTasksByStatus(projectId, "in_progress");
const { data: completed } = await getTasksByStatus(projectId, "done");
```

#### Get User's Assigned Tasks
```typescript
import { getUserAssignedTasks } from "@/services";

const { data: myTasks } = await getUserAssignedTasks(userId);
```

### Profiles API (`src/services/profiles.ts`)

#### Get Current User Profile
```typescript
import { getCurrentUserProfile } from "@/services";

const { data: profile } = await getCurrentUserProfile();
```

#### Get Profile by ID
```typescript
import { getProfile } from "@/services";

const { data: userProfile } = await getProfile(userId);
```

#### Get Multiple Profiles
```typescript
import { getProfiles } from "@/services";

const { data: profiles } = await getProfiles([userId1, userId2, userId3]);
```

#### Update Profile
```typescript
import { updateProfile } from "@/services";

const { data } = await updateProfile({
  full_name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg"
});
```

#### Update Avatar
```typescript
import { updateAvatar } from "@/services";

const { data } = await updateAvatar("https://example.com/new-avatar.jpg");
```

#### Search Profiles
```typescript
import { searchProfiles } from "@/services";

const { data: results } = await searchProfiles("john");
```

## Error Handling

All API calls return standardized responses with error handling:

```typescript
const { data, error, status } = await getProject(projectId);

if (error) {
  console.error(`Error (${status}):`, error);
  // Handle error
} else {
  // Use data
}
```

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Row-Level Security (RLS)

All tables have Row-Level Security enabled. The database includes helper functions:

- `is_project_member()` - Check if user is a project member
- `is_project_admin()` - Check if user is admin of project
- `shares_project_with()` - Check if users share projects

## Real-time Subscriptions

You can subscribe to real-time changes using Supabase:

```typescript
import { supabase } from "@/integrations/supabase/client";

const subscription = supabase
  .from("tasks")
  .on("*", (payload) => {
    console.log("Change received!", payload);
  })
  .subscribe();
```

## Best Practices

1. **Always handle errors** - Check the error field in responses
2. **Type safety** - Use exported TypeScript types (Project, Task, Profile)
3. **Error responses** - Status codes indicate the type of error (401 = auth, 404 = not found, 500 = server)
4. **Consistent patterns** - All services follow the same request/response patterns
5. **No direct queries** - Always use the service functions, not raw Supabase queries in components
