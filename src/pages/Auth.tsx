import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { friendlyAuthError } from "@/lib/authErrors";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(1, "Name is required").max(100),
});

const forgotSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
});

type FieldErrors = Record<string, string>;

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<"main" | "forgot" | "forgot-sent">("main");
  const [signInErrors, setSignInErrors] = useState<FieldErrors>({});
  const [signUpErrors, setSignUpErrors] = useState<FieldErrors>({});
  const [forgotErrors, setForgotErrors] = useState<FieldErrors>({});
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignInErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      parsed.error.errors.forEach((err) => {
        const k = err.path[0] as string;
        if (k && !errs[k]) errs[k] = err.message;
      });
      setSignInErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (error) {
      toast.error(friendlyAuthError(error));
      return;
    }
    navigate("/dashboard");
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
      fullName: fd.get("fullName"),
    });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      parsed.error.errors.forEach((err) => {
        const k = err.path[0] as string;
        if (k && !errs[k]) errs[k] = err.message;
      });
      setSignUpErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(friendlyAuthError(error));
      return;
    }
    toast.success("Account created! You're signed in.");
    navigate("/dashboard");
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = forgotSchema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      parsed.error.errors.forEach((err) => {
        const k = err.path[0] as string;
        if (k && !errs[k]) errs[k] = err.message;
      });
      setForgotErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(friendlyAuthError(error));
      return;
    }
    setForgotEmail(parsed.data.email);
    setView("forgot-sent");
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast.error(friendlyAuthError(error as never) || "Google sign-in failed");
      setSubmitting(false);
      return;
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => (view === "main" ? navigate(-1) : setView("main"))}
        className="absolute left-4 top-4 z-20 gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {view === "main" ? "Welcome to Stack" : view === "forgot" ? "Reset your password" : "Check your email"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {view === "main"
              ? "Plan projects, assign tasks, ship faster."
              : view === "forgot"
              ? "Enter your email and we'll send you a reset link."
              : `We sent a password reset link to ${forgotEmail}.`}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-card backdrop-blur-xl">
          {view === "forgot-sent" ? (
            <div className="space-y-4 py-2 text-center">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to choose a new password. The link expires in 1 hour.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't get it? Check your spam folder, or{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => setView("forgot")}
                >
                  try again
                </button>
                .
              </p>
              <Button variant="outline" className="w-full" onClick={() => setView("main")}>
                Back to sign in
              </Button>
            </div>
          ) : view === "forgot" ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-invalid={!!forgotErrors.email}
                />
                {forgotErrors.email && (
                  <p className="text-xs text-destructive">{forgotErrors.email}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setView("main")}
              >
                Cancel
              </Button>
            </form>
          ) : (
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    aria-invalid={!!signInErrors.email}
                  />
                  {signInErrors.email && (
                    <p className="text-xs text-destructive">{signInErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInErrors({});
                        setView("forgot");
                      }}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    aria-invalid={!!signInErrors.password}
                  />
                  {signInErrors.password && (
                    <p className="text-xs text-destructive">{signInErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    required
                    maxLength={100}
                    aria-invalid={!!signUpErrors.fullName}
                  />
                  {signUpErrors.fullName && (
                    <p className="text-xs text-destructive">{signUpErrors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    aria-invalid={!!signUpErrors.email}
                  />
                  {signUpErrors.email && (
                    <p className="text-xs text-destructive">{signUpErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    aria-invalid={!!signUpErrors.password}
                  />
                  {signUpErrors.password && (
                    <p className="text-xs text-destructive">{signUpErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}

          {view === "main" && (
          <>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={submitting}
          >
            Continue with Google
          </Button>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;