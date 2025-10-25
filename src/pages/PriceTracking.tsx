import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const PriceTracking = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Price Tracking</h1>
          <p className="text-muted-foreground">Monitor product prices and deals</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Track Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Price tracking features will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Features include: product price monitoring, price drop alerts, historical price trends, and deal recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTracking;
