import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateVirtualCard } from "@/hooks/useVirtualCards";

const CARD_COLORS = [
  "#1E3A8A", "#059669", "#DC2626", "#7C3AED", "#EA580C", "#0891B2", "#DB2777", "#65A30D"
];

const virtualCardSchema = z.object({
  card_name: z.string().min(1, "Card name is required").max(50, "Name too long"),
  card_balance: z.number().min(0, "Balance must be positive").max(1000000, "Balance too large"),
  card_color: z.string(),
});

interface AddVirtualCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVirtualCardDialog({ open, onOpenChange }: AddVirtualCardDialogProps) {
  const createCard = useCreateVirtualCard();

  const form = useForm<z.infer<typeof virtualCardSchema>>({
    resolver: zodResolver(virtualCardSchema),
    defaultValues: {
      card_name: "",
      card_balance: 0,
      card_color: CARD_COLORS[0],
    },
  });

  const handleSubmit = async (values: z.infer<typeof virtualCardSchema>) => {
    await createCard.mutateAsync({
      card_name: values.card_name,
      card_balance: values.card_balance,
      card_color: values.card_color,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Virtual Card</DialogTitle>
          <DialogDescription>
            Create a virtual card for budgeting. This is for visualization only and won't affect your real account balances.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="card_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Travel Fund, Shopping Budget..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="card_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Balance *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
              name="card_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Color</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {CARD_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          field.value === color ? "border-primary scale-110" : "border-border"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCard.isPending}>
                {createCard.isPending ? "Creating..." : "Create Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
