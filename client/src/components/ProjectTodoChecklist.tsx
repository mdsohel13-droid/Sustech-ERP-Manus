import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  PlayCircle,
  ClipboardList,
  Settings,
  Eye,
  ShieldCheck,
  CreditCard,
  Lock,
  MessageSquare,
  Check,
} from "lucide-react";

type ProjectStage = "initiation" | "planning" | "execution" | "monitoring" | "closure_technical" | "payment_due" | "financial_closure";

const STAGE_TODO_ITEMS: Record<ProjectStage, string[]> = {
  initiation: [
    "Define objectives",
    "Stakeholders",
    "Get initial approval to proceed",
  ],
  planning: [
    "Lock scope",
    "Schedule",
    "Cost",
    "Risk/communication plans",
  ],
  execution: [
    "Deliver the agreed work and outputs for the client",
  ],
  monitoring: [
    "Track progress",
    "Manage changes",
    "Ensure quality",
  ],
  closure_technical: [
    "Deliverables accepted",
    "Sign‑off received",
  ],
  payment_due: [
    "Raise final invoice(s)",
    "Confirm due date and amount as per contract milestones",
  ],
  financial_closure: [
    "Confirm all payments received",
    "Update accounts",
    "Move the project to the Archive tab for reference and audits",
  ],
};

const STAGE_LABELS: Record<ProjectStage, string> = {
  initiation: "1. Initiation",
  planning: "2. Planning",
  execution: "3. Execution",
  monitoring: "4. Monitoring and Control",
  closure_technical: "5. Closure (Technical)",
  payment_due: "6. Payment Due",
  financial_closure: "7. Financial Closure",
};

const STAGE_DESCRIPTIONS: Record<ProjectStage, string> = {
  initiation: "Define objectives, Stakeholders, and Get initial approval to proceed.",
  planning: "Lock scope, schedule, cost, and risk/communication plans.",
  execution: "Deliver the agreed work and outputs for the client.",
  monitoring: "Track progress, manage changes, and ensure quality.",
  closure_technical: "Deliverables accepted and sign‑off received.",
  payment_due: "Raise final invoice(s), confirm due date and amount as per contract milestones.",
  financial_closure: "Confirm all payments received, Update accounts, then Move the project to the Archive tab.",
};

const STAGE_ICONS: Record<ProjectStage, React.ReactNode> = {
  initiation: <PlayCircle className="h-4 w-4" />,
  planning: <ClipboardList className="h-4 w-4" />,
  execution: <Settings className="h-4 w-4" />,
  monitoring: <Eye className="h-4 w-4" />,
  closure_technical: <ShieldCheck className="h-4 w-4" />,
  payment_due: <CreditCard className="h-4 w-4" />,
  financial_closure: <Lock className="h-4 w-4" />,
};

const STAGE_COLORS: Record<ProjectStage, string> = {
  initiation: "bg-blue-50 border-blue-200",
  planning: "bg-amber-50 border-amber-200",
  execution: "bg-purple-50 border-purple-200",
  monitoring: "bg-emerald-50 border-emerald-200",
  closure_technical: "bg-teal-50 border-teal-200",
  payment_due: "bg-orange-50 border-orange-200",
  financial_closure: "bg-slate-50 border-slate-200",
};

const STAGE_BADGE_COLORS: Record<ProjectStage, string> = {
  initiation: "bg-blue-100 text-blue-800",
  planning: "bg-amber-100 text-amber-800",
  execution: "bg-purple-100 text-purple-800",
  monitoring: "bg-emerald-100 text-emerald-800",
  closure_technical: "bg-teal-100 text-teal-800",
  payment_due: "bg-orange-100 text-orange-800",
  financial_closure: "bg-slate-100 text-slate-800",
};

const ALL_STAGES: ProjectStage[] = [
  "initiation", "planning", "execution", "monitoring",
  "closure_technical", "payment_due", "financial_closure"
];

interface ProjectTodoChecklistProps {
  projectId: number;
  currentStage: string;
}

