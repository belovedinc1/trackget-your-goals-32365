import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Expenses = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Expense tracking features will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Features include: expense categorization, receipt scanning, recurring expenses, and spending analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
