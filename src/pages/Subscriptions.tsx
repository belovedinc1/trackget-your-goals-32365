import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { AddSubscriptionDialog } from "@/components/subscriptions/AddSubscriptionDialog";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

const Subscriptions = () => {
  const { formatAmount } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: subscriptions = [], isLoading } = useSubscriptions();

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
    const amount = Number(sub.amount);
    switch (sub.billing_cycle) {
      case "monthly":
        return sum + amount;
      case "yearly":
        return sum + amount / 12;
      case "weekly":
        return sum + (amount * 52) / 12;
      case "quarterly":
        return sum + (amount * 4) / 12;
      default:
        return sum;
    }
  }, 0);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
          <p className="text-muted-foreground">Manage all your recurring subscriptions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.length - activeSubscriptions.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalMonthlySpend)}</div>
            <p className="text-xs text-muted-foreground">Estimated per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalMonthlySpend * 12)}</div>
            <p className="text-xs text-muted-foreground">Total annual cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>All your recurring payments in one place</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No subscriptions yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddSubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Subscriptions;
