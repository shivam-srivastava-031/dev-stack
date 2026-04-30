import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskStatusBadge } from "@/components/TaskStatusBadge";
import { format, isPast } from "date-fns";

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
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: t }, { count }] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, status, priority, due_date, project_id, projects(name)")
          .eq("assignee_id", user.id)
          .order("due_date", { ascending: true, nullsFirst: false }),
        supabase.from("project_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setTasks((t as TaskRow[]) ?? []);
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
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across your projects.</p>
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

      <Card className="mb-8 border-border/60 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Task Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary/60">
            <div 
              className="bg-primary-glow transition-all duration-500" 
              style={{ width: `${tasks.length ? (tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100 : 0}%` }}
              title="In Progress"
            />
            <div 
              className="bg-success transition-all duration-500" 
              style={{ width: `${tasks.length ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0}%` }}
              title="Done"
            />
            <div 
              className="bg-muted-foreground/30 transition-all duration-500" 
              style={{ width: `${tasks.length ? (tasks.filter(t => t.status === 'todo').length / tasks.length) * 100 : 0}%` }}
              title="Todo"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Todo
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary-glow" /> In Progress
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success" /> Done
            </div>
          </div>
        </CardContent>
      </Card>

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