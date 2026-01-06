import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { useBudgetStatus } from "@/hooks/useBudgetLimits";
import { useCurrency } from "@/hooks/useCurrency";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function BudgetAlertsWidget() {
  const budgetStatus = useBudgetStatus();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();

  const alertsToShow = budgetStatus.filter(
    (b) => b.status === "warning" || b.status === "exceeded"
  );

  const hasAlerts = alertsToShow.length > 0;

  return (
    <Card className={hasAlerts ? "border-warning/50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {hasAlerts ? (
            <AlertTriangle className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Budget Status
        </CardTitle>
        <CardDescription>
          {hasAlerts
            ? `${alertsToShow.length} category${alertsToShow.length > 1 ? "ies" : ""} need attention`
            : "All spending within limits"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetStatus.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No budget limits set</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/settings")}
              className="mt-1"
            >
              Set up budgets
            </Button>
          </div>
        ) : (
          <>
            {alertsToShow.slice(0, 3).map((budget) => (
              <div key={budget.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <Badge
                    variant={budget.status === "exceeded" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {budget.status === "exceeded" ? "Over budget" : "Near limit"}
                  </Badge>
                </div>
                <Progress
                  value={Math.min(budget.percentage, 100)}
                  className={`h-2 ${
                    budget.status === "exceeded"
                      ? "[&>div]:bg-destructive"
                      : budget.status === "warning"
                      ? "[&>div]:bg-warning"
                      : ""
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatAmount(budget.spent)} of {formatAmount(budget.limit)}
                  </span>
                  <span>{Math.round(budget.percentage)}%</span>
                </div>
              </div>
            ))}
            {!hasAlerts && budgetStatus.slice(0, 2).map((budget) => (
              <div key={budget.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(budget.percentage)}%
                  </span>
                </div>
                <Progress value={budget.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatAmount(budget.spent)} spent</span>
                  <span>{formatAmount(budget.limit - budget.spent)} left</span>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
