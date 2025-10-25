import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, CreditCard, Receipt, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  // Mock data for demonstration
  const recentTransactions = [
    { id: 1, description: "Grocery Shopping", amount: -85.50, category: "Food", date: "2025-10-24" },
    { id: 2, description: "Salary Deposit", amount: 3500.00, category: "Income", date: "2025-10-23" },
    { id: 3, description: "Netflix Subscription", amount: -15.99, category: "Entertainment", date: "2025-10-22" },
    { id: 4, description: "Gas Station", amount: -45.00, category: "Transportation", date: "2025-10-21" },
  ];

  const upcomingEMIs = [
    { id: 1, lender: "Home Loan - Bank A", amount: 1250.00, dueDate: "2025-10-28" },
    { id: 2, lender: "Car Loan - Bank B", amount: 450.00, dueDate: "2025-10-30" },
  ];

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
            <div className="text-2xl font-bold">$2,458.50</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.67</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,840.00</div>
            <p className="text-xs text-muted-foreground">3 active goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active EMIs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Next payment in 4 days</p>
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
                    <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
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
                      <p className="text-xs text-muted-foreground">Due: {emi.dueDate}</p>
                    </div>
                    <Badge variant="outline">${emi.amount.toFixed(2)}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
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
