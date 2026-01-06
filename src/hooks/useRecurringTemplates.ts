import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface RecurringTemplate {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  description: string | null;
  schedule_day: number;
  is_active: boolean;
  last_processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useRecurringTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["recurring-templates", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("recurring_expense_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("schedule_day", { ascending: true });

      if (error) {
        toast({
          title: "Error fetching templates",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as RecurringTemplate[];
    },
    enabled: !!user,
  });
}

export function useCreateRecurringTemplate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<RecurringTemplate, "id" | "user_id" | "created_at" | "updated_at" | "last_processed_at">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("recurring_expense_templates")
        .insert({
          ...template,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      toast({
        title: "Template created",
        description: "Recurring expense template has been scheduled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRecurringTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("recurring_expense_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      toast({
        title: "Template updated",
        description: "Recurring expense template has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteRecurringTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recurring_expense_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      toast({
        title: "Template deleted",
        description: "Recurring expense template has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
