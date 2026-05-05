import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Info } from "lucide-react";
import { useCategoryBenchmarks, useUserCategoryAverages } from "@/hooks/useBenchmarks";
import { useCurrency } from "@/hooks/useCurrency";

export default function ExpenseComparison() {
  const { data: benchmarks = [], isLoading: bLoad } = useCategoryBenchmarks();
  const { data: userAvgs = [], isLoading: uLoad } = useUserCategoryAverages();
  const { formatAmount } = useCurrency();

  const benchMap = new Map(benchmarks.map((b) => [b.category, b]));
  const rows = userAvgs
    .map((u) => ({ ...u, benchmark: benchMap.get(u.category) }))
    .sort((a, b) => b.user_avg - a.user_avg);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Expense Comparison</h1>
        <p className="text-muted-foreground">See how your spending compares with anonymous averages from other Trackget users.</p>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="py-4 flex items-start gap-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="text-muted-foreground">
            Benchmarks are computed anonymously across all Trackget users with at least 5 users per category. Your individual data is never shared.
          </div>
        </CardContent>
      </Card>

      {bLoad || uLoad ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Loading…</CardContent></Card>
      ) : rows.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Add some expenses to start comparing.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => {
            const bench = r.benchmark;
            const ratio = bench ? r.user_avg / Number(bench.avg_monthly_spend) : null;
            const pct = ratio ? Math.min(200, ratio * 100) : null;
            const above = ratio !== null && ratio > 1.1;
            const below = ratio !== null && ratio < 0.9;
            return (
              <Card key={r.category}>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">{r.category}</CardTitle>
                    {bench ? (
                      <Badge variant={above ? "destructive" : below ? "default" : "secondary"} className={below ? "bg-emerald-100 text-emerald-700" : ""}>
                        {above ? <><TrendingUp className="h-3 w-3 mr-1" /> {Math.round((ratio! - 1) * 100)}% above avg</> :
                         below ? <><TrendingDown className="h-3 w-3 mr-1" /> {Math.round((1 - ratio!) * 100)}% below avg</> :
                         "Around average"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No benchmark yet</Badge>
                    )}
                  </div>
                  <CardDescription>
                    You: <strong>{formatAmount(r.user_avg)}</strong>/month
                    {bench && <> · Avg: <strong>{formatAmount(Number(bench.avg_monthly_spend))}</strong> · <Users className="h-3 w-3 inline" /> {bench.user_count} users</>}
                  </CardDescription>
                </CardHeader>
                {pct !== null && (
                  <CardContent>
                    <Progress value={pct / 2} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span><span>Avg</span><span>2x avg</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
