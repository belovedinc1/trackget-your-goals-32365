import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProcessResult {
  success: boolean;
  processed: number;
  subscriptions: number;
  emis: number;
  userSummary: Record<string, {
    subscriptions: string[];
    emis: string[];
    total: number;
  }>;
}

export const useProcessRecurringPayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ProcessResult> => {
      const { data, error } = await supabase.functions.invoke("process-recurring-payments", {
        method: "POST",
      });

      if (error) throw error;
      return data as ProcessResult;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["emiLoans"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });

      if (data.processed > 0) {
        const messages: string[] = [];
        if (data.subscriptions > 0) {
          messages.push(`${data.subscriptions} subscription${data.subscriptions > 1 ? "s" : ""}`);
        }
        if (data.emis > 0) {
          messages.push(`${data.emis} EMI payment${data.emis > 1 ? "s" : ""}`);
        }
        toast.success(`Auto-recorded ${messages.join(" and ")}`, {
          description: "Expenses have been created and dates updated",
        });
      } else {
        toast.info("No payments due today", {
          description: "All subscriptions and EMIs are up to date",
        });
      }
    },
    onError: (error: Error) => {
      console.error("[Process Recurring] Error:", error);
      toast.error("Failed to process recurring payments", {
        description: error.message,
      });
    },
  });
};
