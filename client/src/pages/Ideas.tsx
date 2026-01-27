import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Ideas() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: ideas } = trpc.ideas.getAll.useQuery();

  const createMutation = trpc.ideas.create.useMutation({
    onSuccess: () => {
      utils.ideas.getAll.invalidate();
      toast.success("Idea captured successfully");
      setDialogOpen(false);
    },
  });

  const deleteMutation = trpc.ideas.delete.useMutation({
    onSuccess: () => {
      utils.ideas.getAll.invalidate();
      toast.success("Idea deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      category: formData.get("category") as string,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Idea Brain Bump</h1>
          <p className="text-muted-foreground text-lg mt-2">Capture innovation, strategy notes, and creative insights</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Idea</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Capture New Idea</DialogTitle>
                <DialogDescription>Document your thoughts and insights</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input id="title" name="title" placeholder="Brief headline for your idea" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input id="category" name="category" placeholder="e.g., Strategy, Innovation, Process" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" rows={8} required placeholder="Describe your idea in detail..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Idea"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {ideas && ideas.length > 0 ? (
          ideas.map((idea) => (
            <Card key={idea.id} className="editorial-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { if (confirm("Delete this idea?")) { deleteMutation.mutate({ id: idea.id }); } }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {idea.title && <button onClick={() => setDialogOpen(true)} className="text-lg mt-2 font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left w-full">{idea.title}</button>}
                {idea.category && <Badge variant="outline" className="mt-2 w-fit">{idea.category}</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4">{idea.content}</p>
                <p className="text-xs text-muted-foreground mt-4">{format(new Date(idea.createdAt), "MMM dd, yyyy")}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="editorial-card col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No ideas captured yet. Start documenting your insights above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
