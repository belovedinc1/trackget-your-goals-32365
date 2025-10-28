import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SavingsSummaryChartProps {
  goals: Array<{ title: string; progress: number; current: number; target: number }>;
}

const SavingsSummaryChart = ({ goals }: SavingsSummaryChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals Progress</CardTitle>
        <CardDescription>Track your progress towards financial goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No savings goals yet</p>
        ) : (
          goals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{goal.title}</span>
                <span className="text-muted-foreground">
                  ₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}
                </span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{goal.progress.toFixed(1)}% complete</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsSummaryChart;
