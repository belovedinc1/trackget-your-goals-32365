import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBankAccounts, useUpdateBankAccount } from "@/hooks/useBankAccounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const incomeSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(10000000, "Amount too large"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  expense_date: z.string(),
  account_id: z.string().min(1, "Please select an account"),
});

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddIncomeDialog = ({ open, onOpenChange }: AddIncomeDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createExpense = useCreateExpense();
  const { data: bankAccounts } = useBankAccounts();
  const updateAccount = useUpdateBankAccount();
  
  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: 0,
      description: "",
      expense_date: new Date().toISOString().split('T')[0],
      account_id: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof incomeSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add income",
        variant: "destructive",
      });
      return;
    }

    try {
      await createExpense.mutateAsync({
        amount: values.amount,
        category: "Income",
        description: values.description || "Income",
        expense_date: values.expense_date,
        receipt_url: null,
        type: "income",
        account_id: values.account_id,
      });

      // Update bank account balance (credit)
      const account = bankAccounts?.find(acc => acc.id === values.account_id);
      if (account) {
        await updateAccount.mutateAsync({
          id: account.id,
          current_balance: Number(account.current_balance) + values.amount,
        });
      }

      toast({
        title: "Income added",
        description: "Your income has been recorded successfully",
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
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
                      placeholder="e.g., Salary, Freelance project, Bonus"
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
              name="expense_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
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
                  <FormLabel>Credit to Account *</FormLabel>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};
