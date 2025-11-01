import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export interface ReportData {
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    byMonth: Array<{ month: string; amount: number }>;
  };
  savings: {
    totalSaved: number;
    totalTarget: number;
    goalProgress: Array<{ title: string; progress: number; current: number; target: number }>;
  };
  emi: {
    totalOutstanding: number;
    monthlyPayment: number;
    loans: Array<{ lender: string; outstanding: number; emi: number }>;
  };
}

export const useReportData = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["report-data", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch expenses (excluding income)
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .neq("type", "income")
        .gte("expense_date", format(startDate, "yyyy-MM-dd"))
        .lte("expense_date", format(endDate, "yyyy-MM-dd"))
        .order("expense_date", { ascending: true });

      if (expensesError) throw expensesError;

      // Fetch savings goals
      const { data: savingsGoals, error: savingsError } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user.id);

      if (savingsError) throw savingsError;

      // Fetch EMI loans
      const { data: emiLoans, error: emiError } = await supabase
        .from("emi_loans")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (emiError) throw emiError;

      // Process expenses
      const expenseTotal = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const expensesByCategory: Record<string, number> = {};
      expenses?.forEach(exp => {
        expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + Number(exp.amount);
      });

      // Group expenses by month
      const expensesByMonth: Record<string, number> = {};
      expenses?.forEach(exp => {
        const monthKey = format(new Date(exp.expense_date), "MMM yyyy");
        expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + Number(exp.amount);
      });

      const expensesByMonthArray = Object.entries(expensesByMonth).map(([month, amount]) => ({
        month,
        amount,
      }));

      // Process savings
      const totalSaved = savingsGoals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0;
      const totalTarget = savingsGoals?.reduce((sum, goal) => sum + Number(goal.target_amount), 0) || 0;
      const goalProgress = savingsGoals?.map(goal => ({
        title: goal.title,
        progress: (Number(goal.current_amount) / Number(goal.target_amount)) * 100,
        current: Number(goal.current_amount),
        target: Number(goal.target_amount),
      })) || [];

      // Process EMI
      const totalOutstanding = emiLoans?.reduce((sum, loan) => sum + Number(loan.outstanding_amount), 0) || 0;
      const monthlyPayment = emiLoans?.reduce((sum, loan) => sum + Number(loan.emi_amount), 0) || 0;
      const loans = emiLoans?.map(loan => ({
        lender: loan.lender_name,
        outstanding: Number(loan.outstanding_amount),
        emi: Number(loan.emi_amount),
      })) || [];

      const reportData: ReportData = {
        expenses: {
          total: expenseTotal,
          byCategory: expensesByCategory,
          byMonth: expensesByMonthArray,
        },
        savings: {
          totalSaved,
          totalTarget,
          goalProgress,
        },
        emi: {
          totalOutstanding,
          monthlyPayment,
          loans,
        },
      };

      return reportData;
    },
  });
};
