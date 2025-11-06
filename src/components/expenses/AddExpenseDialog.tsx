import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateExpense, useCategorizeExpense } from "@/hooks/useExpenses";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Loader2, Sparkles, Upload, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBankAccounts, useUpdateBankAccount } from "@/hooks/useBankAccounts";
import { useScanReceipt } from "@/hooks/useScanReceipt";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(10000000, "Amount too large"),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  expense_date: z.string(),
  account_id: z.string().min(1, "Please select an account"),
});

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const { symbol } = useCurrency();
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const createExpense = useCreateExpense();
  const categorizeExpense = useCategorizeExpense();
  const { data: bankAccounts } = useBankAccounts();
  const updateAccount = useUpdateBankAccount();
  const scanReceipt = useScanReceipt();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      category: "",
      description: "",
      expense_date: new Date().toISOString().split("T")[0],
      account_id: "",
    },
  });

  const handleAICategorize = async () => {
    const description = form.getValues("description");
    const amount = form.getValues("amount");
    
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
      amount,
    });

    if (suggestedCategory) {
      form.setValue("category", suggestedCategory);
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

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG, and PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setReceipt(file);
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's an image (not PDF)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image for scanning",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Scanning receipt...",
        description: "AI is analyzing your receipt image",
      });

      const result = await scanReceipt.mutateAsync(file);

      // Auto-fill form with scanned data
      form.setValue("amount", result.amount);
      form.setValue("category", result.category);
      form.setValue("description", `${result.merchant} - ${result.description}`);
      form.setValue("expense_date", result.date);
      
      // Also set the receipt file for upload
      setReceipt(file);

      toast({
        title: "Receipt scanned successfully!",
        description: `Extracted: ${symbol}${result.amount.toFixed(2)} from ${result.merchant}. Confidence: ${result.confidence}. Please review and confirm.`,
      });
    } catch (error) {
      console.error("Scan error:", error);
      // Error toast is already shown by the hook
    }
  };

  const handleSubmit = async (values: z.infer<typeof expenseSchema>) => {
    setUploading(true);

    try {
      let receiptUrl = null;
      if (receipt) {
        receiptUrl = await handleReceiptUpload(receipt);
      }

      await createExpense.mutateAsync({
        amount: values.amount,
        category: values.category,
        description: values.description || null,
        expense_date: values.expense_date,
        receipt_url: receiptUrl,
        type: "expense",
        account_id: values.account_id,
      });

      // Update bank account balance (debit)
      const account = bankAccounts?.find(acc => acc.id === values.account_id);
      if (account) {
        await updateAccount.mutateAsync({
          id: account.id,
          current_balance: Number(account.current_balance) - values.amount,
        });
      }

      // Reset form
      form.reset();
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ({symbol}) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10000000"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was this expense for?"
                      rows={3}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Category *</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAICategorize}
                      disabled={categorizeExpense.isPending}
                    >
                      {categorizeExpense.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      AI Suggest
                    </Button>
                  </div>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expense_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Debit from Account *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} ({account.currency} {Number(account.current_balance).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            
            {/* Scan Receipt Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => scanInputRef.current?.click()}
                disabled={scanReceipt.isPending}
              >
                {scanReceipt.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan Receipt
                  </>
                )}
              </Button>
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleScanReceipt}
                className="hidden"
              />
            </div>

            {/* Manual Upload */}
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
