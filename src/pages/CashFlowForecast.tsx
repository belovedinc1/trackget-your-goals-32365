import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { useEMI } from "@/hooks/useEMI";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useCurrency } from "@/hooks/useCurrency";
import { useRecurringTemplates } from "@/hooks/useRecurringTemplates";
import { TrendingUp, TrendingDown, ArrowRight, Calendar, Wallet, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { format, subMonths, addMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CashFlowForecast = () => {
  const { formatAmount } = useCurrency();
  const { data: transactions = [] } = useExpenses();
  const { goals = [] } = useSavings();
  const { loans = [] } = useEMI();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: recurringTemplates = [] } = useRecurringTemplates();
  const [forecastMonths] = useState(6);

  // Calculate historical monthly data (last 6 months)
  const historicalData = useMemo(() => {
    const months: Array<{
      month: string;
      monthLabel: string;
      income: number;
      expenses: number;
      net: number;
      isForecast: boolean;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM yy");

      let income = 0;
      let expenses = 0;

      transactions.forEach(t => {
        const tDate = new Date(t.expense_date);
        if (tDate >= monthStart && tDate <= monthEnd) {
          if (t.type === "income") {
            income += Number(t.amount);
          } else {
            expenses += Number(t.amount);
          }
        }
      });

      months.push({
        month: monthKey,
        monthLabel,
        income,
        expenses,
        net: income - expenses,
        isForecast: false,
      });
    }

    return months;
  }, [transactions]);

  // Calculate averages for forecasting
  const averages = useMemo(() => {
    const nonZeroMonths = historicalData.filter(m => m.income > 0 || m.expenses > 0);
    if (nonZeroMonths.length === 0) return { avgIncome: 0, avgExpenses: 0, avgNet: 0 };

    const avgIncome = nonZeroMonths.reduce((s, m) => s + m.income, 0) / nonZeroMonths.length;
    const avgExpenses = nonZeroMonths.reduce((s, m) => s + m.expenses, 0) / nonZeroMonths.length;

    return {
      avgIncome,
      avgExpenses,
      avgNet: avgIncome - avgExpenses,
    };
  }, [historicalData]);

  // Calculate known recurring costs
  const recurringCosts = useMemo(() => {
    // Active EMIs
    const monthlyEMI = loans
      .filter(l => l.status === "active")
      .reduce((sum, l) => sum + Number(l.emi_amount), 0);

    // Active subscriptions (normalize to monthly)
    const monthlySubs = (subscriptions || [])
      .filter((s: any) => s.status === "active")
      .reduce((sum: number, s: any) => {
        const amount = Number(s.amount);
        if (s.billing_cycle === "yearly") return sum + amount / 12;
        if (s.billing_cycle === "quarterly") return sum + amount / 3;
        return sum + amount; // monthly
      }, 0);

    // Recurring templates
    const monthlyTemplates = (recurringTemplates || [])
      .filter((t: any) => t.is_active)
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    return {
      emi: monthlyEMI,
      subscriptions: monthlySubs,
      recurring: monthlyTemplates,
      total: monthlyEMI + monthlySubs + monthlyTemplates,
    };
  }, [loans, subscriptions, recurringTemplates]);

  // Generate forecast data
  const forecastData = useMemo(() => {
    const forecast: typeof historicalData = [];

    for (let i = 1; i <= forecastMonths; i++) {
      const date = addMonths(new Date(), i);
      const monthLabel = format(date, "MMM yy");
      const monthKey = format(date, "yyyy-MM");

      // Use weighted average (recent months weigh more)
      const projectedIncome = averages.avgIncome;
      const projectedExpenses = Math.max(averages.avgExpenses, recurringCosts.total);

      forecast.push({
        month: monthKey,
        monthLabel,
        income: Math.round(projectedIncome),
        expenses: Math.round(projectedExpenses),
        net: Math.round(projectedIncome - projectedExpenses),
        isForecast: true,
      });
    }

    return forecast;
  }, [averages, recurringCosts, forecastMonths]);

  const chartData = [...historicalData, ...forecastData];

  // Calculate projected balance over time
  const currentBalance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      if (t.type === "income") return sum + Number(t.amount);
      return sum - Number(t.amount);
    }, 0);
  }, [transactions]);

  const projectedBalances = useMemo(() => {
    let balance = currentBalance;
    return forecastData.map(f => {
      balance += f.net;
      return { month: f.monthLabel, balance: Math.round(balance) };
    });
  }, [currentBalance, forecastData]);

  // Risk assessment
  const riskLevel = useMemo(() => {
    if (averages.avgNet < 0) return "high";
    if (averages.avgNet < averages.avgIncome * 0.1) return "medium";
    return "low";
  }, [averages]);

  const monthsUntilNegative = useMemo(() => {
    if (averages.avgNet >= 0) return null;
    return Math.floor(currentBalance / Math.abs(averages.avgNet));
  }, [currentBalance, averages.avgNet]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Flow Forecast</h1>
          <p className="text-muted-foreground">
            AI-projected future balance based on your spending patterns
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Avg Income</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatAmount(averages.avgIncome)}</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <p className="text-sm text-muted-foreground">Avg Expenses</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatAmount(averages.avgExpenses)}</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Net Cash Flow</p>
              </div>
              <p className={`text-2xl font-bold ${averages.avgNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                {averages.avgNet >= 0 ? "+" : ""}{formatAmount(averages.avgNet)}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                {riskLevel === "high" ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : riskLevel === "medium" ? (
                  <Info className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <p className="text-sm text-muted-foreground">Risk Level</p>
              </div>
              <Badge variant="outline" className={
                riskLevel === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                riskLevel === "medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                "bg-green-500/10 text-green-500 border-green-500/20"
              }>
                {riskLevel.toUpperCase()}
              </Badge>
              {monthsUntilNegative !== null && (
                <p className="text-xs text-red-500 mt-1">
                  ~{monthsUntilNegative} months until negative
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Income vs Expenses (6-month history + forecast)
            </CardTitle>
            <CardDescription>
              Solid area = actual data • Dashed area = projected forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="monthLabel" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [formatAmount(value), name]}
                  />
                  <ReferenceLine
                    x={historicalData[historicalData.length - 1]?.monthLabel}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="3 3"
                    label={{ value: "Now", position: "top", className: "text-xs fill-primary" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="hsl(142, 76%, 36%)"
                    fill="url(#incomeGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="hsl(0, 84%, 60%)"
                    fill="url(#expenseGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Projected Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Projected Balance</CardTitle>
            <CardDescription>
              Starting from current balance of {formatAmount(currentBalance)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectedBalances.map((pb, i) => (
                <div key={pb.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pb.month}</span>
                  </div>
                  <span className={`font-bold ${pb.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatAmount(pb.balance)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recurring Commitments Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Recurring Commitments</CardTitle>
            <CardDescription>Fixed costs that affect your forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recurringCosts.emi > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">EMI Payments</span>
                  <span className="font-semibold text-red-600">{formatAmount(recurringCosts.emi)}</span>
                </div>
              )}
              {recurringCosts.subscriptions > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Subscriptions</span>
                  <span className="font-semibold text-red-600">{formatAmount(recurringCosts.subscriptions)}</span>
                </div>
              )}
              {recurringCosts.recurring > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Recurring Expenses</span>
                  <span className="font-semibold text-red-600">{formatAmount(recurringCosts.recurring)}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="font-medium">Total Fixed Costs</span>
                <span className="font-bold text-primary">{formatAmount(recurringCosts.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default CashFlowForecast;
