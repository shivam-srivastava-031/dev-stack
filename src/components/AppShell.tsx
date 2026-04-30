import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, LogOut, Layers, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  const initials = (profile?.full_name || user?.email || "?").slice(0, 2).toUpperCase();
  const isSuperAdmin = profile?.global_role === "super_admin";

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-gradient-glow" />
      <header className="relative z-10 border-b border-border/60 bg-card/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow ring-1 ring-white/20">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Harmony Hub
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              {isSuperAdmin && (
                <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning ring-1 ring-warning/30">
                  <Crown className="h-3 w-3" /> Admin
                </div>
              )}
              <div className="flex flex-col items-end mr-1">
                <span className="text-sm font-medium text-foreground">{profile?.full_name || user?.email?.split('@')[0]}</span>
                <span className="text-[10px] text-muted-foreground">Active Hub</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary border border-border/40 text-xs font-semibold shadow-sm overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="container flex items-center gap-1 pb-3 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm",
                  isActive ? "bg-secondary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="container relative z-10 py-8">{children}</main>
    </div>
  );
};