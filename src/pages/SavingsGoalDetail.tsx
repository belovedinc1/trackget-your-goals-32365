import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, TrendingUp, Calendar, Target } from "lucide-react";
import { useSavings } from "@/hooks/useSavings";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SavingsGoal } from "@/types";

const SavingsGoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addTransaction, deleteGoal } = useSavings();
  
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState<"deposit" | "withdrawal">("deposit");
  const [description, setDescription] = useState("");

  const { data: goal, isLoading: goalLoading } = useQuery({
    queryKey: ["savings-goal", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as SavingsGoal;
    },
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["savings-transactions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_transactions")
        .select("*")
        .eq("goal_id", id!)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    addTransaction.mutate({
      goal_id: id,
      amount: parseFloat(amount),
      transaction_type: transactionType,
      description,
    });

    setAmount("");
    setDescription("");
  };

  const handleDeleteGoal = async () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal.mutateAsync(id!);
      navigate("/savings");
    }
  };

  if (goalLoading) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Loading goal details...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Goal not found</p>
      </div>
    );
  }

  const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);

  // Prepare chart data
  const chartData = transactions
    ?.slice(0, 10)
    .reverse()
    .map((t, idx) => ({
      date: format(new Date(t.transaction_date), "MMM dd"),
      amount: Number(t.amount),
    })) || [];

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/savings")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Goals
        </Button>
        <Button variant="destructive" onClick={handleDeleteGoal}>
          Delete Goal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{goal.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{goal.goal_type}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-4" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Current Amount
                </p>
                <p className="text-2xl font-bold">${Number(goal.current_amount).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Target Amount
                </p>
                <p className="text-2xl font-bold">${Number(goal.target_amount).toLocaleString()}</p>
              </div>
            </div>

            {goal.deadline && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Target Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(goal.deadline), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-lg">
                <span className="text-muted-foreground">Remaining: </span>
                <span className="font-bold">${remaining.toLocaleString()}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-type">Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={(value) => setTransactionType(value as "deposit" | "withdrawal")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Monthly savings"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={addTransaction.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {addTransaction.isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <p className="text-center text-muted-foreground py-4">Loading transactions...</p>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.transaction_type === "deposit" ? "+" : "-"}$
                      {Number(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.description || "No description"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{transaction.transaction_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsGoalDetail;