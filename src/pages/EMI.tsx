import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { useEMI } from "@/hooks/useEMI";
import { AddEMIDialog } from "@/components/emi/AddEMIDialog";
import { EMICard } from "@/components/emi/EMICard";
import { NotificationSettings } from "@/components/emi/NotificationSettings";

const EMI = () => {
  const { loans, isLoading } = useEMI();

  const totalOutstanding = loans?.reduce((sum, loan) => sum + Number(loan.outstanding_amount), 0) || 0;
  const monthlyEMI = loans?.reduce((sum, loan) => sum + Number(loan.emi_amount), 0) || 0;
  const activeLoans = loans?.filter(loan => loan.status === "active").length || 0;
  const upcomingPayments = loans?.filter(loan => {
    const daysUntil = Math.ceil((new Date(loan.next_payment_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil >= 0;
  }).length || 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">EMI & Loans</h1>
          <p className="text-muted-foreground">Track your loans and manage payment schedules</p>
        </div>
        <AddEMIDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly EMI</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyEMI.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPayments}</div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your loans...</p>
            </div>
          ) : loans && loans.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {loans.map((loan) => (
                <EMICard key={loan.id} loan={loan} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Loans Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Start tracking your loans and EMIs. Add your first loan to get started with payment schedules and reminders.
                </p>
                <AddEMIDialog />
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
};

export default EMI;
