import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRecurringTemplate, useUpdateRecurringTemplate, RecurringTemplate } from "@/hooks/useRecurringTemplates";

const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Rent",
  "Insurance",
  "Subscriptions",
  "Other",
];

interface RecurringTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: RecurringTemplate;
}

export function RecurringTemplateDialog({
  open,
  onOpenChange,
  template,
}: RecurringTemplateDialogProps) {
  const [name, setName] = useState(template?.name || "");
  const [amount, setAmount] = useState(template?.amount?.toString() || "");
  const [category, setCategory] = useState(template?.category || "");
  const [description, setDescription] = useState(template?.description || "");
  const [scheduleDay, setScheduleDay] = useState(template?.schedule_day?.toString() || "1");

  const createTemplate = useCreateRecurringTemplate();
  const updateTemplate = useUpdateRecurringTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      amount: parseFloat(amount),
      category,
      description: description || null,
      schedule_day: parseInt(scheduleDay),
      is_active: true,
    };

    if (template) {
      await updateTemplate.mutateAsync({ id: template.id, ...data });
    } else {
      await createTemplate.mutateAsync(data);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    if (!template) {
      setName("");
      setAmount("");
      setCategory("");
      setDescription("");
      setScheduleDay("1");
    }
  };

  const isLoading = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Recurring Expense" : "Schedule Recurring Expense"}
          </DialogTitle>
          <DialogDescription>
            This expense will be automatically added on the selected day each month.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Netflix Subscription"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduleDay">Day of Month</Label>
            <Select value={scheduleDay} onValueChange={setScheduleDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}{day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The expense will be auto-added on this day each month
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : template ? "Update" : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
