import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBudgetLimits,
  useUpsertBudgetLimit,
  useDeleteBudgetLimit,
} from "@/hooks/useBudgetLimits";
import { useCurrency } from "@/hooks/useCurrency";

const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Rent",
  "Insurance",
  "Subscriptions",
  "Other",
];

export function BudgetLimitsManager() {
  const { data: limits, isLoading } = useBudgetLimits();
  const { formatAmount } = useCurrency();
  const upsertLimit = useUpsertBudgetLimit();
  const deleteLimit = useDeleteBudgetLimit();

  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [newThreshold, setNewThreshold] = useState(80);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState("");
  const [editThreshold, setEditThreshold] = useState(80);

  const usedCategories = limits?.map((l) => l.category) || [];
  const availableCategories = CATEGORIES.filter((c) => !usedCategories.includes(c));

  const handleAddLimit = async () => {
    if (!newCategory || !newLimit) return;

    await upsertLimit.mutateAsync({
      category: newCategory,
      monthly_limit: parseFloat(newLimit),
      alert_threshold: newThreshold,
    });

    setNewCategory("");
    setNewLimit("");
    setNewThreshold(80);
  };

  const handleUpdateLimit = async (id: string, category: string) => {
    await upsertLimit.mutateAsync({
      category,
      monthly_limit: parseFloat(editLimit),
      alert_threshold: editThreshold,
    });
    setEditingId(null);
  };

  const startEditing = (limit: { id: string; monthly_limit: number; alert_threshold: number }) => {
    setEditingId(limit.id);
    setEditLimit(limit.monthly_limit.toString());
    setEditThreshold(limit.alert_threshold);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Limits</CardTitle>
        <CardDescription>
          Set spending limits per category and get alerts when approaching them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {limits && limits.length > 0 && (
          <div className="space-y-3">
            {limits.map((limit) => (
              <div
                key={limit.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-background"
              >
                {editingId === limit.id ? (
                  <>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{limit.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">per month</span>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Alert at {editThreshold}%</Label>
                        <Slider
                          value={[editThreshold]}
                          onValueChange={([v]) => setEditThreshold(v)}
                          min={50}
                          max={100}
                          step={5}
                          className="w-48"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateLimit(limit.id, limit.category)}
                        disabled={upsertLimit.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{limit.category}</span>
                        <Badge variant="secondary" className="text-xs">
                          Alert at {limit.alert_threshold}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(limit.monthly_limit)} / month
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(limit)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteLimit.mutate(limit.id)}
                        disabled={deleteLimit.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {availableCategories.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <Label>Add Budget Limit</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Monthly Limit</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Alert Threshold: {newThreshold}%
              </Label>
              <Slider
                value={[newThreshold]}
                onValueChange={([v]) => setNewThreshold(v)}
                min={50}
                max={100}
                step={5}
                className="w-full max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Get notified when spending reaches this percentage
              </p>
            </div>
            <Button
              onClick={handleAddLimit}
              disabled={!newCategory || !newLimit || upsertLimit.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Budget Limit
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4 text-muted-foreground">
            Loading budget limits...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
