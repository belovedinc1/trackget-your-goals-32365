import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import { useState } from "react";
import { AddVirtualCardDialog } from "@/components/virtual-cards/AddVirtualCardDialog";
import { VirtualCardItem } from "@/components/virtual-cards/VirtualCardItem";
import { useVirtualCards } from "@/hooks/useVirtualCards";
import { Card, CardContent } from "@/components/ui/card";

export default function VirtualCards() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data: cards, isLoading } = useVirtualCards();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Virtual Cards</h1>
          <p className="text-muted-foreground">
            Create virtual cards for budgeting and expense tracking (Prototype - UI only)
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} disabled={cards && cards.length >= 50}>
          <Plus className="mr-2 h-4 w-4" />
          Create Card {cards && `(${cards.length}/50)`}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <VirtualCardItem key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Virtual Cards Yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Create virtual cards to manage budgets for different categories. These cards are for
              visualization only and won't affect your real account balances.
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Card
            </Button>
          </CardContent>
        </Card>
      )}

      <AddVirtualCardDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
