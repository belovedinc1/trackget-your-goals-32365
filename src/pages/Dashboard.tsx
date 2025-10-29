import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, CreditCard, Receipt, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { useEMI } from "@/hooks/useEMI";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: expenses } = useExpenses({});
  const { goals } = useSavings();
  const { loans: emis } = useEMI();

  const recentTransactions = useMemo(() => {
    if (!expenses) return [];
    return expenses.slice(0, 4).map(exp => ({
      id: exp.id,
      description: exp.description || "Expense",
      amount: -Number(exp.amount),
      category: exp.category,
      date: exp.expense_date,
    }));
  }, [expenses]);

  const upcomingEMIs = useMemo(() => {
    if (!emis) return [];
    return emis.slice(0, 2).map(emi => ({
      id: emi.id,
      lender: emi.lender_name,
      amount: Number(emi.emi_amount),
      dueDate: emi.next_payment_date,
    }));
  }, [emis]);

  const totalExpenses = useMemo(() => {
    if (!expenses) return 0;
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [expenses]);

  const totalSavings = useMemo(() => {
    if (!goals) return 0;
    return goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
  }, [goals]);

  const activeEMIsCount = emis?.length || 0;

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground">Manage your finances with ease</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalSavings - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{goals?.length || 0} active goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active EMIs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEMIsCount}</div>
            <p className="text-xs text-muted-foreground">Active loans</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} • {format(new Date(transaction.date), "MMM dd, yyyy")}</p>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => navigate("/transactions")}>
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* EMI Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upcoming EMIs
            </CardTitle>
            <CardDescription>Payment reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEMIs.map((emi) => (
                <div key={emi.id} className="space-y-2 border-b pb-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{emi.lender}</p>
                      <p className="text-xs text-muted-foreground">Due: {format(new Date(emi.dueDate), "MMM dd, yyyy")}</p>
                    </div>
                    <Badge variant="outline">${emi.amount.toFixed(2)}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/emi")}>
              Manage EMIs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
            AI Financial Insights
          </CardTitle>
          <CardDescription>Personalized recommendations for your finances</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <div className="h-2 w-2 rounded-full bg-accent mt-2" />
            <p className="text-sm">Your spending on dining out has increased by 25% this month. Consider setting a budget limit.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <div className="h-2 w-2 rounded-full bg-accent mt-2" />
            <p className="text-sm">Great job! You're on track to reach your vacation savings goal 2 months early.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <div className="h-2 w-2 rounded-full bg-accent mt-2" />
            <p className="text-sm">Based on your expenses, you could save an additional $200/month by optimizing subscriptions.</p>
          </div>
          <Button variant="default" className="w-full mt-4">
            Get More Insights
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
