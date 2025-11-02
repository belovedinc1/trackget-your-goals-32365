import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  reminder_days_before: number;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        toast({
          title: "Error fetching preferences",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as UserPreferences | null;
    },
    enabled: !!user,
  });
}

export function useUpdateUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from("user_preferences")
          .update(preferences)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("user_preferences")
          .insert({
            ...preferences,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