export function ProjectTodoChecklist({ projectId, currentStage }: ProjectTodoChecklistProps) {
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const utils = trpc.useUtils();

  const { data: todos = [], isLoading } = trpc.projects.getTodos.useQuery(
    { projectId },
  );

  const initMutation = trpc.projects.initTodos.useMutation({
    onSuccess: () => {
      utils.projects.getTodos.invalidate({ projectId });
    },
  });

  const updateMutation = trpc.projects.updateTodo.useMutation({
    onSuccess: () => {
      utils.projects.getTodos.invalidate({ projectId });
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!isLoading && todos.length === 0 && projectId) {
      const allTodos = ALL_STAGES.flatMap(stage =>
        STAGE_TODO_ITEMS[stage].map(title => ({ stage, title }))
      );
      initMutation.mutate({ projectId, todos: allTodos });
    }
  }, [isLoading, todos.length, projectId]);

  const handleToggle = (todoId: number, currentState: boolean) => {
    updateMutation.mutate({
      id: todoId,
      isCompleted: !currentState,
    });
  };

  const handleSaveComment = (todoId: number) => {
    updateMutation.mutate({
      id: todoId,
      comment: commentText || null,
    });
    setEditingComment(null);
    setCommentText("");
  };

  const currentStageIndex = ALL_STAGES.indexOf(currentStage as ProjectStage);

  const todosByStage = ALL_STAGES.map(stage => ({
    stage,
    items: todos.filter(t => t.stage === stage),
  }));

  if (isLoading) {
    return <div className="text-sm text-muted-foreground p-4">Loading checklist...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Check className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold">Project ToDo Checklist</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {todos.filter(t => t.isCompleted).length}/{todos.length} completed
        </span>
      </div>
      <ScrollArea className="h-[400px] pr-2">
        <div className="space-y-3">
          {todosByStage.map(({ stage, items }) => {
            const stageIdx = ALL_STAGES.indexOf(stage);
            const isCurrentStage = stage === currentStage;
            const isCompletedStage = items.length > 0 && items.every(i => i.isCompleted);
            const completedCount = items.filter(i => i.isCompleted).length;

            return (
              <div
                key={stage}
                className={`rounded-lg border p-3 transition-all ${
                  isCurrentStage ? `${STAGE_COLORS[stage]} ring-2 ring-offset-1 ring-blue-400` :
                  isCompletedStage ? "bg-green-50/50 border-green-200" :
                  "bg-card border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${isCurrentStage ? "text-blue-600" : "text-muted-foreground"}`}>
                    {STAGE_ICONS[stage]}
                  </span>
                  <span className="text-xs font-semibold flex-1">
                    {STAGE_LABELS[stage]}
                  </span>
                  {isCurrentStage && (
                    <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">Current</Badge>
                  )}
                  {isCompletedStage && (
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0">Done</Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {completedCount}/{items.length}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2 italic">{STAGE_DESCRIPTIONS[stage]}</p>
                <div className="space-y-1.5">
                  {items.map(todo => (
                    <div key={todo.id} className="flex items-start gap-2 group">
                      <Checkbox
                        checked={todo.isCompleted}
                        onCheckedChange={() => handleToggle(todo.id, todo.isCompleted)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs leading-tight ${todo.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                          {todo.title}
                        </span>
                        {todo.comment && editingComment !== todo.id && (
                          <p className="text-[10px] text-blue-600 mt-0.5 flex items-center gap-1">
                            <MessageSquare className="h-2.5 w-2.5" />
                            {todo.comment}
                          </p>
                        )}
                        {editingComment === todo.id ? (
                          <div className="flex items-center gap-1 mt-1">
                            <Input
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Add comment..."
                              className="h-6 text-[10px] flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveComment(todo.id);
                                if (e.key === "Escape") { setEditingComment(null); setCommentText(""); }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveComment(todo.id)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 px-1"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingComment(null); setCommentText(""); }}
                              className="text-[10px] text-muted-foreground hover:text-foreground px-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingComment(todo.id); setCommentText(todo.comment || ""); }}
                            className="text-[10px] text-muted-foreground hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                          >
                            <MessageSquare className="h-2.5 w-2.5 inline mr-0.5" />
                            {todo.comment ? "Edit comment" : "Add comment"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
