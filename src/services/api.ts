import { supabase } from "@/integrations/supabase/client";

// Generic API response type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// Helper function for consistent error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

// Generic fetch wrapper for Supabase queries
export const executeQuery = async <T>(
  fn: () => Promise<{ data: T | null; error: any }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await fn();

    if (error) {
      return {
        data: null,
        error: error.message || "Query failed",
        status: error.status || 500,
      };
    }

    return {
      data,
      error: null,
      status: 200,
    };
  } catch (err) {
    return {
      data: null,
      error: handleApiError(err),
      status: 500,
    };
  }
};

// Get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, error };
};

// Check authentication status
export const getAuthSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session || null, error };
};
