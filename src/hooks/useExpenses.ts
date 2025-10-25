import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

export function useExpenses(filters?: ExpenseFilters) {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["expenses", user?.id, filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id);

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.startDate) {
        query = query.gte("expense_date", filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte("expense_date", filters.endDate);
      }

      const sortColumn = filters?.sortBy === "amount" ? "amount" : "expense_date";
      const ascending = filters?.sortOrder === "asc";
      query = query.order(sortColumn, { ascending });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error loading expenses",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Expense[];
    },
    enabled: !!user,
  });
}

export function useCreateExpense() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          ...expense,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateExpense() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteExpense() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCategorizeExpense() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ description, amount }: { description: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke("categorize-expense", {
        body: { description, amount },
      });

      if (error) throw error;
      return data.category as string;
    },
    onError: (error: Error) => {
      toast({
        title: "AI categorization failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
