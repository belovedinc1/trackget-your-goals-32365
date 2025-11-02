import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Savings from "./pages/Savings";
import SavingsGoalDetail from "./pages/SavingsGoalDetail";
import Transactions from "./pages/Transactions";
import EMI from "./pages/EMI";
import EMIDetail from "./pages/EMIDetail";
import PriceTracking from "./pages/PriceTracking";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AIAssistant from "./pages/AIAssistant";
import Subscriptions from "./pages/Subscriptions";
import BankAccounts from "./pages/BankAccounts";
import VirtualCards from "./pages/VirtualCards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Expenses />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Transactions />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/savings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Savings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/savings/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SavingsGoalDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emi"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EMI />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emi/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EMIDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/price-tracking"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PriceTracking />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AIAssistant />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Subscriptions />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-accounts"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BankAccounts />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/virtual-cards"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VirtualCards />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
