import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreateBankAccount } from "@/hooks/useBankAccounts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";

const bankAccountSchema = z.object({
  account_name: z.string().min(1, "Account name is required").max(100, "Account name too long"),
  account_type: z.enum(["savings", "checking", "credit", "investment", "other"]),
  bank_name: z.string().min(1, "Bank name is required").max(100, "Bank name too long"),
  account_number: z.string().length(4, "Must be 4 digits").regex(/^\d{4}$/, "Must be digits only").optional().or(z.literal("")),
  initial_balance: z.number().min(-1000000, "Balance too negative").max(10000000, "Balance too large"),
  currency: z.string().default("USD"),
  is_primary: z.boolean().default(false),
});

interface AddBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddBankAccountDialog = ({ open, onOpenChange }: AddBankAccountDialogProps) => {
  const createAccount = useCreateBankAccount();
  
  const form = useForm<z.infer<typeof bankAccountSchema>>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { account_name: "", account_type: "checking", bank_name: "", account_number: "", initial_balance: 0, currency: "USD", is_primary: false },
  });

  const handleSubmit = async (values: z.infer<typeof bankAccountSchema>) => {
    await createAccount.mutateAsync({
      account_name: values.account_name,
      account_type: values.account_type,
      bank_name: values.bank_name,
      account_number: values.account_number || null,
      initial_balance: values.initial_balance,
      currency: values.currency,
      is_primary: values.is_primary,
      status: "active",
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>Add a new bank account to track your finances</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="account_name" render={({ field }) => (<FormItem><FormLabel>Account Name *</FormLabel><FormControl><Input placeholder="My Savings" maxLength={100} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="account_type" render={({ field }) => (<FormItem><FormLabel>Account Type *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="savings">Savings</SelectItem><SelectItem value="checking">Checking</SelectItem><SelectItem value="credit">Credit</SelectItem><SelectItem value="investment">Investment</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bank_name" render={({ field }) => (<FormItem><FormLabel>Bank Name *</FormLabel><FormControl><Input placeholder="Chase Bank" maxLength={100} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="account_number" render={({ field }) => (<FormItem><FormLabel>Account Number (Last 4 digits)</FormLabel><FormControl><Input placeholder="1234" maxLength={4} {...field} /></FormControl><FormDescription>Optional</FormDescription><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="initial_balance" render={({ field }) => (<FormItem><FormLabel>Initial Balance ($) *</FormLabel><FormControl><Input type="number" step="0.01" min="-1000000" max="10000000" placeholder="1000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="is_primary" render={({ field }) => (<FormItem className="flex items-center space-x-2 space-y-0"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Set as primary</FormLabel></FormItem>)} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createAccount.isPending}>{createAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Account</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
