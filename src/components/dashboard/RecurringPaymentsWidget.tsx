import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CreditCard, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useEMI } from "@/hooks/useEMI";
import { useProcessRecurringPayments } from "@/hooks/useProcessRecurring";
import { useCurrency } from "@/hooks/useCurrency";
import { format, parseISO, isToday, isPast, isTomorrow } from "date-fns";

export function RecurringPaymentsWidget() {
  const { formatAmount } = useCurrency();
  const { data: subscriptions = [] } = useSubscriptions();
  const { loans = [] } = useEMI();
  const processPayments = useProcessRecurringPayments();

  // Find due/upcoming subscriptions
  const dueSubscriptions = subscriptions.filter((sub) => {
    if (sub.status !== "active") return false;
    const nextDate = parseISO(sub.next_billing_date);
    return isToday(nextDate) || isPast(nextDate);
  });

  const upcomingSubscriptions = subscriptions.filter((sub) => {
    if (sub.status !== "active") return false;
    const nextDate = parseISO(sub.next_billing_date);
    return isTomorrow(nextDate);
  });

  // Find due/upcoming EMIs
  const dueEMIs = loans.filter((loan) => {
    if (loan.status !== "active" || loan.outstanding_amount <= 0) return false;
    const nextDate = parseISO(loan.next_payment_date);
    return isToday(nextDate) || isPast(nextDate);
  });

  const upcomingEMIs = loans.filter((loan) => {
    if (loan.status !== "active" || loan.outstanding_amount <= 0) return false;
    const nextDate = parseISO(loan.next_payment_date);
    return isTomorrow(nextDate);
  });

  const totalDue = dueSubscriptions.length + dueEMIs.length;
  const totalUpcoming = upcomingSubscriptions.length + upcomingEMIs.length;

  const dueAmount = [
    ...dueSubscriptions.map((s) => Number(s.amount)),
    ...dueEMIs.map((e) => Number(e.emi_amount)),
  ].reduce((sum, a) => sum + a, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recurring Payments</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => processPayments.mutate()}
          disabled={processPayments.isPending}
          title="Process due payments"
        >
          <RefreshCw className={`h-4 w-4 ${processPayments.isPending ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalDue > 0 ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">
                  {totalDue} payment{totalDue > 1 ? "s" : ""} due
                </p>
                <p className="text-xs text-muted-foreground">
                  Total: {formatAmount(dueAmount)}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => processPayments.mutate()}
              disabled={processPayments.isPending}
            >
              {processPayments.isPending ? "Processing..." : "Record All"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm">All payments up to date</p>
          </div>
        )}

        {/* Due Items */}
        {(dueSubscriptions.length > 0 || dueEMIs.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Due Today
            </h4>
            <div className="space-y-1">
              {dueSubscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    <span>{sub.service_name}</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {formatAmount(Number(sub.amount))}
                  </Badge>
                </div>
              ))}
              {dueEMIs.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{loan.lender_name} EMI</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {formatAmount(Number(loan.emi_amount))}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Items */}
        {(upcomingSubscriptions.length > 0 || upcomingEMIs.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tomorrow
            </h4>
            <div className="space-y-1">
              {upcomingSubscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    <span>{sub.service_name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formatAmount(Number(sub.amount))}
                  </Badge>
                </div>
              ))}
              {upcomingEMIs.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{loan.lender_name} EMI</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formatAmount(Number(loan.emi_amount))}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalDue === 0 && totalUpcoming === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No upcoming payments in the next 24 hours
          </p>
        )}
      </CardContent>
    </Card>
  );
}
