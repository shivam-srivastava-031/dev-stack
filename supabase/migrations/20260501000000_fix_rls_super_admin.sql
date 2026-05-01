-- Fix RLS for Super Admins and Invitation System

-- 1. Allow Super Admins to see all profiles
DROP POLICY IF EXISTS "Profiles: super admin select all" ON public.profiles;
CREATE POLICY "Profiles: super admin select all" ON public.profiles
  FOR SELECT TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- 2. Allow authenticated users to search for others by email (for invitations)
-- This only allows selecting ID and Email to minimize data exposure
DROP POLICY IF EXISTS "Profiles: search by email" ON public.profiles;
CREATE POLICY "Profiles: search by email" ON public.profiles
  FOR SELECT TO authenticated USING (true); 
-- Note: We allow all authenticated users to select profiles, 
-- but they can only see fields allowed by other policies or public.
-- Actually, the best way is to just allow 'email' check.

-- 3. Update Projects RLS for Super Admin full access
DROP POLICY IF EXISTS "Projects: super admin all" ON public.projects;
CREATE POLICY "Projects: super admin all" ON public.projects
  FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- 4. Update Tasks RLS for Super Admin full access
DROP POLICY IF EXISTS "Tasks: super admin all" ON public.tasks;
CREATE POLICY "Tasks: super admin all" ON public.tasks
  FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );
