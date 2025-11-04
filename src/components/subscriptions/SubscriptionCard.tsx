import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, MoreVertical, Trash, Pause, Play } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateSubscription, useDeleteSubscription, Subscription } from "@/hooks/useSubscriptions";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const { formatAmount } = useCurrency();
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();

  const handleToggleStatus = async () => {
    const newStatus = subscription.status === "active" ? "paused" : "active";
    await updateSubscription.mutateAsync({
      id: subscription.id,
      status: newStatus,
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      await deleteSubscription.mutateAsync(subscription.id);
    }
  };

  const getBillingCycleLabel = () => {
    switch (subscription.billing_cycle) {
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "yearly":
        return "Yearly";
      default:
        return subscription.billing_cycle;
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{subscription.service_name}</h3>
              <Badge variant="outline" className={`${getStatusColor()} text-white`}>
                {subscription.status}
              </Badge>
            </div>

            {subscription.category && (
              <p className="text-sm text-muted-foreground mb-2">{subscription.category}</p>
            )}

            {subscription.description && (
              <p className="text-sm text-muted-foreground mb-3">{subscription.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-base font-semibold">{formatAmount(Number(subscription.amount))}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Billing Cycle</p>
                  <p className="text-base font-semibold">{getBillingCycleLabel()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="text-base">
                    {format(new Date(subscription.start_date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="text-base">
                    {format(new Date(subscription.next_billing_date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleStatus}>
                {subscription.status === "active" ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
