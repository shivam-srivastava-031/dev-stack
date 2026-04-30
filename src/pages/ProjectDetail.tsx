import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Crown, UserIcon, Trash2, Settings } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatusBadge } from "@/components/TaskStatusBadge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

type Project = { id: string; name: string; description: string | null; owner_id: string };
type Member = {
  id: string;
  user_id: string;
  role: "admin" | "member";
  profile: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
};
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assignee_id: string | null;
  created_by: string;
};

const projectSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  description: z.string().trim().max(500).optional(),
});

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(120),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional(),
  assignee_id: z.string().optional(),
});

const memberInviteSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  role: z.enum(["admin", "member"]),
});

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [updatingProject, setUpdatingProject] = useState(false);

  const myRole = useMemo(
    () => members.find((m) => m.user_id === user?.id)?.role,
    [members, user]
  );
  const isAdmin = myRole === "admin";
  const isOwner = project?.owner_id === user?.id;

  const checkPermission = (action: "edit_project" | "delete_project" | "manage_members" | "delete_task" | "edit_task", task?: Task) => {
    if (action === "delete_project") return isOwner;
    if (isAdmin) return true;
    switch (action) {
      case "edit_task":
        return task?.assignee_id === user?.id || task?.created_by === user?.id;
      case "delete_task":
        return task?.created_by === user?.id;
      default:
        return false;
    }
  };

  const fetchAll = async () => {
    if (!id) return;
    const [{ data: p, error: pErr }, { data: m }, { data: t }] = await Promise.all([
      supabase.from("projects").select("id, name, description, owner_id").eq("id", id).maybeSingle(),
      supabase
        .from("project_members")
        .select("id, user_id, role")
        .eq("project_id", id),
      supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, assignee_id, created_by")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);
    if (pErr || !p) {
      console.error("Fetch project error:", pErr);
      toast.error("Project not found");
      navigate("/projects");
      return;
    }
    const memberRows = (m as { id: string; user_id: string; role: "admin" | "member" }[]) ?? [];
    const userIds = memberRows.map((r) => r.user_id);
    let profilesById: Record<string, { full_name: string | null; email: string | null; avatar_url: string | null }> = {};
    if (userIds.length) {
      const { data: profs, error: profsErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);
      
      if (profsErr) {
        console.error("Fetch profiles error:", profsErr);
      }

      (profs ?? []).forEach((p) => {
        profilesById[p.id] = { full_name: p.full_name, email: p.email, avatar_url: p.avatar_url };
      });
    }
    setProject(p as Project);
    setMembers(memberRows.map((r) => ({ ...r, profile: profilesById[r.user_id] ?? null })));
    setTasks((t as Task[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !project) return;
    const fd = new FormData(e.currentTarget);
    const parsed = projectSchema.safeParse({
      name: fd.get("name"),
      description: fd.get("description") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setUpdatingProject(true);
    const { error } = await supabase.from("projects").update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    }).eq("id", id);
    setUpdatingProject(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project updated");
    setProject({ ...project, ...parsed.data, description: parsed.data.description ?? null });
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project deleted");
    navigate("/projects");
  };

  const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !id) return;
    const fd = new FormData(e.currentTarget);
    const parsed = taskSchema.safeParse({
      title: fd.get("title"),
      description: fd.get("description") || undefined,
      status: fd.get("status"),
      priority: fd.get("priority"),
      due_date: fd.get("due_date") || undefined,
      assignee_id: fd.get("assignee_id") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const payload = {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date ? new Date(parsed.data.due_date).toISOString() : null,
      assignee_id: parsed.data.assignee_id && parsed.data.assignee_id !== "none" ? parsed.data.assignee_id : null,
    };
    
    // Safety check: ensure assignee is a member
    if (payload.assignee_id && !members.some(m => m.user_id === payload.assignee_id)) {
      toast.error("Assignee must be a member of this project");
      return;
    }
    let error;
    if (editingTask) {
      ({ error } = await supabase.from("tasks").update(payload).eq("id", editingTask.id));
    } else {
      ({ error } = await supabase.from("tasks").insert({
        ...payload,
        project_id: id,
        created_by: user.id,
      }));
    }
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingTask ? "Task updated" : "Task created");
    setTaskOpen(false);
    setEditingTask(null);
    fetchAll();
  };

  const handleQuickStatus = async (task: Task, status: Task["status"]) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", task.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Task deleted");
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    const fd = new FormData(e.currentTarget);
    const parsed = memberInviteSchema.safeParse({
      email: fd.get("email"),
      role: fd.get("role"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const { email, role } = parsed.data;
    // Find profile by email
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (pErr || !profile) {
      toast.error("No user found with that email. They must sign up first.");
      return;
    }
    const { error } = await supabase.from("project_members").insert({
      project_id: id,
      user_id: profile.id,
      role,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Member added");
    setInviteOpen(false);
    fetchAll();
  };

  const handleChangeRole = async (memberId: string, role: "admin" | "member") => {
    const { error } = await supabase.from("project_members").update({ role }).eq("id", memberId);
    if (error) {
      toast.error(error.message);
      return;
    }
    fetchAll();
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from("project_members").delete().eq("id", memberId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Member removed");
    fetchAll();
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === "all" || t.assignee_id === assigneeFilter;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  const grouped = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    done: filteredTasks.filter((t) => t.status === "done"),
  };

  if (loading || !project) {
    return (
      <AppShell>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className="gap-1">
              {isAdmin ? <Crown className="h-3 w-3 text-warning" /> : <UserIcon className="h-3 w-3" />}
              {myRole}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Button onClick={() => { setEditingTask(null); setTaskOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> New task
        </Button>
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="board" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary/40"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px] bg-secondary/40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[160px] bg-secondary/40">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="none">Unassigned</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.profile?.full_name ?? m.profile?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchQuery || priorityFilter !== "all" || assigneeFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchQuery(""); setPriorityFilter("all"); setAssigneeFilter("all"); }}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(["todo", "in_progress", "done"] as const).map((col) => (
              <Card key={col} className="border-border/60 bg-card/40 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <TaskStatusBadge status={col} />
                    <span className="text-xs text-muted-foreground">{grouped[col].length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {grouped[col].length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>
                  )}
                  {grouped[col].map((task) => {
                    const assignee = members.find((m) => m.user_id === task.assignee_id);
                    const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "done";
                    const canEdit = isAdmin || task.assignee_id === user?.id || task.created_by === user?.id;
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => canEdit ? (setEditingTask(task), setTaskOpen(true)) : null}
                        className={cn(
                          "w-full rounded-lg border border-border/60 bg-secondary/40 p-3 text-left transition-all hover:bg-secondary hover:shadow-md",
                          task.priority === "high" && "border-destructive/30",
                          task.priority === "medium" && "border-warning/30"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium">{task.title}</div>
                          <PriorityDot priority={task.priority} />
                        </div>
                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {assignee ? (
                              <span className="flex items-center gap-1">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-medium text-primary-foreground">
                                  {(assignee.profile?.full_name || assignee.profile?.email || "?").slice(0, 1).toUpperCase()}
                                </span>
                                <span className="truncate max-w-[80px]">{assignee.profile?.full_name ?? assignee.profile?.email}</span>
                              </span>
                            ) : (
                              <span>Unassigned</span>
                            )}
                          </div>
                          {task.due_date && (
                            <span className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                              {format(new Date(task.due_date), "MMM d")}
                            </span>
                          )}
                        </div>
                        {canEdit && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-1">
                            <div className="flex flex-wrap gap-1">
                              {(["todo", "in_progress", "done"] as const).filter((s) => s !== task.status).map((s) => (
                                <Badge
                                  key={s}
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); handleQuickStatus(task, s); }}
                                  className="cursor-pointer text-[10px] hover:bg-primary/20"
                                >
                                  → {s.replace("_", " ")}
                                </Badge>
                              ))}
                            </div>
                            {checkPermission("delete_task", task) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete task?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Team members</CardTitle>
              {checkPermission("manage_members") && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" /> Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite team member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" name="email" type="email" placeholder="colleague@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" defaultValue="member">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3 transition-colors hover:bg-secondary/60">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-medium text-primary-foreground shadow-glow">
                        {(m.profile?.full_name || m.profile?.email || "?").slice(0, 1).toUpperCase()}
                      </div>
                      {m.role === "admin" && (
                        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background p-0.5 shadow-sm">
                          <Crown className="h-2.5 w-2.5 text-warning" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{m.profile?.full_name ?? m.profile?.email}</div>
                      <div className="text-xs text-muted-foreground">{m.profile?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {isAdmin && m.user_id !== project.owner_id ? (
                      <Select value={m.role} onValueChange={(v) => handleChangeRole(m.id, v as "admin" | "member")}>
                        <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        {m.role === "admin" ? <Crown className="h-3 w-3 text-warning" /> : <UserIcon className="h-3 w-3" />}
                        {m.role}
                      </Badge>
                    )}
                    {isAdmin && m.user_id !== project.owner_id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove member?</AlertDialogTitle>
                            <AlertDialogDescription>They will lose access to this project.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveMember(m.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6">
              <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProject} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Name</Label>
                      <Input id="project-name" name="name" defaultValue={project.name} required maxLength={80} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-desc">Description</Label>
                      <Textarea id="project-desc" name="description" defaultValue={project.description ?? ""} maxLength={500} rows={3} />
                    </div>
                    <Button type="submit" disabled={updatingProject}>
                      {updatingProject ? "Saving..." : "Save changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Deleting a project is permanent and will remove all associated tasks and member associations.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Project</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the project
                          "<strong>{project.name}</strong>" and all its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base">Role Permissions Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="font-semibold text-warning">Admin</div>
                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                          <li>Edit project details</li>
                          <li>Delete project</li>
                          <li>Invite & remove members</li>
                          <li>Change member roles</li>
                          <li>Manage all tasks</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold">Member</div>
                        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                          <li>View project board</li>
                          <li>Create new tasks</li>
                          <li>Edit assigned tasks</li>
                          <li>Delete own tasks</li>
                          <li className="text-destructive/60">Cannot manage project</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={taskOpen} onOpenChange={(o) => { setTaskOpen(o); if (!o) setEditingTask(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required maxLength={120} defaultValue={editingTask?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" maxLength={2000} rows={3} defaultValue={editingTask?.description ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingTask?.status ?? "todo"}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To do</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue={editingTask?.priority ?? "medium"}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="assignee_id">Assignee</Label>
                <Select name="assignee_id" defaultValue={editingTask?.assignee_id ?? "none"}>
                  <SelectTrigger id="assignee_id"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.profile?.full_name ?? m.profile?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due date</Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  defaultValue={editingTask?.due_date ? editingTask.due_date.slice(0, 10) : ""}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{editingTask ? "Save" : "Create task"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

const PriorityDot = ({ priority }: { priority: "low" | "medium" | "high" }) => {
  const cls = priority === "high" ? "bg-destructive" : priority === "medium" ? "bg-warning" : "bg-muted-foreground";
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cls}`} title={priority} />;
};

export default ProjectDetail;