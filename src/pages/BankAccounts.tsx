import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useTransactions } from "@/hooks/useExpenses";
import { AddBankAccountDialog } from "@/components/bank-accounts/AddBankAccountDialog";
import { BankAccountCard } from "@/components/bank-accounts/BankAccountCard";
import { Skeleton } from "@/components/ui/skeleton";

const BankAccounts = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: accounts = [], isLoading } = useBankAccounts();
  const { data: transactions = [] } = useTransactions({});

  const summary = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);
    const activeAccounts = accounts.filter((acc) => acc.status === "active").length;
    
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalBalance,
      activeAccounts,
      totalIncome,
      totalExpenses,
    };
  }, [accounts, transactions]);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage your accounts and track balances</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.activeAccounts} active {summary.activeAccounts === 1 ? "account" : "accounts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>All your bank accounts and their balances</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account) => (
                <BankAccountCard key={account.id} account={account} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No bank accounts yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddBankAccountDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default BankAccounts;
