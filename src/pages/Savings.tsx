import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, DollarSign } from "lucide-react";
import { useSavings } from "@/hooks/useSavings";
import { AddGoalDialog } from "@/components/savings/AddGoalDialog";
import { GoalCard } from "@/components/savings/GoalCard";
import { AIRecommendations } from "@/components/savings/AIRecommendations";

const Savings = () => {
  const { goals, isLoading } = useSavings();

  const totalSavings = goals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0;
  const totalTarget = goals?.reduce((sum, goal) => sum + Number(goal.target_amount), 0) || 0;
  const overallProgress = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Savings Goals</h1>
          <p className="text-muted-foreground">Track your savings progress and achieve your financial goals</p>
        </div>
        <AddGoalDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total targets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Goals in progress</p>
          </CardContent>
        </Card>
      </div>

      <AIRecommendations 
        totalExpenses={5000} 
        totalSavings={totalSavings}
        goalsCount={goals?.length || 0}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your savings goals...</p>
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Savings Goals Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start your savings journey by creating your first goal. Whether it's an emergency fund, 
              vacation, or down payment, we'll help you track your progress.
            </p>
            <AddGoalDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Savings;
