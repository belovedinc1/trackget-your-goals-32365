import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useCreateSubscription } from "@/hooks/useSubscriptions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const subscriptionSchema = z.object({
  service_name: z.string().min(1, "Service name is required").max(100, "Service name too long"),
  amount: z.number().positive("Amount must be positive").max(1000000, "Amount too large"),
  billing_cycle: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  start_date: z.string(),
  category: z.string().max(50, "Category too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
});

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSubscriptionDialog = ({ open, onOpenChange }: AddSubscriptionDialogProps) => {
  const createSubscription = useCreateSubscription();
  
  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      service_name: "",
      amount: 0,
      billing_cycle: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      category: "",
      description: "",
    },
  });

  const calculateNextBillingDate = (startDate: string, cycle: string) => {
    const date = new Date(startDate);
    switch (cycle) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (values: z.infer<typeof subscriptionSchema>) => {
    await createSubscription.mutateAsync({
      service_name: values.service_name,
      amount: values.amount,
      billing_cycle: values.billing_cycle,
      start_date: values.start_date,
      next_billing_date: calculateNextBillingDate(values.start_date, values.billing_cycle),
      category: values.category || null,
      description: values.description || null,
      reminder_enabled: true,
      status: "active",
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>Add a new recurring subscription</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="service_name" render={({ field }) => (
              <FormItem><FormLabel>Service Name *</FormLabel><FormControl><Input placeholder="Netflix, Spotify" maxLength={100} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem><FormLabel>Amount ($) *</FormLabel><FormControl><Input type="number" step="0.01" min="0" max="1000000" placeholder="9.99" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="billing_cycle" render={({ field }) => (
              <FormItem><FormLabel>Billing Cycle *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="start_date" render={({ field }) => (
              <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="Entertainment" maxLength={50} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Notes" rows={3} maxLength={500} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createSubscription.isPending}>{createSubscription.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Subscription</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
