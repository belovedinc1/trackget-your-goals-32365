import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { useEMI } from "@/hooks/useEMI";
import { useCurrency } from "@/hooks/useCurrency";
import { 
  Heart, 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Shield, 
  Target,
  Flame,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HealthMetric {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "fair" | "poor";
  description: string;
  icon: React.ReactNode;
}

const FinanceHealth = () => {
  const { formatAmount } = useCurrency();
  const { data: transactions = [] } = useExpenses();
  const { goals = [] } = useSavings();
  const { loans = [] } = useEMI();

  const financialData = useMemo(() => {
    // Calculate totals from transactions
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type !== "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyIncome = totalIncome / Math.max(1, 12); // Approximate monthly
    const monthlyExpenses = totalExpenses / Math.max(1, 12);
    
    // Total savings from goals
    const totalSavings = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
    const totalSavingsTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
    
    // EMI calculations
    const totalMonthlyEMI = loans
      .filter(l => l.status === "active")
      .reduce((sum, l) => sum + Number(l.emi_amount), 0);
    const totalOutstanding = loans
      .filter(l => l.status === "active")
      .reduce((sum, l) => sum + Number(l.outstanding_amount), 0);

    return {
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      totalSavings,
      totalSavingsTarget,
      totalMonthlyEMI,
      totalOutstanding,
      monthlySavings: Math.max(0, monthlyIncome - monthlyExpenses - totalMonthlyEMI),
    };
  }, [transactions, goals, loans]);

  // Calculate individual metrics
  const metrics = useMemo((): HealthMetric[] => {
    const { monthlyIncome, monthlyExpenses, totalSavings, totalSavingsTarget, totalMonthlyEMI, monthlySavings } = financialData;

    // 1. Savings Rate (0-25 points)
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const savingsRateScore = Math.min(25, (savingsRate / 30) * 25); // 30% savings = max score
    const savingsRateStatus = savingsRate >= 25 ? "excellent" : savingsRate >= 15 ? "good" : savingsRate >= 5 ? "fair" : "poor";

    // 2. Debt-to-Income Ratio (0-25 points)
    const dtiRatio = monthlyIncome > 0 ? (totalMonthlyEMI / monthlyIncome) * 100 : 0;
    const dtiScore = Math.max(0, 25 - (dtiRatio / 40) * 25); // Lower is better, 0% = 25, 40%+ = 0
    const dtiStatus = dtiRatio <= 10 ? "excellent" : dtiRatio <= 20 ? "good" : dtiRatio <= 35 ? "fair" : "poor";

    // 3. Emergency Fund (0-25 points) - Should cover 6 months of expenses
    const emergencyMonths = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0;
    const emergencyScore = Math.min(25, (emergencyMonths / 6) * 25); // 6 months = max score
    const emergencyStatus = emergencyMonths >= 6 ? "excellent" : emergencyMonths >= 3 ? "good" : emergencyMonths >= 1 ? "fair" : "poor";

    // 4. Investment Progress (0-25 points)
    const investmentProgress = totalSavingsTarget > 0 ? (totalSavings / totalSavingsTarget) * 100 : 0;
    const investmentScore = Math.min(25, (investmentProgress / 100) * 25);
    const investmentStatus = investmentProgress >= 75 ? "excellent" : investmentProgress >= 50 ? "good" : investmentProgress >= 25 ? "fair" : "poor";

    return [
      {
        name: "Savings Rate",
        score: Math.round(savingsRateScore),
        maxScore: 25,
        status: savingsRateStatus,
        description: `${savingsRate.toFixed(1)}% of income saved monthly`,
        icon: <PiggyBank className="h-5 w-5" />,
      },
      {
        name: "Debt-to-Income",
        score: Math.round(dtiScore),
        maxScore: 25,
        status: dtiStatus,
        description: `${dtiRatio.toFixed(1)}% of income goes to EMI`,
        icon: <Wallet className="h-5 w-5" />,
      },
      {
        name: "Emergency Fund",
        score: Math.round(emergencyScore),
        maxScore: 25,
        status: emergencyStatus,
        description: `${emergencyMonths.toFixed(1)} months of expenses covered`,
        icon: <Shield className="h-5 w-5" />,
      },
      {
        name: "Investment Progress",
        score: Math.round(investmentScore),
        maxScore: 25,
        status: investmentStatus,
        description: `${investmentProgress.toFixed(1)}% of savings goals achieved`,
        icon: <Target className="h-5 w-5" />,
      },
    ];
  }, [financialData]);

  // Total health score
  const totalScore = metrics.reduce((sum, m) => sum + m.score, 0);
  const overallStatus = totalScore >= 80 ? "excellent" : totalScore >= 60 ? "good" : totalScore >= 40 ? "fair" : "poor";

  // FIRE Number Calculation
  const fireData = useMemo(() => {
    const annualExpenses = financialData.monthlyExpenses * 12;
    const fireNumber = annualExpenses * 25; // 4% safe withdrawal rate
    const currentNetWorth = financialData.totalSavings - financialData.totalOutstanding;
    const fireProgress = fireNumber > 0 ? (currentNetWorth / fireNumber) * 100 : 0;
    
    // Years to FIRE (simplified calculation)
    const annualSavings = financialData.monthlySavings * 12;
    const yearsToFire = annualSavings > 0 
      ? Math.max(0, (fireNumber - currentNetWorth) / annualSavings)
      : Infinity;

    return {
      fireNumber,
      currentNetWorth,
      fireProgress: Math.min(100, Math.max(0, fireProgress)),
      yearsToFire,
      annualExpenses,
    };
  }, [financialData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-500";
      case "good": return "text-blue-500";
      case "fair": return "text-yellow-500";
      case "poor": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "good": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "fair": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "poor": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Health</h1>
          <p className="text-muted-foreground">
            Your comprehensive financial wellness assessment
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${getStatusBgColor(overallStatus)}`}>
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Overall Health Score</CardTitle>
                  <CardDescription>Based on 4 key financial metrics</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={`text-lg px-4 py-2 ${getStatusBgColor(overallStatus)}`}>
                {overallStatus.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mt-4">
              <div className="text-5xl font-bold">{totalScore}</div>
              <div className="text-2xl text-muted-foreground">/ 100</div>
              <div className="flex-1">
                <Progress value={totalScore} className="h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getStatusBgColor(metric.status)}`}>
                      {metric.icon}
                    </div>
                    <CardTitle className="text-base">{metric.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className={getStatusBgColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.score}</span>
                    <span className="text-muted-foreground">/ {metric.maxScore}</span>
                  </div>
                  <Progress value={(metric.score / metric.maxScore) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FIRE Number Section */}
        <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">FIRE Number</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Financial Independence, Retire Early (FIRE) number is calculated as 25x your annual expenses, based on the 4% safe withdrawal rate.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>
                  Your path to Financial Independence
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Your FIRE Number</p>
                <p className="text-3xl font-bold text-orange-500">
                  {formatAmount(fireData.fireNumber)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on {formatAmount(fireData.annualExpenses)}/year expenses
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Net Worth</p>
                <p className={`text-3xl font-bold ${fireData.currentNetWorth >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatAmount(fireData.currentNetWorth)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Savings minus outstanding debt
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Years to FIRE</p>
                <p className="text-3xl font-bold">
                  {fireData.yearsToFire === Infinity 
                    ? "∞" 
                    : fireData.yearsToFire.toFixed(1)
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  At current savings rate
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>FIRE Progress</span>
                <span className="font-medium">{fireData.fireProgress.toFixed(1)}%</span>
              </div>
              <Progress value={fireData.fireProgress} className="h-3" />
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">How to reach FIRE faster:</p>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• Increase your savings rate by reducing expenses</li>
                    <li>• Pay off high-interest debt to boost net worth</li>
                    <li>• Invest consistently in diversified assets</li>
                    <li>• Consider additional income streams</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default FinanceHealth;
