import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, Calendar, DollarSign, TrendingDown, Trash2 } from "lucide-react";
import { EMI } from "@/types";
import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { useEMI } from "@/hooks/useEMI";
import { useCurrency } from "@/hooks/useCurrency";

interface EMICardProps {
  loan: EMI;
}

export const EMICard = ({ loan }: EMICardProps) => {
  const { formatAmount } = useCurrency();
  const { deleteLoan } = useEMI();
  const progress = ((Number(loan.loan_amount) - Number(loan.outstanding_amount)) / Number(loan.loan_amount)) * 100;
  const nextPaymentDate = new Date(loan.next_payment_date);
  const daysUntilPayment = differenceInDays(nextPaymentDate, new Date());
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the loan from ${loan.lender_name}?`)) {
      deleteLoan.mutate(loan.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{loan.lender_name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{loan.status}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Repayment Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Monthly EMI
            </p>
            <p className="text-lg font-bold">{formatAmount(Number(loan.emi_amount))}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Outstanding
            </p>
            <p className="text-lg font-bold">{formatAmount(Number(loan.outstanding_amount))}</p>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Next Payment</p>
                <p className="text-xs text-muted-foreground">
                  {format(nextPaymentDate, "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            {daysUntilPayment <= 7 && daysUntilPayment >= 0 && (
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                Due in {daysUntilPayment} days
              </span>
            )}
            {daysUntilPayment < 0 && (
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                Overdue
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
          <div>
            <p className="text-muted-foreground">Rate</p>
            <p className="font-medium">{Number(loan.interest_rate).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tenure</p>
            <p className="font-medium">{loan.tenure_months} months</p>
          </div>
        </div>

        <Link to={`/emi/${loan.id}`}>
          <Button variant="outline" className="w-full">
            View Details & Schedule
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};