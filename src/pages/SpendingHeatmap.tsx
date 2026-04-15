import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { CalendarHeart, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SpendingHeatmap = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: transactions = [] } = useExpenses();
  const { formatAmount } = useCurrency();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Aggregate daily spending
  const dailySpending = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type !== "income")
      .forEach(t => {
        const dateKey = t.expense_date;
        map[dateKey] = (map[dateKey] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions]);

  // Calculate stats for the current month
  const monthStats = useMemo(() => {
    let total = 0;
    let maxDay = 0;
    let count = 0;
    const dailyAmounts: number[] = [];

    daysInMonth.forEach(day => {
      const key = format(day, "yyyy-MM-dd");
      const amount = dailySpending[key] || 0;
      if (amount > 0) {
        total += amount;
        count++;
        dailyAmounts.push(amount);
      }
      if (amount > maxDay) maxDay = amount;
    });

    const avg = count > 0 ? total / count : 0;
    return { total, maxDay, avg, spendingDays: count };
  }, [daysInMonth, dailySpending]);

  // Color intensity based on spending
  const getHeatColor = (amount: number) => {
    if (amount === 0) return "bg-muted/30";
    const ratio = monthStats.maxDay > 0 ? amount / monthStats.maxDay : 0;
    if (ratio <= 0.2) return "bg-emerald-200 dark:bg-emerald-900/60";
    if (ratio <= 0.4) return "bg-yellow-200 dark:bg-yellow-900/60";
    if (ratio <= 0.6) return "bg-orange-300 dark:bg-orange-800/60";
    if (ratio <= 0.8) return "bg-red-300 dark:bg-red-700/60";
    return "bg-red-500 dark:bg-red-600";
  };

  const getHeatTextColor = (amount: number) => {
    if (amount === 0) return "text-muted-foreground/50";
    const ratio = monthStats.maxDay > 0 ? amount / monthStats.maxDay : 0;
    if (ratio > 0.6) return "text-white";
    return "text-foreground";
  };

  // Build calendar grid (6 rows x 7 cols max)
  const calendarGrid: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  // Fill leading empty cells
  for (let i = 0; i < startDayOfWeek; i++) {
    week.push(null);
  }

  daysInMonth.forEach((day, index) => {
    week.push(day);
    if (week.length === 7) {
      calendarGrid.push(week);
      week = [];
    }
  });

  // Fill trailing empty cells
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    calendarGrid.push(week);
  }

  const today = new Date();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spending Heatmap</h1>
          <p className="text-muted-foreground">Visualize your daily spending patterns</p>
        </div>

        {/* Month Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{formatAmount(monthStats.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Highest Day</p>
              <p className="text-2xl font-bold">{formatAmount(monthStats.maxDay)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-2xl font-bold">{formatAmount(monthStats.avg)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Spending Days</p>
              <p className="text-2xl font-bold">{monthStats.spendingDays} / {daysInMonth.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Heatmap */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarHeart className="h-5 w-5 text-primary" />
                <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>Darker cells indicate higher spending</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAY_LABELS.map(label => (
                <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.flat().map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dateKey = format(day, "yyyy-MM-dd");
                const amount = dailySpending[dateKey] || 0;
                const isToday = isSameDay(day, today);

                return (
                  <Tooltip key={dateKey}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "aspect-square rounded-lg flex flex-col items-center justify-center cursor-default transition-all",
                          getHeatColor(amount),
                          isToday && "ring-2 ring-primary ring-offset-1"
                        )}
                      >
                        <span className={cn("text-xs font-medium", getHeatTextColor(amount))}>
                          {format(day, "d")}
                        </span>
                        {amount > 0 && (
                          <span className={cn("text-[9px] leading-tight", getHeatTextColor(amount))}>
                            {formatAmount(amount, true)}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{format(day, "EEEE, MMM d")}</p>
                        <p className={amount > 0 ? "text-red-400" : "text-green-400"}>
                          {amount > 0 ? `Spent: ${formatAmount(amount)}` : "No spending 🎉"}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="w-4 h-4 rounded bg-muted/30" />
              <div className="w-4 h-4 rounded bg-emerald-200 dark:bg-emerald-900/60" />
              <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/60" />
              <div className="w-4 h-4 rounded bg-orange-300 dark:bg-orange-800/60" />
              <div className="w-4 h-4 rounded bg-red-300 dark:bg-red-700/60" />
              <div className="w-4 h-4 rounded bg-red-500 dark:bg-red-600" />
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default SpendingHeatmap;
