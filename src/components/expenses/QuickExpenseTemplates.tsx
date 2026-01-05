import { Coffee, Utensils, Car, ShoppingBag, Fuel, Ticket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuickTemplate {
  id: string;
  label: string;
  icon: typeof Coffee;
  category: string;
  defaultAmount: number;
  color: string;
}

const defaultTemplates: QuickTemplate[] = [
  { id: "coffee", label: "Coffee", icon: Coffee, category: "Food & Dining", defaultAmount: 50, color: "bg-amber-500" },
  { id: "lunch", label: "Lunch", icon: Utensils, category: "Food & Dining", defaultAmount: 150, color: "bg-orange-500" },
  { id: "transport", label: "Transport", icon: Car, category: "Transportation", defaultAmount: 100, color: "bg-blue-500" },
  { id: "fuel", label: "Fuel", icon: Fuel, category: "Transportation", defaultAmount: 500, color: "bg-green-500" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, category: "Shopping", defaultAmount: 200, color: "bg-pink-500" },
  { id: "entertainment", label: "Entertainment", icon: Ticket, category: "Entertainment", defaultAmount: 300, color: "bg-purple-500" },
];

interface QuickExpenseTemplatesProps {
  onExpenseAdded?: () => void;
}

export function QuickExpenseTemplates({ onExpenseAdded }: QuickExpenseTemplatesProps) {
  const { user } = useAuth();
  const createExpense = useCreateExpense();
  const [customDialog, setCustomDialog] = useState<{ open: boolean; template: QuickTemplate | null }>({
    open: false,
    template: null,
  });
  const [customAmount, setCustomAmount] = useState("");

  const handleQuickAdd = async (template: QuickTemplate) => {
    if (!user) {
      toast.error("Please login to add expenses");
      return;
    }

    try {
      await createExpense.mutateAsync({
        amount: template.defaultAmount,
        category: template.category,
        description: template.label,
        expense_date: new Date().toISOString().split('T')[0],
        type: "expense",
        receipt_url: null,
        account_id: null,
      });
      toast.success(`Added ${template.label} - ₹${template.defaultAmount}`);
      onExpenseAdded?.();
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  const handleCustomAmount = async () => {
    if (!user || !customDialog.template) return;
    
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await createExpense.mutateAsync({
        amount,
        category: customDialog.template.category,
        description: customDialog.template.label,
        expense_date: new Date().toISOString().split('T')[0],
        type: "expense",
        receipt_url: null,
        account_id: null,
      });
      toast.success(`Added ${customDialog.template.label} - ₹${amount}`);
      setCustomDialog({ open: false, template: null });
      setCustomAmount("");
      onExpenseAdded?.();
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Quick Add</h3>
        <div className="grid grid-cols-3 gap-2">
          {defaultTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="flex flex-col h-auto py-3 gap-1 hover:scale-105 transition-transform"
              onClick={() => handleQuickAdd(template)}
              onContextMenu={(e) => {
                e.preventDefault();
                setCustomDialog({ open: true, template });
                setCustomAmount(template.defaultAmount.toString());
              }}
              disabled={createExpense.isPending}
            >
              <div className={`p-2 rounded-full ${template.color} text-white`}>
                <template.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">{template.label}</span>
              <span className="text-[10px] text-muted-foreground">₹{template.defaultAmount}</span>
            </Button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Tap to add • Long press to customize amount
        </p>
      </div>

      <Dialog open={customDialog.open} onOpenChange={(open) => setCustomDialog({ open, template: open ? customDialog.template : null })}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Custom Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount for {customDialog.template?.label}</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                autoFocus
              />
            </div>
            <Button onClick={handleCustomAmount} className="w-full" disabled={createExpense.isPending}>
              Add Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
