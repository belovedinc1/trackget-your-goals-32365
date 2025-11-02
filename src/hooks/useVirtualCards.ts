import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface VirtualCard {
  id: string;
  user_id: string;
  card_name: string;
  card_balance: number;
  card_color: string;
  created_at: string;
  updated_at: string;
}

export function useVirtualCards() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["virtual-cards", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("virtual_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching virtual cards",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data || []) as VirtualCard[];
    },
    enabled: !!user,
  });
}

export function useCreateVirtualCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<VirtualCard, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("virtual_cards")
        .insert({
          ...card,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as VirtualCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["virtual-cards"] });
      toast({
        title: "Success",
        description: "Virtual card created successfully",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("50")) {
        toast({
          title: "Limit reached",
          description: "You can only create up to 50 virtual cards",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating virtual card",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });
}

export function useUpdateVirtualCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VirtualCard> & { id: string }) => {
      const { data, error } = await supabase
        .from("virtual_cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as VirtualCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["virtual-cards"] });
      toast({
        title: "Success",
        description: "Virtual card updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating virtual card",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteVirtualCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("virtual_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["virtual-cards"] });
      toast({
        title: "Success",
        description: "Virtual card deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting virtual card",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
