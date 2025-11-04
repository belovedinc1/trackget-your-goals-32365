import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calculator } from "lucide-react";
import { useEMI, calculateEMI } from "@/hooks/useEMI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCurrency } from "@/hooks/useCurrency";

const emiSchema = z.object({
  lender_name: z.string().min(1, "Lender name is required").max(100, "Lender name too long"),
  loan_amount: z.number().positive("Loan amount must be positive").max(10000000, "Amount too large"),
  interest_rate: z.number().min(0, "Interest rate cannot be negative").max(100, "Interest rate cannot exceed 100%"),
  tenure_months: z.number().int().positive("Tenure must be at least 1 month"),
  start_date: z.string(),
});

export const AddEMIDialog = () => {
  const { formatAmount, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [calculatedEMI, setCalculatedEMI] = useState<number>(0);
  const { createLoan } = useEMI();

  const form = useForm<z.infer<typeof emiSchema>>({
    resolver: zodResolver(emiSchema),
    defaultValues: {
      lender_name: "",
      loan_amount: 0,
      interest_rate: 0,
      tenure_months: 0,
      start_date: "",
    },
  });

  const loanAmount = form.watch("loan_amount");
  const interestRate = form.watch("interest_rate");
  const tenureMonths = form.watch("tenure_months");

  useEffect(() => {
    if (loanAmount && interestRate && tenureMonths) {
      const emi = calculateEMI(loanAmount, interestRate, tenureMonths);
      setCalculatedEMI(emi);
    }
  }, [loanAmount, interestRate, tenureMonths]);

  const handleSubmit = (values: z.infer<typeof emiSchema>) => {
    createLoan.mutate({
      lender_name: values.lender_name,
      loan_amount: values.loan_amount,
      interest_rate: values.interest_rate,
      tenure_months: values.tenure_months,
      emi_amount: calculatedEMI,
      start_date: values.start_date,
      next_payment_date: values.start_date,
      outstanding_amount: values.loan_amount,
      status: "active",
    });
    
    setOpen(false);
    form.reset();
  };

  const totalInterest = calculatedEMI * (tenureMonths || 0) - (loanAmount || 0);
  const totalAmount = calculatedEMI * (tenureMonths || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Loan / EMI</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="lender_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lender Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HDFC Bank" maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loan_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ({symbol})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10000000"
                        placeholder="100000"
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
                name="interest_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (% per annum)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="8.5"
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
                name="tenure_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenure (Months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          {calculatedEMI > 0 && (
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5" />
                  Loan Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly EMI</p>
                  <p className="text-2xl font-bold">{formatAmount(calculatedEMI)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-xl font-semibold">{formatAmount(totalInterest)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payment</p>
                  <p className="text-xl font-semibold">{formatAmount(totalAmount)}</p>
                </div>
              </CardContent>
            </Card>
          )}

            <Button type="submit" className="w-full" disabled={createLoan.isPending}>
              {createLoan.isPending ? "Adding..." : "Add Loan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};