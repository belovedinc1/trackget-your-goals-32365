import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useSavings } from "@/hooks/useSavings";
import { SavingsGoalType } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  target_amount: z.number().positive("Target amount must be positive").max(10000000, "Amount too large"),
  goal_type: z.enum(["Emergency Fund", "Vacation", "Down Payment", "Investment", "Education", "Retirement", "Other"]),
  deadline: z.string().optional(),
});

const goalTypes: SavingsGoalType[] = [
  "Emergency Fund",
  "Vacation",
  "Down Payment",
  "Investment",
  "Education",
  "Retirement",
  "Other"
];

export const AddGoalDialog = () => {
  const [open, setOpen] = useState(false);
  const { createGoal } = useSavings();

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      target_amount: 0,
      goal_type: "Emergency Fund",
      deadline: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof goalSchema>) => {
    createGoal.mutate({
      title: values.title,
      target_amount: values.target_amount,
      current_amount: 0,
      goal_type: values.goal_type,
      deadline: values.deadline || undefined,
    });
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Emergency Fund" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10000000"
                      placeholder="10000"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goalTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={createGoal.isPending}>
              {createGoal.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};