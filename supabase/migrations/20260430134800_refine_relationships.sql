-- Refine relationships to enable easier joins and better data integrity

-- 1. Update project_members to reference profiles(id)
-- First, drop the existing foreign key
ALTER TABLE public.project_members DROP CONSTRAINT IF EXISTS project_members_user_id_fkey;

-- Then, add the new foreign key referencing public.profiles(id)
ALTER TABLE public.project_members
ADD CONSTRAINT project_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Ensure tasks.assignee_id references profiles(id)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assignee_id_fkey
FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Add index for faster profile joins if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Ensure cascading delete for project owners (already in place but double check)
-- Projects are already cascaded from auth.users(id) via owner_id in the previous migration.
