import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Reports = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Reports</h1>
          <p className="text-muted-foreground">View and export your financial data</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Reporting features will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Features include: monthly reports, custom date ranges, income vs expense analysis, PDF/CSV exports, and AI-powered insights.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
