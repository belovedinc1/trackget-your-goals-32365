import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Trash2, Pencil, BarChart3 } from "lucide-react";
import { useInvestments, useCreateInvestment, useUpdateInvestment, useDeleteInvestment } from "@/hooks/useInvestments";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";

const assetTypes = ["stock", "mutual_fund", "crypto", "bond", "real_estate", "gold", "other"];

function AddInvestmentDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ asset_name: "", asset_type: "stock", platform: "", quantity: "1", buy_price: "", current_price: "", buy_date: new Date().toISOString().split("T")[0], notes: "" });
  const create = useCreateInvestment();

  const handleSubmit = () => {
    if (!form.asset_name || !form.buy_price || !form.current_price) return;
    create.mutate(
      { asset_name: form.asset_name, asset_type: form.asset_type, platform: form.platform || null, quantity: parseFloat(form.quantity), buy_price: parseFloat(form.buy_price), current_price: parseFloat(form.current_price), buy_date: form.buy_date, notes: form.notes || null },
      { onSuccess: () => { setOpen(false); setForm({ asset_name: "", asset_type: "stock", platform: "", quantity: "1", buy_price: "", current_price: "", buy_date: new Date().toISOString().split("T")[0], notes: "" }); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Investment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Investment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Asset Name</Label><Input value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} placeholder="e.g. AAPL, Bitcoin" /></div>
          <div><Label>Type</Label>
            <Select value={form.asset_type} onValueChange={(v) => setForm({ ...form, asset_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{assetTypes.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Platform</Label><Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="e.g. Zerodha, Coinbase" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div><Label>Buy Date</Label><Input type="date" value={form.buy_date} onChange={(e) => setForm({ ...form, buy_date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Buy Price (per unit)</Label><Input type="number" value={form.buy_price} onChange={(e) => setForm({ ...form, buy_price: e.target.value })} /></div>
            <div><Label>Current Price</Label><Input type="number" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: e.target.value })} /></div>
          </div>
          <Button onClick={handleSubmit} disabled={create.isPending} className="w-full">{create.isPending ? "Adding..." : "Add Investment"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UpdatePriceDialog({ investment }: { investment: any }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(investment.current_price));
  const update = useUpdateInvestment();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Price: {investment.asset_name}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Current Price</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <Button onClick={() => { update.mutate({ id: investment.id, current_price: parseFloat(price) }); setOpen(false); }} className="w-full">Update</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Investments() {
  const { data: investments = [], isLoading } = useInvestments();
  const deleteInv = useDeleteInvestment();
  const { formatAmount } = useCurrency();

  const totalInvested = investments.reduce((s, i) => s + i.quantity * i.buy_price, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.quantity * i.current_price, 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : "0";

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Investments</h1>
          <p className="text-muted-foreground">Track your portfolio across platforms</p>
        </div>
        <AddInvestmentDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Invested</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatAmount(totalInvested)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Current Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatAmount(totalCurrent)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total P&L</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalGain >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {formatAmount(Math.abs(totalGain))} ({gainPercent}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : investments.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No investments tracked yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {investments.map((inv) => {
            const invested = inv.quantity * inv.buy_price;
            const current = inv.quantity * inv.current_price;
            const gain = current - invested;
            const pct = invested > 0 ? ((gain / invested) * 100).toFixed(1) : "0";
            return (
              <Card key={inv.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{inv.asset_name}</h3>
                        <Badge variant="outline">{inv.asset_type.replace("_", " ")}</Badge>
                      </div>
                      {inv.platform && <p className="text-xs text-muted-foreground">{inv.platform}</p>}
                      <div className="mt-2 text-sm space-y-1">
                        <p>Qty: {inv.quantity} × {formatAmount(inv.buy_price)} = {formatAmount(invested)}</p>
                        <p>Current: {formatAmount(inv.current_price)} × {inv.quantity} = {formatAmount(current)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {gain >= 0 ? "+" : ""}{formatAmount(gain)}
                      </div>
                      <div className={`text-sm ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>{pct}%</div>
                      <div className="flex gap-1 mt-2">
                        <UpdatePriceDialog investment={inv} />
                        <Button size="icon" variant="ghost" onClick={() => deleteInv.mutate(inv.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
