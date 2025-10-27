import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calculator } from "lucide-react";
import { useEMI, calculateEMI } from "@/hooks/useEMI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AddEMIDialog = () => {
  const [open, setOpen] = useState(false);
  const [lenderName, setLenderName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [startDate, setStartDate] = useState("");
  const [calculatedEMI, setCalculatedEMI] = useState<number>(0);
  
  const { createLoan } = useEMI();

  useEffect(() => {
    if (loanAmount && interestRate && tenureMonths) {
      const emi = calculateEMI(
        parseFloat(loanAmount),
        parseFloat(interestRate),
        parseInt(tenureMonths)
      );
      setCalculatedEMI(emi);
    }
  }, [loanAmount, interestRate, tenureMonths]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createLoan.mutate({
      lender_name: lenderName,
      loan_amount: parseFloat(loanAmount),
      interest_rate: parseFloat(interestRate),
      tenure_months: parseInt(tenureMonths),
      emi_amount: calculatedEMI,
      start_date: startDate,
      next_payment_date: startDate,
      outstanding_amount: parseFloat(loanAmount),
      status: "active",
    });
    
    setOpen(false);
    setLenderName("");
    setLoanAmount("");
    setInterestRate("");
    setTenureMonths("");
    setStartDate("");
  };

  const totalInterest = calculatedEMI * parseInt(tenureMonths || "0") - parseFloat(loanAmount || "0");
  const totalAmount = calculatedEMI * parseInt(tenureMonths || "0");

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lender">Lender Name</Label>
              <Input
                id="lender"
                placeholder="e.g., HDFC Bank"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="100000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (% per annum)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="8.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure (Months)</Label>
              <Input
                id="tenure"
                type="number"
                min="1"
                placeholder="60"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                required
              />
            </div>
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
                  <p className="text-2xl font-bold">${calculatedEMI.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-xl font-semibold">${totalInterest.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payment</p>
                  <p className="text-xl font-semibold">${totalAmount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full" disabled={createLoan.isPending}>
            {createLoan.isPending ? "Adding..." : "Add Loan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};