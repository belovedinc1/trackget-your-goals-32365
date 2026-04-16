import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Check, Trash2, UserPlus, X } from "lucide-react";
import { useSplitExpenses, useSplitParticipants, useCreateSplitExpense, useSettleParticipant, useDeleteSplitExpense } from "@/hooks/useSplitExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";

function ParticipantsList({ splitId }: { splitId: string }) {
  const { data: participants = [] } = useSplitParticipants(splitId);
  const settle = useSettleParticipant();
  const { formatAmount } = useCurrency();

  return (
    <div className="space-y-2 mt-3">
      {participants.map((p) => (
        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div>
            <span className="font-medium text-sm">{p.participant_name}</span>
            {p.participant_email && (
              <span className="text-xs text-muted-foreground ml-2">{p.participant_email}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{formatAmount(p.share_amount)}</span>
            {p.is_settled ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Settled</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={() => settle.mutate(p.id)} disabled={settle.isPending}>
                <Check className="h-3 w-3 mr-1" /> Settle
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddSplitDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [participants, setParticipants] = useState<{ name: string; email: string; share_amount: string }[]>([
    { name: "", email: "", share_amount: "" },
  ]);
  const create = useCreateSplitExpense();

  const addParticipant = () => setParticipants([...participants, { name: "", email: "", share_amount: "" }]);
  const removeParticipant = (i: number) => setParticipants(participants.filter((_, idx) => idx !== i));
  const updateParticipant = (i: number, field: string, value: string) => {
    const updated = [...participants];
    (updated[i] as any)[field] = value;
    setParticipants(updated);
  };

  const splitEvenly = () => {
    if (!totalAmount || participants.length === 0) return;
    const share = (parseFloat(totalAmount) / participants.length).toFixed(2);
    setParticipants(participants.map((p) => ({ ...p, share_amount: share })));
  };

  const handleSubmit = () => {
    if (!title || !totalAmount) return;
    create.mutate(
      {
        title,
        total_amount: parseFloat(totalAmount),
        currency: "USD",
        notes: notes || undefined,
        participants: participants.filter((p) => p.name).map((p) => ({
          name: p.name,
          email: p.email || undefined,
          share_amount: parseFloat(p.share_amount) || 0,
        })),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setTotalAmount("");
          setNotes("");
          setParticipants([{ name: "", email: "", share_amount: "" }]);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Split Expense</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Split Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dinner, Trip, etc." />
          </div>
          <div>
            <Label>Total Amount</Label>
            <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Participants</Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={splitEvenly}>Split Evenly</Button>
                <Button type="button" size="sm" variant="outline" onClick={addParticipant}><UserPlus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
            </div>
            {participants.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input placeholder="Name" value={p.name} onChange={(e) => updateParticipant(i, "name", e.target.value)} className="flex-1" />
                <Input placeholder="Email" value={p.email} onChange={(e) => updateParticipant(i, "email", e.target.value)} className="flex-1" />
                <Input type="number" placeholder="Share" value={p.share_amount} onChange={(e) => updateParticipant(i, "share_amount", e.target.value)} className="w-24" />
                {participants.length > 1 && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeParticipant(i)}><X className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleSubmit} disabled={create.isPending} className="w-full">
            {create.isPending ? "Creating..." : "Create Split"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SplitExpenses() {
  const { data: splits = [], isLoading } = useSplitExpenses();
  const deleteSplit = useDeleteSplitExpense();
  const { formatAmount } = useCurrency();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalOwed = splits.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Split Expenses</h1>
          <p className="text-muted-foreground">Split bills with friends and track settlements</p>
        </div>
        <AddSplitDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Splits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{splits.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalOwed)}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : splits.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No split expenses yet. Create one to get started!</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {splits.map((split) => (
            <Card key={split.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpandedId(expandedId === split.id ? null : split.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{split.title}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(split.created_at).toLocaleDateString()}</p>
                    {split.notes && <p className="text-sm text-muted-foreground mt-1">{split.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{formatAmount(split.total_amount)}</span>
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteSplit.mutate(split.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {expandedId === split.id && <ParticipantsList splitId={split.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
