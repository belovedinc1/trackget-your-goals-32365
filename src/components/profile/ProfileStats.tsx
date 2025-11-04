import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Wallet } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { useEMI } from "@/hooks/useEMI";
import { useCurrency } from "@/hooks/useCurrency";
import { useMemo } from "react";

export function ProfileStats() {
  const { formatAmount } = useCurrency();
  const { data: transactions } = useExpenses({});
  const { goals } = useSavings();
  const { loans } = useEMI();

  const stats = useMemo(() => {
    const totalIncome = transactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalExpenses = transactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalSavings = goals?.reduce(
      (sum, goal) => sum + Number(goal.current_amount),
      0
    ) || 0;

    const activeGoals = goals?.length || 0;
    const completedGoals = goals?.filter(
      (g) => Number(g.current_amount) >= Number(g.target_amount)
    ).length || 0;

    const activeLoans = loans?.filter((l) => l.status === "active").length || 0;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      activeGoals,
      completedGoals,
      activeLoans,
      netBalance: totalIncome - totalExpenses,
    };
  }, [transactions, goals, loans]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatAmount(stats.netBalance)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount(stats.totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount(stats.totalExpenses)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount(stats.totalSavings)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
