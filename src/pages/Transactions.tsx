import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useTransactions } from "@/hooks/useExpenses";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { AddIncomeDialog } from "@/components/transactions/AddIncomeDialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

const Transactions = () => {
  const { formatAmount } = useCurrency();
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  
  const { data: expenses, isLoading } = useTransactions({});

  const summary = useMemo(() => {
    
     if (!expenses) return { totalExpenses: 0, totalIncome: 0, netBalance: 0 };
  const totalIncome = expenses
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const netBalance = totalIncome - totalExpenses;
  return { totalExpenses, totalIncome, netBalance };
}, [expenses]);
  
  return (
    <div className="mobile-page">
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Money movement</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Transactions</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Track all your income and expenses in one mobile-friendly timeline.</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button onClick={() => setIncomeDialogOpen(true)} variant="outline" className="h-12 rounded-2xl bg-white/60">
            <Plus className="h-4 w-4 mr-2" />
            Income
          </Button>
          <Button onClick={() => setExpenseDialogOpen(true)} className="h-12 rounded-2xl">
            <Plus className="h-4 w-4 mr-2" />
            Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(summary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(summary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.netBalance >= 0 ? '+' : ''}{formatAmount(summary.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="app-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black">All Transactions</CardTitle>
          <CardDescription>Your complete transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
          ) : expenses && expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-3xl bg-muted/50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      transaction.type === "expense" ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.type === "expense" ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{transaction.description || (transaction.type === "income" ? "Income" : "Expense")}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.expense_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-black ${transaction.type === "expense" ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.type === "income" ? '+' : '-'}{formatAmount(transaction.amount)}
                    </p>
                    <Badge variant="outline" className="mt-1 max-w-24 truncate text-[10px]">{transaction.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No transactions yet</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setIncomeDialogOpen(true)} variant="outline" className="rounded-2xl">
                  Add Income
                </Button>
                <Button onClick={() => setExpenseDialogOpen(true)} className="rounded-2xl">
                  Add Expense
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />
      <AddIncomeDialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} />
    </div>
  );
};

export default Transactions;
