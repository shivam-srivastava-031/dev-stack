-- Implement Global Roles and Harden RLS for RBAC

-- 1. Add global role to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'global_role') THEN
    CREATE TYPE public.global_role AS ENUM ('user', 'super_admin');
  END IF;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.global_role NOT NULL DEFAULT 'user';

-- 2. Helper function to check for super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 3. Update Project RLS to allow super admins
DROP POLICY IF EXISTS "Projects: members select" ON public.projects;
CREATE POLICY "Projects: members or superadmin select" ON public.projects
  FOR SELECT TO authenticated USING (
    public.is_project_member(id, auth.uid()) OR public.is_super_admin()
  );

-- 4. Update Tasks RLS for stricter member permissions
-- (Members can only update tasks they are assigned to, or if they are admin)
DROP POLICY IF EXISTS "Tasks: assignee or admin update" ON public.tasks;
CREATE POLICY "Tasks: assignee, creator, or admin update" ON public.tasks
  FOR UPDATE TO authenticated USING (
    assignee_id = auth.uid() 
    OR created_by = auth.uid()
    OR public.is_project_admin(project_id, auth.uid())
    OR public.is_super_admin()
  );

-- 5. Stricter Delete Policy (Only Project Admin or Super Admin can delete tasks)
DROP POLICY IF EXISTS "Tasks: admins delete" ON public.tasks;
CREATE POLICY "Tasks: admins or superadmin delete" ON public.tasks
  FOR DELETE TO authenticated USING (
    public.is_project_admin(project_id, auth.uid()) OR public.is_super_admin()
  );
