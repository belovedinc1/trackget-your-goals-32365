import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, Receipt as ReceiptIcon } from "lucide-react";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { RecurringTemplatesList } from "@/components/expenses/RecurringTemplatesList";
import { SMSExpenseParser } from "@/components/expenses/SMSExpenseParser";
import { useExpenses, ExpenseFilters as FilterType } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";
const Expenses = () => {
  const { formatAmount } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filters: FilterType = {
    category: category === "all" ? undefined : category,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  };

  const { data: expenses = [], isLoading } = useExpenses(filters);

  const summary = useMemo(() => {
    // Filter ONLY expenses (not income) - fixed to use type field correctly
    const expenseItems = expenses.filter((exp) => exp.type === "expense");
    
    const totalExpenses = expenseItems.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    const byCategory = expenseItems.reduce((acc, exp) => {
      const cat = exp.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const expenseCount = expenseItems.length;
    const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

    return {
      totalExpenses,
      byCategory,
      expenseCount,
      avgExpense,
      expenseItems, // Return the filtered expenses for display
    };
  }, [expenses]);

  const handleResetFilters = () => {
    setCategory("all");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
    setSortOrder("desc");
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.expenseCount} {summary.expenseCount === 1 ? "transaction" : "transactions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {Object.entries(summary.byCategory).length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0][0]}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0][1])}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.avgExpense)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ExpenseFilters
        category={category}
        onCategoryChange={setCategory}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onReset={handleResetFilters}
      />

      {/* SMS Parser for Bank SMS */}
      <SMSExpenseParser />

      {/* Recurring Templates */}
      <RecurringTemplatesList />

      {/* Expense List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ExpenseList expenses={summary.expenseItems} />
      )}

      <AddExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Expenses;
