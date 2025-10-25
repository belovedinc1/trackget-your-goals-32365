import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const EMI = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">EMI & Loans</h1>
          <p className="text-muted-foreground">Manage your EMI payments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add EMI
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>EMI management features will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Features include: EMI tracking, payment reminders, EMI calculator, interest tracking, and payment history.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EMI;
