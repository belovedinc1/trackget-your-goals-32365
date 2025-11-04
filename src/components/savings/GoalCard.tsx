import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp } from "lucide-react";
import { SavingsGoal } from "@/types";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface GoalCardProps {
  goal: SavingsGoal;
}

export const GoalCard = ({ goal }: GoalCardProps) => {
  const { formatAmount } = useCurrency();
  const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{goal.goal_type}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Current
            </p>
            <p className="text-lg font-bold">{formatAmount(Number(goal.current_amount))}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Target className="h-4 w-4" />
              Target
            </p>
            <p className="text-lg font-bold">{formatAmount(Number(goal.target_amount))}</p>
          </div>
        </div>

        {goal.deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Target: {format(new Date(goal.deadline), "MMM dd, yyyy")}</span>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            {formatAmount(remaining)} remaining
          </p>
          <Link to={`/savings/${goal.id}`}>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};