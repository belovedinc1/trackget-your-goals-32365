import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Star, TrendingUp, Award } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { useMemo } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export function Achievements() {
  const { data: transactions } = useExpenses({});
  const { goals } = useSavings();

  const achievements = useMemo<Achievement[]>(() => {
    const totalTransactions = transactions?.length || 0;
    const totalExpenses = transactions?.filter((t) => t.type === "expense").length || 0;
    const completedGoals = goals?.filter(
      (g) => Number(g.current_amount) >= Number(g.target_amount)
    ).length || 0;
    const activeGoals = goals?.length || 0;

    return [
      {
        id: "first-expense",
        title: "Getting Started",
        description: "Added your first expense",
        icon: Zap,
        unlocked: totalExpenses >= 1,
      },
      {
        id: "ten-transactions",
        title: "Active Tracker",
        description: "Logged 10 transactions",
        icon: Star,
        unlocked: totalTransactions >= 10,
        progress: Math.min(totalTransactions, 10),
        maxProgress: 10,
      },
      {
        id: "first-goal",
        title: "Goal Setter",
        description: "Created your first savings goal",
        icon: Target,
        unlocked: activeGoals >= 1,
      },
      {
        id: "goal-achiever",
        title: "Goal Achiever",
        description: "Completed a savings goal",
        icon: Trophy,
        unlocked: completedGoals >= 1,
      },
      {
        id: "consistent-tracker",
        title: "Consistent Tracker",
        description: "Logged expenses for 30 days",
        icon: TrendingUp,
        unlocked: totalTransactions >= 30,
        progress: Math.min(totalTransactions, 30),
        maxProgress: 30,
      },
      {
        id: "master-saver",
        title: "Master Saver",
        description: "Completed 5 savings goals",
        icon: Award,
        unlocked: completedGoals >= 5,
        progress: Math.min(completedGoals, 5),
        maxProgress: 5,
      },
    ];
  }, [transactions, goals]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
        <CardDescription>
          {unlockedCount} of {achievements.length} unlocked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  achievement.unlocked
                    ? "bg-accent/10 border-accent"
                    : "bg-muted/30 border-muted opacity-60"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    achievement.unlocked
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                  {achievement.maxProgress && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            achievement.unlocked ? "bg-accent" : "bg-muted-foreground"
                          }`}
                          style={{
                            width: `${
                              ((achievement.progress || 0) /
                                achievement.maxProgress) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
