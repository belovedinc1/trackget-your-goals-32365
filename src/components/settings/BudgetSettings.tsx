import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";

interface BudgetLimit {
  category: string;
  limit: number;
}

const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Other",
];

export function BudgetSettings() {
  const { toast } = useToast();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [monthlyBudget, setMonthlyBudget] = useState<number>(5000);
  const [currency, setCurrency] = useState<string>("USD");
  const [categoryBudgets, setCategoryBudgets] = useState<BudgetLimit[]>(
    DEFAULT_CATEGORIES.map((category) => ({ category, limit: 500 }))
  );

  useEffect(() => {
    if (preferences?.default_currency) {
      setCurrency(preferences.default_currency);
    }
  }, [preferences]);

  const handleMonthlyBudgetChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setMonthlyBudget(numValue);
  };

  const handleCategoryBudgetChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCategoryBudgets((prev) =>
      prev.map((item) =>
        item.category === category ? { ...item, limit: numValue } : item
      )
    );
  };

  const handleSave = async () => {
    try {
      await updatePreferences.mutateAsync({
        default_currency: currency,
      });

      // Save to localStorage for now (can be migrated to Supabase later)
      localStorage.setItem("monthlyBudget", monthlyBudget.toString());
      localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
      
      toast({
        title: "Budget settings saved",
        description: "Your budget limits have been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
        <CardDescription>Set your monthly budget limits by category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currency">Default Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
              <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
              <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly-budget">Monthly Budget Limit</Label>
          <div className="flex gap-2">
            <span className="flex items-center text-muted-foreground">$</span>
            <Input
              id="monthly-budget"
              type="number"
              value={monthlyBudget}
              onChange={(e) => handleMonthlyBudgetChange(e.target.value)}
              placeholder="5000"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Get alerts when you approach this limit
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label>Category Budget Limits</Label>
          {categoryBudgets.map((item) => (
            <div key={item.category} className="flex items-center gap-4">
              <Label htmlFor={item.category} className="flex-1 text-sm">
                {item.category}
              </Label>
              <div className="flex items-center gap-2 w-32">
                <span className="text-muted-foreground">$</span>
                <Input
                  id={item.category}
                  type="number"
                  value={item.limit}
                  onChange={(e) =>
                    handleCategoryBudgetChange(item.category, e.target.value)
                  }
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full" disabled={updatePreferences.isPending}>
          {updatePreferences.isPending ? "Saving..." : "Save Budget Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
