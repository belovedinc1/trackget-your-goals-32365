import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BankAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_type: "savings" | "checking" | "credit" | "investment" | "other";
  bank_name: string;
  account_number?: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  is_primary: boolean;
  status: "active" | "inactive" | "closed";
  created_at: string;
  updated_at: string;
}

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Omit<BankAccount, "id" | "user_id" | "created_at" | "updated_at" | "current_balance">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bank_accounts")
        .insert([{ 
          ...account, 
          user_id: user.id,
          current_balance: account.initial_balance 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Bank account added successfully");
    },
    onError: (error: Error) => {
      console.error("[Bank Account Add Error]", error);
      toast.error("Failed to add bank account. Please try again.");
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Bank account updated successfully");
    },
    onError: (error: Error) => {
      console.error("[Bank Account Update Error]", error);
      toast.error("Failed to update bank account. Please try again.");
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Bank account deleted successfully");
    },
    onError: (error: Error) => {
      console.error("[Bank Account Delete Error]", error);
      toast.error("Failed to delete bank account. Please try again.");
    },
  });
};
