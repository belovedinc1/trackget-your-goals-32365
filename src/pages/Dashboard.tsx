import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, CreditCard, Receipt, AlertCircle, Sparkles, ArrowRight, ShieldCheck, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { useEMI } from "@/hooks/useEMI";
import { useCurrency } from "@/hooks/useCurrency";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import type { ElementType } from "react";
import { RecurringPaymentsWidget } from "@/components/dashboard/RecurringPaymentsWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { BudgetAlertsWidget } from "@/components/dashboard/BudgetAlertsWidget";
import { ReceiptCameraButton } from "@/components/expenses/ReceiptCameraButton";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  caption: string;
  icon: ElementType;
  tone: "balance" | "expense" | "income" | "emi";
}

const summaryToneClass: Record<SummaryCardProps["tone"], string> = {
  balance: "from-primary to-secondary",
  expense: "from-rose-500 to-orange-400",
  income: "from-secondary to-emerald-400",
  emi: "from-slate-800 to-primary",
};

function SummaryCard({ title, value, caption, icon: Icon, tone }: SummaryCardProps) {
  return (
    <Card className="app-card overflow-hidden">
      <CardContent className="relative p-4">
        <div className={cn("absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-15 blur-sm", summaryToneClass[tone])} />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            <div className="mt-3 truncate text-2xl font-black tracking-tight sm:text-3xl">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
          </div>
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg", summaryToneClass[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const { data: transactions } = useExpenses({}); // renamed for clarity
  const { goals } = useSavings();
  const { loans: emis } = useEMI();

  // ✅ Calculate income, expenses, and net balance
  const totalIncome = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpenses;

  // ✅ Recent Transactions
  const recentTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
      .slice(0, 4);
  }, [transactions]);

  // ✅ Upcoming EMIs
  const upcomingEMIs = useMemo(() => {
    if (!emis) return [];
    return emis.slice(0, 2).map((emi) => ({
      id: emi.id,
      lender: emi.lender_name,
      amount: Number(emi.emi_amount),
      dueDate: emi.next_payment_date,
    }));
  }, [emis]);

  // ✅ Total Savings
  const totalSavings = useMemo(() => {
    if (!goals) return 0;
    return goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
  }, [goals]);

  const activeEMIsCount = emis?.length || 0;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0;

  return (
    <div className="mobile-page">
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="mb-3 rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Smart budget command center
              </Badge>
              <h1 className="max-w-xl text-3xl font-black tracking-tight sm:text-5xl">
                Your money, made clear.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Track spending, scan receipts, watch EMIs, and protect savings from one mobile-first dashboard.
              </p>
            </div>
            <div className="hidden rounded-3xl bg-primary p-4 text-primary-foreground shadow-2xl shadow-primary/25 sm:block">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-primary-dark to-secondary p-5 text-white shadow-2xl shadow-primary/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Net balance</p>
                <div className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                  {netBalance >= 0 ? "+" : ""}{formatAmount(netBalance)}
                </div>
              </div>
              <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15">
                {savingsRate}% saved
              </Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-white/60">Income</p>
                <p className="mt-1 font-bold">{formatAmount(totalIncome)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-white/60">Spending load</p>
                <p className="mt-1 font-bold">{expenseRatio}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button className="h-12 rounded-2xl" onClick={() => navigate("/expenses")}>
              <Receipt className="mr-2 h-4 w-4" />
              Add expense
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl bg-white/60" onClick={() => navigate("/reports")}>
              Reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Balance"
          value={`${netBalance >= 0 ? "+" : ""}${formatAmount(netBalance)}`}
          caption="Current money position"
          icon={Wallet}
          tone="balance"
        />
        <SummaryCard
          title="Expenses"
          value={formatAmount(totalExpenses)}
          caption="This month"
          icon={TrendingDown}
          tone="expense"
        />
        <SummaryCard
          title="Income"
          value={formatAmount(totalIncome)}
          caption="This month"
          icon={TrendingUp}
          tone="income"
        />
        <SummaryCard
          title="Active EMIs"
          value={activeEMIsCount}
          caption="Loans being tracked"
          icon={CreditCard}
          tone="emi"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="app-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-black">Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 p-3"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category} - {format(new Date(transaction.expense_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "shrink-0 text-sm font-black",
                        transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}{formatAmount(Number(transaction.amount))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-muted/50 p-5 text-center text-sm text-muted-foreground">
                  No recent transactions yet. Add your first expense to light up the dashboard.
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className="mt-4 w-full rounded-2xl"
              onClick={() => navigate("/transactions")}
            >
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <AlertCircle className="h-5 w-5" />
              Upcoming EMIs
            </CardTitle>
            <CardDescription>Payment reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEMIs.length > 0 ? (
                upcomingEMIs.map((emi) => (
                <div key={emi.id} className="space-y-2 rounded-2xl bg-muted/50 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{emi.lender}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(emi.dueDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline">{formatAmount(emi.amount)}</Badge>
                  </div>
                </div>
                ))
              ) : (
                <div className="rounded-2xl bg-muted/50 p-5 text-center text-sm text-muted-foreground">
                  No upcoming EMI reminders.
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full rounded-2xl"
              onClick={() => navigate("/emi")}
            >
              Manage EMIs
            </Button>
          </CardContent>
        </Card>

        <RecurringPaymentsWidget />
        <BudgetAlertsWidget />
        <QuickActionsWidget />
      </div>

      <ReceiptCameraButton variant="fab" />
      <Card className="app-card border-accent/40 bg-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
            AI Financial Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations for your finances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-background/80 p-3">
            <div className="h-2 w-2 rounded-full bg-accent mt-2" />
            <p className="text-sm">
              Your spending on dining out has increased by 25% this month.
              Consider setting a budget limit.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-background/80 p-3">
            <div className="h-2 w-2 rounded-full bg-accent mt-2" />
            <p className="text-sm">
              Great job! You're on track to reach your vacation savings goal 2 months early.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-background/80 p-3">
            <div className="h-2 w-2 rounded-full bg-accent mt-2" />
            <p className="text-sm">
              Based on your expenses, you could save an additional $200/month by optimizing subscriptions.
            </p>
          </div>
          <Button variant="default" className="mt-4 w-full rounded-2xl">
            Get More Insights
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
