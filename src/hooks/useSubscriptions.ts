import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  billing_cycle: "monthly" | "yearly" | "weekly" | "quarterly";
  start_date: string;
  next_billing_date: string;
  status: "active" | "cancelled" | "paused";
  category?: string;
  description?: string;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("next_billing_date", { ascending: true });

      if (error) throw error;
      return data as Subscription[];
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscription: Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .insert([{ ...subscription, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add subscription: ${error.message}`);
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update subscription: ${error.message}`);
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete subscription: ${error.message}`);
    },
  });
};
