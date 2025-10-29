import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateExpense, useCategorizeExpense } from "@/hooks/useExpenses";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const createExpense = useCreateExpense();
  const categorizeExpense = useCategorizeExpense();

  const handleAICategorize = async () => {
    if (!description || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter description and amount first",
        variant: "destructive",
      });
      return;
    }

    const suggestedCategory = await categorizeExpense.mutateAsync({
      description,
      amount: parseFloat(amount),
    });

    if (suggestedCategory) {
      setCategory(suggestedCategory);
      toast({
        title: "Category suggested",
        description: `AI suggests: ${suggestedCategory}`,
      });
    }
  };

  const handleReceiptUpload = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("receipts")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let receiptUrl = null;
      if (receipt) {
        receiptUrl = await handleReceiptUpload(receipt);
      }

      await createExpense.mutateAsync({
        amount: parseFloat(amount),
        category: category || "Other",
        description: description || null,
        expense_date: date,
        receipt_url: receiptUrl,
        type: "expense",
      });

      // Reset form
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setReceipt(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record a new expense transaction</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
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
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Category *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAICategorize}
                disabled={categorizeExpense.isPending || !description || !amount}
              >
                {categorizeExpense.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Suggest
              </Button>
            </div>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {receipt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReceipt(null)}
                >
                  Clear
                </Button>
              )}
            </div>
            {receipt && (
              <p className="text-sm text-muted-foreground">
                <Upload className="h-3 w-3 inline mr-1" />
                {receipt.name}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || createExpense.isPending}>
              {uploading || createExpense.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
