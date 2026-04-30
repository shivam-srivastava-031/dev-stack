import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "todo" | "in_progress" | "done";

const map: Record<Status, { label: string; cls: string }> = {
  todo: { label: "To do", cls: "border-border bg-secondary text-muted-foreground" },
  in_progress: { label: "In progress", cls: "border-primary/40 bg-primary/15 text-primary-glow" },
  done: { label: "Done", cls: "border-success/40 bg-success/15 text-success" },
};

export const TaskStatusBadge = ({ status }: { status: Status }) => {
  const m = map[status];
  return (
    <Badge variant="outline" className={cn("shrink-0 font-normal", m.cls)}>
      {m.label}
    </Badge>
  );
};