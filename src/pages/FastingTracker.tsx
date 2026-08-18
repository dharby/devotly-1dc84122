import { useState } from "react";
import { ChevronLeft, Plus, CheckCircle2, Calendar, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FASTING_PLANS, type FastingPlan } from "@/lib/fastingStore";
import { useFasts, type ActiveFast } from "@/hooks/useFasts";

const FastingTracker = () => {
  const navigate = useNavigate();
  const { fasts, startFast, checkinFast, deleteFast, updateFast } = useFasts();
  const [showPlans, setShowPlans] = useState(false);

  const [editingFast, setEditingFast] = useState<ActiveFast | null>(null);
  const [editPlanId, setEditPlanId] = useState("");
  const [editStartDate, setEditStartDate] = useState("");

  const [deletingFast, setDeletingFast] = useState<ActiveFast | null>(null);

  const handleStart = async (plan: FastingPlan) => {
    await startFast(plan);
    setShowPlans(false);
  };

  const handleCheckin = async (fastId: string) => {
    await checkinFast(fastId);
  };

  const openEdit = (fast: ActiveFast) => {
    setEditPlanId(fast.planId);
    setEditStartDate(fast.startDate);
    setEditingFast(fast);
  };

  const handleEditSave = async () => {
    if (!editingFast) return;
    const plan = FASTING_PLANS.find((p) => p.id === editPlanId);
    if (!plan) return;
    await updateFast(editingFast.id, {
      planId: plan.id,
      planName: plan.name,
      durationDays: plan.durationDays,
      startDate: editStartDate,
    });
    setEditingFast(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFast) return;
    await deleteFast(deletingFast.id);
    setDeletingFast(null);
  };

  const today = new Date().toISOString().split("T")[0];
  const activeFasts = fasts.filter((f) => !f.completed);
  const completedFasts = fasts.filter((f) => f.completed);

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold">Fasting Tracker</h1>
          </div>
          <Button variant="golden" size="sm" className="rounded-xl" onClick={() => setShowPlans(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Fast
          </Button>
        </div>
      </div>

      <div className="px-6 pt-6 animate-fade-in">
        {showPlans && (
          <div className="mb-6">
            <h2 className="font-display text-base font-semibold mb-3">Choose a Fasting Plan</h2>
            <div className="space-y-2">
              {FASTING_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleStart(plan)}
                  className="w-full text-left bg-card rounded-xl p-4 border border-border hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{plan.durationDays} days</span>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-3 rounded-xl" onClick={() => setShowPlans(false)}>Cancel</Button>
          </div>
        )}

        {activeFasts.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-base font-semibold mb-3">Active Fasts</h2>
            <div className="space-y-3">
              {activeFasts.map((fast) => (
                <FastCard
                  key={fast.id}
                  fast={fast}
                  today={today}
                  onCheckin={handleCheckin}
                  onEdit={openEdit}
                  onDelete={setDeletingFast}
                />
              ))}
            </div>
          </div>
        )}

        {activeFasts.length === 0 && !showPlans && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">No Active Fasts</h2>
            <p className="text-sm text-muted-foreground mb-4">Start a fasting plan to draw closer to God</p>
            <Button variant="golden" className="rounded-xl" onClick={() => setShowPlans(true)}>
              <Plus className="h-4 w-4 mr-2" /> Start a Fast
            </Button>
          </div>
        )}

        {completedFasts.length > 0 && (
          <div>
            <h2 className="font-display text-base font-semibold mb-3">Completed</h2>
            <div className="space-y-2">
              {completedFasts.map((fast) => (
                <CompletedCard
                  key={fast.id}
                  fast={fast}
                  onEdit={openEdit}
                  onDelete={setDeletingFast}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deletingFast} onOpenChange={(o) => !o && setDeletingFast(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this fast?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingFast && (
                <>
                  &ldquo;{deletingFast.planName}&rdquo; and all its check-ins will be permanently removed. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingFast} onOpenChange={(o) => !o && setEditingFast(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Fast</DialogTitle>
            <DialogDescription>Update the plan or start date for this fast.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-plan">Fasting Plan</Label>
              <Select value={editPlanId} onValueChange={setEditPlanId}>
                <SelectTrigger id="edit-plan" className="rounded-xl">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {FASTING_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name} · {plan.durationDays} days</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-start">Start Date</Label>
              <Input
                id="edit-start"
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditingFast(null)}>Cancel</Button>
            <Button variant="golden" className="rounded-xl" onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function FastCard({
  fast,
  today,
  onCheckin,
  onEdit,
  onDelete,
}: {
  fast: ActiveFast;
  today: string;
  onCheckin: (id: string) => void;
  onEdit: (fast: ActiveFast) => void;
  onDelete: (fast: ActiveFast) => void;
}) {
  const progressPercent = (fast.checkins.length / fast.durationDays) * 100;
  const checkedInToday = fast.checkins.includes(today);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-display font-semibold text-sm">{fast.planName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Day {fast.checkins.length} of {fast.durationDays} · Started {fast.startDate}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(fast)}
            aria-label="Edit fast"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(fast)}
            aria-label="Delete fast"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Progress value={progressPercent} className="h-2 mb-3" />
      <Button variant={checkedInToday ? "secondary" : "golden"} size="sm" className="w-full rounded-xl" onClick={() => onCheckin(fast.id)} disabled={checkedInToday}>
        <CheckCircle2 className={cn("h-4 w-4 mr-1", checkedInToday && "fill-current")} />
        {checkedInToday ? "Checked in today" : "Check in for today"}
      </Button>
    </div>
  );
}

function CompletedCard({
  fast,
  onEdit,
  onDelete,
}: {
  fast: ActiveFast;
  onEdit: (fast: ActiveFast) => void;
  onDelete: (fast: ActiveFast) => void;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border opacity-70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <p className="font-display font-semibold text-sm">{fast.planName}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(fast)}
            aria-label="Edit fast"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(fast)}
            aria-label="Delete fast"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {fast.checkins.length}/{fast.durationDays} days · Started {fast.startDate}
      </p>
    </div>
  );
}

export default FastingTracker;
