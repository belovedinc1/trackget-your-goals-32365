import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EMI } from "@/types";
import { toast } from "sonner";

export const useEMI = () => {
  const queryClient = useQueryClient();

  const { data: loans, isLoading } = useQuery({
    queryKey: ["emi-loans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("emi_loans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EMI[];
    },
  });

  const createLoan = useMutation({
    mutationFn: async (loan: Omit<EMI, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("emi_loans")
        .insert([{ ...loan, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emi-loans"] });
      toast.success("Loan added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add loan: " + error.message);
    },
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EMI> }) => {
      const { data, error } = await supabase
        .from("emi_loans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emi-loans"] });
      toast.success("Loan updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update loan: " + error.message);
    },
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emi_loans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emi-loans"] });
      toast.success("Loan deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete loan: " + error.message);
    },
  });

  const recordPayment = useMutation({
    mutationFn: async (payment: {
      loan_id: string;
      amount_paid: number;
      principal_component: number;
      interest_component: number;
      due_date: string;
      payment_date: string;
      payment_method?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("emi_payments")
        .insert([{ ...payment, status: "paid" }])
        .select()
        .single();

      if (error) throw error;

      // Update outstanding amount
      const { data: loan } = await supabase
        .from("emi_loans")
        .select("outstanding_amount")
        .eq("id", payment.loan_id)
        .single();

      if (loan) {
        const newOutstanding = Number(loan.outstanding_amount) - payment.principal_component;
        await supabase
          .from("emi_loans")
          .update({ 
            outstanding_amount: newOutstanding,
            status: newOutstanding <= 0 ? "completed" : "active"
          })
          .eq("id", payment.loan_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emi-loans"] });
      queryClient.invalidateQueries({ queryKey: ["emi-payments"] });
      toast.success("Payment recorded successfully!");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });

  return {
    loans,
    isLoading,
    createLoan,
    updateLoan,
    deleteLoan,
    recordPayment,
  };
};

export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  return Math.round(emi * 100) / 100;
};

export const generateEMISchedule = (
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date
) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  let balance = principal;
  const schedule = [];

  for (let i = 0; i < tenureMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance -= principalPayment;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      month: i + 1,
      dueDate: dueDate.toISOString().split("T")[0],
      emiAmount: emi,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });
  }

  return schedule;
};