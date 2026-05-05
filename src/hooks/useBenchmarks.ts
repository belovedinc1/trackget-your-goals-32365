import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CategoryBenchmark {
  category: string;
  avg_monthly_spend: number;
  user_count: number;
}

export interface UserCategorySpend {
  category: string;
  user_avg: number;
}

export function useCategoryBenchmarks() {
  return useQuery({
    queryKey: ["category_benchmarks"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_category_benchmarks");
      if (error) throw error;
      return (data || []) as CategoryBenchmark[];
    },
  });
}

export function useUserCategoryAverages() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_category_avg", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date();
      since.setMonth(since.getMonth() - 6);
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, category, expense_date, type")
        .eq("user_id", user!.id)
        .gte("expense_date", since.toISOString().split("T")[0]);
      if (error) throw error;

      const buckets: Record<string, Record<string, number>> = {};
      (data || []).forEach((row: any) => {
        if (row.type && row.type !== "expense") return;
        const month = row.expense_date.slice(0, 7);
        buckets[row.category] ||= {};
        buckets[row.category][month] = (buckets[row.category][month] || 0) + Number(row.amount);
      });

      const result: UserCategorySpend[] = Object.entries(buckets).map(([category, months]) => {
        const totals = Object.values(months);
        const avg = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
        return { category, user_avg: Math.round(avg * 100) / 100 };
      });
      return result;
    },
  });
}
