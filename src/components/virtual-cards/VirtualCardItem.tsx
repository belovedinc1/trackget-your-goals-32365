import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Edit, Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useUpdateVirtualCard, useDeleteVirtualCard, VirtualCard } from "@/hooks/useVirtualCards";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface VirtualCardItemProps {
  card: VirtualCard;
}

export function VirtualCardItem({ card }: VirtualCardItemProps) {
  const updateCard = useUpdateVirtualCard();
  const deleteCard = useDeleteVirtualCard();
  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [newName, setNewName] = useState(card.card_name);
  const [adjustAmount, setAdjustAmount] = useState("");

  const handleUpdateName = async () => {
    await updateCard.mutateAsync({
      id: card.id,
      card_name: newName,
    });
    setEditOpen(false);
  };

  const handleAdjustBalance = async (isAdd: boolean) => {
    const amount = parseFloat(adjustAmount) || 0;
    const newBalance = isAdd 
      ? Number(card.card_balance) + amount 
      : Number(card.card_balance) - amount;

    if (newBalance < 0) return;

    await updateCard.mutateAsync({
      id: card.id,
      card_balance: newBalance,
    });
    setAdjustAmount("");
    setAdjustOpen(false);
  };

  const handleDelete = async () => {
    await deleteCard.mutateAsync(card.id);
  };

  return (
    <Card className="overflow-hidden" style={{ borderTopColor: card.card_color, borderTopWidth: 4 }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.card_color}20` }}>
              <CreditCard className="h-5 w-5" style={{ color: card.card_color }} />
            </div>
            <div>
              <h3 className="font-semibold">{card.card_name}</h3>
              <p className="text-sm text-muted-foreground">Virtual Card</p>
            </div>
          </div>

          <div className="flex gap-1">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Card Name</DialogTitle>
                  <DialogDescription>Update the name of your virtual card</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Card Name</Label>
                    <Input
                      id="cardName"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateName}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Virtual Card</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">₹{Number(card.card_balance).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Available Balance</p>
          </div>

          <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Adjust Balance</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Card Balance</DialogTitle>
                <DialogDescription>Add or remove funds from {card.card_name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
                <Button variant="outline" onClick={() => handleAdjustBalance(false)}>
                  <Minus className="h-4 w-4 mr-1" /> Remove
                </Button>
                <Button onClick={() => handleAdjustBalance(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
