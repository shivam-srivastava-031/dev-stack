import { supabase } from "@/integrations/supabase/client";
import { ApiResponse, executeQuery } from "./api";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: "admin" | "member";
  created_at: string;
}

export interface ProjectWithMembers extends Project {
  project_members: ProjectMember[];
}

// Get all projects for current user
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  return executeQuery(() =>
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
  );
};

// Get project by ID
export const getProject = async (id: string): Promise<ApiResponse<Project>> => {
  return executeQuery(() => supabase.from("projects").select("*").eq("id", id).single());
};

// Get project with members
export const getProjectWithMembers = async (
  id: string
): Promise<ApiResponse<ProjectWithMembers>> => {
  return executeQuery(() =>
    supabase
      .from("projects")
      .select("*, project_members(*)")
      .eq("id", id)
      .single()
  );
};

// Create new project
export const createProject = async (
  data: Pick<Project, "name" | "description">
): Promise<ApiResponse<Project>> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated", status: 401 };
  }

  return executeQuery(() =>
    supabase
      .from("projects")
      .insert([{ name: data.name, description: data.description, owner_id: user.id }])
      .select()
      .single()
  );
};

// Update project
export const updateProject = async (
  id: string,
  updates: Partial<Pick<Project, "name" | "description">>
): Promise<ApiResponse<Project>> => {
  return executeQuery(() =>
    supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
  );
};

// Delete project
export const deleteProject = async (id: string): Promise<ApiResponse<null>> => {
  return executeQuery(() => supabase.from("projects").delete().eq("id", id));
};

// Add member to project
export const addProjectMember = async (
  projectId: string,
  userId: string,
  role: "admin" | "member" = "member"
): Promise<ApiResponse<ProjectMember>> => {
  return executeQuery(() =>
    supabase
      .from("project_members")
      .insert([{ project_id: projectId, user_id: userId, role }])
      .select()
      .single()
  );
};

// Update project member role
export const updateProjectMember = async (
  projectId: string,
  userId: string,
  role: "admin" | "member"
): Promise<ApiResponse<ProjectMember>> => {
  return executeQuery(() =>
    supabase
      .from("project_members")
      .update({ role })
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .select()
      .single()
  );
};

// Remove member from project
export const removeProjectMember = async (
  projectId: string,
  userId: string
): Promise<ApiResponse<null>> => {
  return executeQuery(() =>
    supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId)
  );
};

// Get project members
export const getProjectMembers = async (
  projectId: string
): Promise<ApiResponse<ProjectMember[]>> => {
  return executeQuery(() =>
    supabase.from("project_members").select("*").eq("project_id", projectId)
  );
};
