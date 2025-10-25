import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Savings = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Savings Goals</h1>
          <p className="text-muted-foreground">Track your savings progress</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Savings tracking features will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Features include: multiple savings goals, progress tracking, automated savings recommendations, and achievement milestones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Savings;
