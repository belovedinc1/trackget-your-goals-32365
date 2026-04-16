import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  reward_points: number;
  created_at: string;
  updated_at: string;
}

export function useChallenges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("monthly_challenges")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!user,
  });
}

export function useCreateChallenge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<Challenge, "id" | "user_id" | "created_at" | "updated_at" | "current_value" | "status">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("monthly_challenges")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast({ title: "Challenge created! 🎯" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateChallenge() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Challenge> & { id: string }) => {
      const { error } = await supabase.from("monthly_challenges").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast({ title: "Challenge updated" });
    },
  });
}

export function useDeleteChallenge() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("monthly_challenges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast({ title: "Challenge deleted" });
    },
  });
}
