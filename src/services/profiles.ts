import { supabase } from "@/integrations/supabase/client";
import { ApiResponse, executeQuery } from "./api";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Get current user profile
export const getCurrentUserProfile = async (): Promise<ApiResponse<Profile>> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated", status: 401 };
  }

  return executeQuery(() =>
    supabase.from("profiles").select("*").eq("id", user.id).single()
  );
};

// Get profile by ID
export const getProfile = async (id: string): Promise<ApiResponse<Profile>> => {
  return executeQuery(() => supabase.from("profiles").select("*").eq("id", id).single());
};

// Get multiple profiles by IDs
export const getProfiles = async (ids: string[]): Promise<ApiResponse<Profile[]>> => {
  return executeQuery(() =>
    supabase.from("profiles").select("*").in("id", ids)
  );
};

// Update profile
export const updateProfile = async (
  updates: Partial<Pick<Profile, "full_name" | "avatar_url">>
): Promise<ApiResponse<Profile>> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated", status: 401 };
  }

  return executeQuery(() =>
    supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single()
  );
};

// Update avatar
export const updateAvatar = async (avatarUrl: string): Promise<ApiResponse<Profile>> => {
  return updateProfile({ avatar_url: avatarUrl });
};

// Search profiles by name or email
export const searchProfiles = async (query: string): Promise<ApiResponse<Profile[]>> => {
  return executeQuery(() =>
    supabase
      .from("profiles")
      .select("*")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10)
  );
};
