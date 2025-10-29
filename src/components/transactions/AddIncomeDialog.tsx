import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddIncomeDialog = ({ open, onOpenChange }: AddIncomeDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createExpense = useCreateExpense();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add income",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid income amount",
        variant: "destructive",
      });
      return;
    }

    createExpense.mutate(
      {
        amount: parseFloat(amount),
        category: "Income",
        description: description || "Income",
        expense_date: date,
        receipt_url: null,
        type: "income",
      },
      {
        onSuccess: () => {
          toast({
            title: "Income added",
            description: "Your income has been recorded successfully",
          });
          setAmount("");
          setDescription("");
          setDate(new Date().toISOString().split('T')[0]);
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Record a new income transaction
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., Salary, Freelance project, Bonus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Income
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
