import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, ArrowRight, FolderKanban, User as UserIcon, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskStatusBadge } from "@/components/TaskStatusBadge";
import { format, isPast } from "date-fns";
import { toast } from "sonner";
import { DiagnosticTool } from "@/components/DiagnosticTool";

type TaskRow = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  project_id: string;
  projects: { name: string } | null;
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const isSuperAdmin = profile?.role === "super_admin";
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: t }, { count }] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, status, priority, due_date, project_id")
          .eq("assignee_id", user.id)
          .order("due_date", { ascending: true, nullsFirst: false }),
        supabase.from("project_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      let tasksWithProject = (t as TaskRow[]) ?? [];
      if (tasksWithProject.length) {
        const projectIds = [...new Set(tasksWithProject.map(task => task.project_id))];
        const { data: projs } = await supabase.from("projects").select("id, name").in("id", projectIds);
        const projsById = Object.fromEntries((projs ?? []).map(p => [p.id, p]));
        tasksWithProject = tasksWithProject.map(task => ({
          ...task,
          projects: projsById[task.project_id] || null
        }));
      }

      setTasks(tasksWithProject as TaskRow[]);
      setProjectCount(count ?? 0);
      setLoading(false);
    })();
  }, [user]);

  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");
  const overdue = open.filter((t) => t.due_date && isPast(new Date(t.due_date)));

  const stats = [
    { label: "Projects", value: projectCount, icon: ListTodo, accent: "text-primary" },
    { label: "Open tasks", value: open.length, icon: Clock, accent: "text-primary-glow" },
    { label: "Overdue", value: overdue.length, icon: AlertTriangle, accent: "text-destructive" },
    { label: "Completed", value: done.length, icon: CheckCircle2, accent: "text-success" },
  ];

  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there"}
          </h1>
          {isSuperAdmin && (
            <Badge className="bg-warning/20 text-warning border-warning/30 gap-1.5 py-1">
              <Crown className="h-3.5 w-3.5" /> System Admin
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSuperAdmin 
            ? "You are in System Administration mode. All projects are visible." 
            : "Here's what's happening across your projects."}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <s.icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <div>
                <div className="text-2xl font-semibold">{loading ? "—" : s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full border-[10px] border-secondary/40"
                style={{
                  background: `conic-gradient(
                    hsl(var(--primary)) 0% ${tasks.length ? (tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100 : 0}%,
                    #10b981 ${tasks.length ? (tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100 : 0}% ${tasks.length ? ((tasks.filter(t => t.status === 'in_progress').length + tasks.filter(t => t.status === 'done').length) / tasks.length) * 100 : 0}%,
                    hsl(var(--muted-foreground)) ${tasks.length ? ((tasks.filter(t => t.status === 'in_progress').length + tasks.filter(t => t.status === 'done').length) / tasks.length) * 100 : 0}% 100%
                  )`,
                  mask: 'radial-gradient(transparent 58%, black 60%)',
                  WebkitMask: 'radial-gradient(transparent 58%, black 60%)'
                }}
              />
              <div className="text-center">
                <div className="text-2xl font-bold">{tasks.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
              </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-2">
              <div className="rounded-lg bg-secondary/30 p-2 text-center">
                <div className="text-sm font-semibold">{tasks.filter(t => t.status === 'todo').length}</div>
                <div className="text-[10px] text-muted-foreground">Todo</div>
              </div>
              <div className="rounded-lg bg-primary/10 p-2 text-center border border-primary/20">
                <div className="text-sm font-semibold text-primary">{tasks.filter(t => t.status === 'in_progress').length}</div>
                <div className="text-[10px] text-muted-foreground">Active</div>
              </div>
              <div className="rounded-lg bg-success/10 p-2 text-center border border-success/20">
                <div className="text-sm font-semibold text-success">{tasks.filter(t => t.status === 'done').length}</div>
                <div className="text-[10px] text-muted-foreground">Done</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link to="/projects">
              <Button variant="outline" className="w-full justify-start gap-2 bg-secondary/20 border-border/40">
                <FolderKanban className="h-4 w-4 text-primary" /> Create New Project
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start gap-2 bg-secondary/20 border-border/40" onClick={() => toast.info("Profile settings coming soon!")}>
              <UserIcon className="h-4 w-4 text-primary" /> Update My Profile
            </Button>
            
            {isSuperAdmin && <div className="mt-2"><DiagnosticTool /></div>}

            <div className="mt-4 rounded-xl bg-gradient-primary/10 p-4 border border-primary/20">
              <div className="text-xs font-medium text-primary mb-1">Stack Tip</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Stay on top of your deadlines by checking the "Overdue" panel. Tasks assigned to you appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Overdue</span>
              <Badge variant="outline">{overdue.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue.length === 0 && !loading && (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing overdue. Nice work.</p>
            )}
            {overdue.map((t) => (
              <TaskListItem key={t.id} task={t} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary-glow" /> My open tasks</span>
              <Badge variant="outline">{open.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {open.length === 0 && !loading && (
              <p className="py-8 text-center text-sm text-muted-foreground">No open tasks assigned to you.</p>
            )}
            {open.slice(0, 8).map((t) => (
              <TaskListItem key={t.id} task={t} />
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

const TaskListItem = ({ task }: { task: TaskRow }) => {
  const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "done";
  return (
    <Link
      to={`/projects/${task.project_id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3 transition-colors hover:bg-secondary"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <PriorityDot priority={task.priority} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{task.title}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{task.projects?.name ?? "Project"}</span>
            {task.due_date && (
              <>
                <span>•</span>
                <span className={overdue ? "text-destructive" : ""}>
                  {format(new Date(task.due_date), "MMM d")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <TaskStatusBadge status={task.status} />
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
};

const PriorityDot = ({ priority }: { priority: "low" | "medium" | "high" }) => {
  const cls = priority === "high" ? "bg-destructive" : priority === "medium" ? "bg-warning" : "bg-muted-foreground";
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cls}`} title={priority} />;
};

export default Dashboard;