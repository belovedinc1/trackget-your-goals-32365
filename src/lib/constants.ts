// Application constants

export const APP_NAME = "Trackget";
export const APP_DESCRIPTION = "AI-powered personal finance management";

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  EXPENSES: "/expenses",
  SAVINGS: "/savings",
  EMI: "/emi",
  PRICE_TRACKING: "/price-tracking",
  REPORTS: "/reports",
  AI_ASSISTANT: "/ai-assistant",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

// API endpoints (will be configured later)
export const API_ENDPOINTS = {
  // Add API endpoints as needed
} as const;

// Expense categories
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Personal Care",
  "Travel",
  "Other",
] as const;

// Savings goal types
export const SAVINGS_GOAL_TYPES = [
  "Emergency Fund",
  "Vacation",
  "Down Payment",
  "Investment",
  "Education",
  "Retirement",
  "Other",
] as const;
