import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface SplitExpense {
  id: string;
  user_id: string;
  title: string;
  total_amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SplitParticipant {
  id: string;
  split_expense_id: string;
  participant_name: string;
  participant_email: string | null;
  share_amount: number;
  is_settled: boolean;
  settled_at: string | null;
  created_at: string;
}

export function useSplitExpenses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["split_expenses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("split_expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SplitExpense[];
    },
    enabled: !!user,
  });
}

export function useSplitParticipants(splitExpenseId?: string) {
  return useQuery({
    queryKey: ["split_participants", splitExpenseId],
    queryFn: async () => {
      if (!splitExpenseId) return [];
      const { data, error } = await supabase
        .from("split_expense_participants")
        .select("*")
        .eq("split_expense_id", splitExpenseId);
      if (error) throw error;
      return data as SplitParticipant[];
    },
    enabled: !!splitExpenseId,
  });
}

export function useCreateSplitExpense() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      total_amount: number;
      currency: string;
      notes?: string;
      participants: { name: string; email?: string; share_amount: number }[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: split, error: splitError } = await supabase
        .from("split_expenses")
        .insert({ user_id: user.id, title: input.title, total_amount: input.total_amount, currency: input.currency, notes: input.notes || null })
        .select()
        .single();
      if (splitError) throw splitError;

      if (input.participants.length > 0) {
        const { error: partError } = await supabase
          .from("split_expense_participants")
          .insert(input.participants.map((p) => ({
            split_expense_id: split.id,
            participant_name: p.name,
            participant_email: p.email || null,
            share_amount: p.share_amount,
          })));
        if (partError) throw partError;
      }
      return split;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["split_expenses"] });
      toast({ title: "Split expense created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useSettleParticipant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("split_expense_participants")
        .update({ is_settled: true, settled_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["split_participants"] });
      queryClient.invalidateQueries({ queryKey: ["split_expenses"] });
      toast({ title: "Marked as settled" });
    },
  });
}

export function useDeleteSplitExpense() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("split_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["split_expenses"] });
      toast({ title: "Split expense deleted" });
    },
  });
}
