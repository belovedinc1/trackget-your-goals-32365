import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, DollarSign, TrendingDown } from "lucide-react";
import { useEMI, generateEMISchedule } from "@/hooks/useEMI";
import { format } from "date-fns";
import { EMI } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMIDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteLoan, recordPayment } = useEMI();
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  const { data: loan, isLoading: loanLoading } = useQuery({
    queryKey: ["emi-loan", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emi_loans")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as EMI;
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["emi-payments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emi_payments")
        .select("*")
        .eq("loan_id", id!)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDeleteLoan = async () => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      await deleteLoan.mutateAsync(id!);
      navigate("/emi");
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan || !selectedMonth) return;

    const scheduleItem = schedule.find(s => s.month.toString() === selectedMonth);
    if (!scheduleItem) return;

    recordPayment.mutate({
      loan_id: id!,
      amount_paid: parseFloat(paymentAmount || loan.emi_amount.toString()),
      principal_component: scheduleItem.principal,
      interest_component: scheduleItem.interest,
      due_date: scheduleItem.dueDate,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: paymentMethod || undefined,
      notes: notes || undefined,
    });

    setPaymentDialogOpen(false);
    setPaymentAmount("");
    setPaymentMethod("");
    setNotes("");
  };

  if (loanLoading) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Loading loan details...</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Loan not found</p>
      </div>
    );
  }

  const progress = ((Number(loan.loan_amount) - Number(loan.outstanding_amount)) / Number(loan.loan_amount)) * 100;
  const schedule = generateEMISchedule(
    Number(loan.loan_amount),
    Number(loan.interest_rate),
    loan.tenure_months,
    new Date(loan.start_date)
  );

  const paidMonths = payments?.filter(p => p.status === "paid").length || 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/emi")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Loans
        </Button>
        <div className="flex gap-2">
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>Record Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record EMI Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Select Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment month" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedule.map((item) => (
                        <SelectItem key={item.month} value={item.month.toString()}>
                          Month {item.month} - {format(new Date(item.dueDate), "MMM yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Amount Paid ($)</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    placeholder={loan.emi_amount.toString()}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    placeholder="e.g., Bank Transfer, UPI"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={recordPayment.isPending}>
                  {recordPayment.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDeleteLoan}>
            Delete Loan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{loan.lender_name}</CardTitle>
          <p className="text-sm text-muted-foreground capitalize">{loan.status}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Repayment Progress</span>
              <span className="font-medium">{progress.toFixed(1)}% ({paidMonths}/{loan.tenure_months} months)</span>
            </div>
            <Progress value={progress} className="h-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Loan Amount
              </p>
              <p className="text-xl font-bold">${Number(loan.loan_amount).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Monthly EMI
              </p>
              <p className="text-xl font-bold">${Number(loan.emi_amount).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                Outstanding
              </p>
              <p className="text-xl font-bold">${Number(loan.outstanding_amount).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Next Payment
              </p>
              <p className="text-xl font-bold">{format(new Date(loan.next_payment_date), "MMM dd")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="text-lg font-semibold">{Number(loan.interest_rate).toFixed(2)}% p.a.</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenure</p>
              <p className="text-lg font-semibold">{loan.tenure_months} months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EMI Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>EMI Amount</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item) => {
                  const payment = payments?.find(p => 
                    format(new Date(p.due_date), "yyyy-MM-dd") === item.dueDate
                  );
                  return (
                    <TableRow key={item.month}>
                      <TableCell>{item.month}</TableCell>
                      <TableCell>{format(new Date(item.dueDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>${item.emiAmount.toFixed(2)}</TableCell>
                      <TableCell>${item.principal.toFixed(2)}</TableCell>
                      <TableCell>${item.interest.toFixed(2)}</TableCell>
                      <TableCell>${item.balance.toFixed(2)}</TableCell>
                      <TableCell>
                        {payment ? (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded capitalize">
                            {payment.status}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            Pending
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EMIDetail;