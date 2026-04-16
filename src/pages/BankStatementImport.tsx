import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  selected: boolean;
}

function guessCategory(desc: string): string {
  const d = desc.toLowerCase();
  if (/swiggy|zomato|food|restaurant|cafe|pizza|burger/i.test(d)) return "Food & Dining";
  if (/uber|ola|petrol|fuel|metro|bus|train|flight/i.test(d)) return "Transportation";
  if (/amazon|flipkart|myntra|shop|mall/i.test(d)) return "Shopping";
  if (/netflix|spotify|movie|game|disney/i.test(d)) return "Entertainment";
  if (/electricity|water|gas|phone|broadband|wifi|rent/i.test(d)) return "Bills & Utilities";
  if (/hospital|doctor|pharmacy|medical|health/i.test(d)) return "Healthcare";
  if (/school|college|course|udemy|book/i.test(d)) return "Education";
  if (/salary|income|credit|refund|cashback/i.test(d)) return "Salary";
  return "Other";
}

function parseCSV(text: string): ParsedTransaction[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const results: ParsedTransaction[] = [];

  const cols = lines[0].split(",").map((c) => c.trim().toLowerCase().replace(/"/g, ""));
  const dateIdx = cols.findIndex((c) => /date/i.test(c));
  const descIdx = cols.findIndex((c) => /desc|narration|particular|detail|remark/i.test(c));
  const amountIdx = cols.findIndex((c) => /amount|debit|withdrawal/i.test(c));
  const creditIdx = cols.findIndex((c) => /credit|deposit/i.test(c));

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    if (parts.length < 2) continue;

    const date = dateIdx >= 0 ? parts[dateIdx] : parts[0];
    const description = descIdx >= 0 ? parts[descIdx] : parts[1];
    const debitAmt = amountIdx >= 0 ? parseFloat(parts[amountIdx]) || 0 : 0;
    const creditAmt = creditIdx >= 0 ? parseFloat(parts[creditIdx]) || 0 : 0;
    const amount = debitAmt || creditAmt || (parseFloat(parts[parts.length - 1]) || 0);

    if (!amount || !description) continue;

    let parsedDate = date;
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) parsedDate = d.toISOString().split("T")[0];
    } catch {
      // keep original
    }

    const isIncome = creditAmt > 0 || /salary|credit|refund|cashback/i.test(description);

    results.push({
      date: parsedDate,
      description,
      amount: Math.abs(amount),
      type: isIncome ? "income" : "expense",
      category: guessCategory(description),
      selected: true,
    });
  }

  return results;
}

export default function BankStatementImport() {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [importing, setImporting] = useState(false);
  const createExpense = useCreateExpense();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".csv") || file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        setTransactions(parsed);
        if (parsed.length === 0) {
          toast({ title: "No transactions found", description: "Check your CSV format", variant: "destructive" });
        } else {
          toast({ title: `Found ${parsed.length} transactions` });
        }
      };
      reader.readAsText(file);
    } else {
      toast({ title: "Unsupported format", description: "Please upload a CSV file. PDF parsing coming soon!", variant: "destructive" });
    }
  }, [toast]);

  const toggleTransaction = (idx: number) => {
    setTransactions((prev) => prev.map((t, i) => i === idx ? { ...t, selected: !t.selected } : t));
  };

  const updateCategory = (idx: number, category: string) => {
    setTransactions((prev) => prev.map((t, i) => i === idx ? { ...t, category } : t));
  };

  const importSelected = async () => {
    const selected = transactions.filter((t) => t.selected);
    if (selected.length === 0) return;

    setImporting(true);
    let success = 0;
    for (const t of selected) {
      try {
        await createExpense.mutateAsync({
          amount: t.amount,
          category: t.category,
          description: t.description,
          expense_date: t.date,
          type: t.type,
          receipt_url: null,
          account_id: null,
        });
        success++;
      } catch { /* continue */ }
    }
    setImporting(false);
    toast({ title: `Imported ${success} of ${selected.length} transactions` });
    setTransactions([]);
  };

  const selectedCount = transactions.filter((t) => t.selected).length;
  const categories = ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Education", "Salary", "Other"];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Import Bank Statement</h1>
        <p className="text-muted-foreground">Upload a CSV bank statement to bulk-import transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Statement</CardTitle>
          <CardDescription>Supported: CSV files from most Indian & international banks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
              <p className="text-sm text-muted-foreground mt-1">CSV files up to 10MB</p>
            </Label>
            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </div>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{transactions.length} Transactions Found</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{selectedCount} selected</Badge>
                <Button onClick={importSelected} disabled={importing || selectedCount === 0}>
                  {importing ? "Importing..." : <><Check className="mr-2 h-4 w-4" /> Import Selected</>}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">✓</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t, i) => (
                    <TableRow key={i} className={!t.selected ? "opacity-50" : ""}>
                      <TableCell>
                        <input type="checkbox" checked={t.selected} onChange={() => toggleTransaction(i)} />
                      </TableCell>
                      <TableCell className="text-sm">{t.date}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{t.description}</TableCell>
                      <TableCell>
                        <Badge variant={t.type === "income" ? "default" : "secondary"} className={t.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={t.category} onValueChange={(v) => updateCategory(i, v)}>
                          <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {t.type === "income" ? "+" : "-"}{formatAmount(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
