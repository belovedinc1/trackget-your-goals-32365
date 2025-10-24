// Global type definitions for Trackget

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  goal_type: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface EMI {
  id: string;
  user_id: string;
  lender_name: string;
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  start_date: string;
  next_payment_date: string;
  outstanding_amount: number;
  created_at: string;
  updated_at: string;
}

export interface TrackedProduct {
  id: string;
  user_id: string;
  product_name: string;
  product_url: string;
  current_price: number;
  target_price?: number;
  platform: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory = 
  | "Food & Dining"
  | "Transportation"
  | "Shopping"
  | "Entertainment"
  | "Bills & Utilities"
  | "Healthcare"
  | "Education"
  | "Personal Care"
  | "Travel"
  | "Other";

export type SavingsGoalType = 
  | "Emergency Fund"
  | "Vacation"
  | "Down Payment"
  | "Investment"
  | "Education"
  | "Retirement"
  | "Other";
