import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";

export interface BudgetLimit {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  threshold: number;
  status: "safe" | "warning" | "exceeded";
}

export function useBudgetLimits() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["budget-limits", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("budget_limits")
        .select("*")
        .eq("user_id", user.id)
        .order("category", { ascending: true });

      if (error) {
        toast({
          title: "Error fetching budget limits",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as BudgetLimit[];
    },
    enabled: !!user,
  });
}

export function useBudgetStatus() {
  const { data: budgetLimits } = useBudgetLimits();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  
  const { data: expenses } = useExpenses({
    startDate: monthStart,
    endDate: monthEnd,
  });

  return useMemo(() => {
    if (!budgetLimits || !expenses) return [];

    const spentByCategory: Record<string, number> = {};
    
    expenses
      .filter((e) => e.type === "expense")
      .forEach((expense) => {
        const cat = expense.category;
        spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(expense.amount);
      });

    const statuses: BudgetStatus[] = budgetLimits.map((limit) => {
      const spent = spentByCategory[limit.category] || 0;
      const percentage = limit.monthly_limit > 0 ? (spent / limit.monthly_limit) * 100 : 0;
      
      let status: "safe" | "warning" | "exceeded" = "safe";
      if (percentage >= 100) {
        status = "exceeded";
      } else if (percentage >= limit.alert_threshold) {
        status = "warning";
      }

      return {
        category: limit.category,
        limit: limit.monthly_limit,
        spent,
        percentage,
        threshold: limit.alert_threshold,
        status,
      };
    });

    return statuses;
  }, [budgetLimits, expenses]);
}

export function useUpsertBudgetLimit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (limit: { category: string; monthly_limit: number; alert_threshold?: number }) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("budget_limits")
        .select("id")
        .eq("user_id", user.id)
        .eq("category", limit.category)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from("budget_limits")
          .update({
            monthly_limit: limit.monthly_limit,
            alert_threshold: limit.alert_threshold ?? 80,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as BudgetLimit;
      } else {
        const { data, error } = await supabase
          .from("budget_limits")
          .insert({
            user_id: user.id,
            category: limit.category,
            monthly_limit: limit.monthly_limit,
            alert_threshold: limit.alert_threshold ?? 80,
          })
          .select()
          .single();

        if (error) throw error;
        return data as BudgetLimit;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-limits"] });
      toast({
        title: "Budget limit saved",
        description: "Your budget limit has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving budget limit",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteBudgetLimit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("budget_limits")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-limits"] });
      toast({
        title: "Budget limit removed",
        description: "The budget limit has been deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting budget limit",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
