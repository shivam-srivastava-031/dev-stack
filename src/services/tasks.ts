import { supabase } from "@/integrations/supabase/client";
import { ApiResponse, executeQuery } from "./api";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Get tasks by project
export const getProjectTasks = async (projectId: string): Promise<ApiResponse<Task[]>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
  );
};

// Get task by ID
export const getTask = async (id: string): Promise<ApiResponse<Task>> => {
  return executeQuery(() => supabase.from("tasks").select("*").eq("id", id).single());
};

// Create task
export const createTask = async (
  data: Pick<Task, "project_id" | "title" | "description" | "priority" | "due_date">
): Promise<ApiResponse<Task>> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated", status: 401 };
  }

  return executeQuery(() =>
    supabase
      .from("tasks")
      .insert([{ ...data, created_by: user.id, status: "todo" }])
      .select()
      .single()
  );
};

// Update task
export const updateTask = async (
  id: string,
  updates: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "due_date" | "assignee_id">>
): Promise<ApiResponse<Task>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
  );
};

// Update task status
export const updateTaskStatus = async (
  id: string,
  status: "todo" | "in_progress" | "done"
): Promise<ApiResponse<Task>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
  );
};

// Update task priority
export const updateTaskPriority = async (
  id: string,
  priority: "low" | "medium" | "high"
): Promise<ApiResponse<Task>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
  );
};

// Assign task to user
export const assignTask = async (id: string, assigneeId: string): Promise<ApiResponse<Task>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .update({ assignee_id: assigneeId, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
  );
};

// Unassign task
export const unassignTask = async (id: string): Promise<ApiResponse<Task>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .update({ assignee_id: null, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
  );
};

// Delete task
export const deleteTask = async (id: string): Promise<ApiResponse<null>> => {
  return executeQuery(() => supabase.from("tasks").delete().eq("id", id));
};

// Get tasks by status
export const getTasksByStatus = async (
  projectId: string,
  status: "todo" | "in_progress" | "done"
): Promise<ApiResponse<Task[]>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", status)
      .order("priority", { ascending: false })
  );
};

// Get user's assigned tasks
export const getUserAssignedTasks = async (userId: string): Promise<ApiResponse<Task[]>> => {
  return executeQuery(() =>
    supabase
      .from("tasks")
      .select("*")
      .eq("assignee_id", userId)
      .neq("status", "done")
      .order("due_date", { ascending: true })
  );
};
