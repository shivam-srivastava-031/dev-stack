import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, LogOut, Layers } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-gradient-glow" />
      <header className="relative z-10 border-b border-border/60 bg-card/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Stack</span>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                {initials}
              </div>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
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