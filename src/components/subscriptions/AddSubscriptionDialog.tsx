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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSubscription } from "@/hooks/useSubscriptions";
import { addMonths, addDays, addYears, format } from "date-fns";

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSubscriptionDialog = ({ open, onOpenChange }: AddSubscriptionDialogProps) => {
  const [serviceName, setServiceName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "weekly" | "quarterly">("monthly");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const createSubscription = useCreateSubscription();

  const calculateNextBillingDate = () => {
    const start = new Date(startDate);
    switch (billingCycle) {
      case "weekly":
        return format(addDays(start, 7), "yyyy-MM-dd");
      case "monthly":
        return format(addMonths(start, 1), "yyyy-MM-dd");
      case "quarterly":
        return format(addMonths(start, 3), "yyyy-MM-dd");
      case "yearly":
        return format(addYears(start, 1), "yyyy-MM-dd");
      default:
        return format(addMonths(start, 1), "yyyy-MM-dd");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceName || !amount) {
      return;
    }

    await createSubscription.mutateAsync({
      service_name: serviceName,
      amount: parseFloat(amount),
      billing_cycle: billingCycle,
      start_date: startDate,
      next_billing_date: calculateNextBillingDate(),
      status: "active",
      category: category || undefined,
      description: description || undefined,
      reminder_enabled: true,
    });

    setServiceName("");
    setAmount("");
    setBillingCycle("monthly");
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setCategory("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>Add a new recurring subscription</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Netflix, Spotify, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle *</Label>
            <Select value={billingCycle} onValueChange={(value: any) => setBillingCycle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Entertainment, Utilities, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSubscription.isPending}>
              {createSubscription.isPending ? "Adding..." : "Add Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
