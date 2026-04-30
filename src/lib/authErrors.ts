type SupabaseLikeError = { message?: string; status?: number; code?: string } | null | undefined;

export const friendlyAuthError = (error: SupabaseLikeError): string => {
  if (!error) return "Something went wrong. Please try again.";
  const msg = (error.message || "").toLowerCase();
  const code = (error.code || "").toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (msg.includes("user already registered") || code === "user_already_exists") {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (msg.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (msg.includes("rate limit") || error.status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  if (msg.includes("same as the old") || msg.includes("new password should be different")) {
    return "New password must be different from your current one.";
  }
  if (msg.includes("token has expired") || msg.includes("invalid token")) {
    return "This link has expired. Please request a new one.";
  }
  return error.message || "Something went wrong. Please try again.";
};