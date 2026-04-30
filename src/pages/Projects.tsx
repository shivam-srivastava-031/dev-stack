import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FolderKanban, Crown, User as UserIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

type Row = {
  role: "admin" | "member";
  projects: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
  } | null;
};

const projectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  description: z.string().trim().max(500).optional(),
});

const Projects = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("project_members")
      .select("role, projects(id, name, description, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setRows((data as Row[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = projectSchema.safeParse({
      name: fd.get("name"),
      description: fd.get("description") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("projects").insert({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      owner_id: user.id,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project created");
    setOpen(false);
    fetchProjects();
  };

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">All projects you're a member of.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> New project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required maxLength={80} placeholder="Marketing site v2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" maxLength={500} rows={3} placeholder="What's this project about?" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No projects yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first project to start organizing tasks.</p>
            </div>
            <Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> New project</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => r.projects && (
            <Link key={r.projects.id} to={`/projects/${r.projects.id}`}>
              <Card className="group h-full border-border/60 bg-card/60 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-glow">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                      <FolderKanban className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <Badge variant="outline" className="gap-1 border-border bg-secondary/60 text-xs">
                      {r.role === "admin" ? <Crown className="h-3 w-3 text-warning" /> : <UserIcon className="h-3 w-3" />}
                      {r.role}
                    </Badge>
                  </div>
                  <h3 className="font-medium group-hover:text-primary-glow">{r.projects.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {r.projects.description || "No description"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Projects;