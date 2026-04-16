import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileDown, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useReportData } from "@/hooks/useReportData";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";
import { Skeleton } from "@/components/ui/skeleton";
import IncomeVsExpenseChart from "@/components/reports/IncomeVsExpenseChart";
import CategoryBreakdownChart from "@/components/reports/CategoryBreakdownChart";
import SavingsSummaryChart from "@/components/reports/SavingsSummaryChart";
import AIInsights from "@/components/reports/AIInsights";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Reports = () => {
  const { formatAmount } = useCurrency();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 2)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const { data: reportData, isLoading } = useReportData(startDate, endDate);

  const handleExportPDF = () => {
    if (!reportData) return;
    try {
      exportToPDF(reportData, startDate, endDate);
      toast.success("Report exported as PDF");
    } catch (error) {
      console.error("[PDF Export Error]", error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    try {
      exportToCSV(reportData, startDate, endDate);
      toast.success("Report exported as CSV");
    } catch (error) {
      console.error("[CSV Export Error]", error);
      toast.error("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="mobile-page">
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Insights</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Financial Reports</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Comprehensive analysis and exports built for quick mobile review.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 md:max-w-xl">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 justify-start rounded-2xl bg-white/60 text-left text-xs font-medium sm:col-span-3">
                <Calendar className="mr-2 h-4 w-4" />
                {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 space-y-2">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={handleExportPDF} variant="outline" className="h-12 rounded-2xl bg-white/60">
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="h-12 rounded-2xl bg-white/60">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="default" className="h-12 rounded-2xl" disabled>
            <BarChart3 className="mr-2 h-4 w-4" />
            Live
          </Button>
        </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      ) : reportData ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="app-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(reportData.expenses.total)}</div>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(reportData.savings.totalSaved)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {formatAmount(reportData.savings.totalTarget)}
                </p>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">EMI Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(reportData.emi.totalOutstanding)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly: {formatAmount(reportData.emi.monthlyPayment)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <IncomeVsExpenseChart data={reportData.expenses.byMonth} />
            <CategoryBreakdownChart data={reportData.expenses.byCategory} />
          </div>

          <SavingsSummaryChart goals={reportData.savings.goalProgress} />

          <AIInsights reportData={reportData} />
        </>
      ) : (
        <Card className="app-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            No data available for the selected period
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
