import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Layers, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Layers, title: "Projects & tasks", desc: "Organize work into projects with a clean kanban board." },
  { icon: Users, title: "Team collaboration", desc: "Invite teammates and assign tasks with due dates." },
  { icon: Shield, title: "Role-based access", desc: "Admins manage. Members ship. Permissions enforced server-side." },
  { icon: CheckCircle2, title: "Track progress", desc: "Dashboard surfaces overdue and open work at a glance." },
];

const Index = () => {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
      <header className="container relative z-10 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Stack</span>
        </div>
        <Button asChild variant="ghost">
          <Link to={user ? "/dashboard" : "/auth"}>{user ? "Open app" : "Sign in"}</Link>
        </Button>
      </header>

      <main className="container relative z-10">
        <section className="flex flex-col items-center pt-20 pb-24 text-center md:pt-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-glow" /> Project & task management
          </div>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Plan projects.<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Ship faster, together.</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-muted-foreground">
            Stack is a focused workspace for teams to manage projects, assign tasks,
            and track progress with role-based access.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to={user ? "/dashboard" : "/auth"}>
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                <f.icon className="h-4 w-4 text-primary-glow" />
              </div>
              <h3 className="text-sm font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Index;
