import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useSavings } from "@/hooks/useSavings";
import { SavingsGoalType } from "@/types";

const goalTypes: SavingsGoalType[] = [
  "Emergency Fund",
  "Vacation",
  "Down Payment",
  "Investment",
  "Education",
  "Retirement",
  "Other"
];

export const AddGoalDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [goalType, setGoalType] = useState<SavingsGoalType>("Emergency Fund");
  const [deadline, setDeadline] = useState("");
  
  const { createGoal } = useSavings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createGoal.mutate({
      title,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      goal_type: goalType,
      deadline: deadline || undefined,
    });
    
    setOpen(false);
    setTitle("");
    setTargetAmount("");
    setGoalType("Emergency Fund");
    setDeadline("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Emergency Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Target Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="10000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Goal Type</Label>
            <Select value={goalType} onValueChange={(value) => setGoalType(value as SavingsGoalType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Target Date (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createGoal.isPending}>
            {createGoal.isPending ? "Creating..." : "Create Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};