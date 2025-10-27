import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SavingsGoal } from "@/types";
import { toast } from "sonner";

export const useSavings = () => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ["savings-goals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SavingsGoal[];
    },
  });

  const createGoal = useMutation({
    mutationFn: async (goal: Omit<SavingsGoal, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("savings_goals")
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      toast.success("Savings goal created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create goal: " + error.message);
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SavingsGoal> }) => {
      const { data, error } = await supabase
        .from("savings_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      toast.success("Goal updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update goal: " + error.message);
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("savings_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      toast.success("Goal deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete goal: " + error.message);
    },
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: {
      goal_id: string;
      amount: number;
      transaction_type: "deposit" | "withdrawal";
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("savings_transactions")
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;

      // Update goal's current_amount
      const { data: goal } = await supabase
        .from("savings_goals")
        .select("current_amount")
        .eq("id", transaction.goal_id)
        .single();

      if (goal) {
        const newAmount = transaction.transaction_type === "deposit"
          ? Number(goal.current_amount) + transaction.amount
          : Number(goal.current_amount) - transaction.amount;

        await supabase
          .from("savings_goals")
          .update({ current_amount: newAmount })
          .eq("id", transaction.goal_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      queryClient.invalidateQueries({ queryKey: ["savings-transactions"] });
      toast.success("Transaction added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add transaction: " + error.message);
    },
  });

  return {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    addTransaction,
  };
};