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
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  selected: boolean;
}

type StatementProfile = "personal" | "business" | "mixed";

function guessCategory(desc: string): string {
  const d = desc.toLowerCase();
  if (/gst|tax|invoice|vendor|supplier|payroll|salary paid|office|software|saas|subscription|client|retainer|professional fee/i.test(d)) return "Business Expense";
  if (/client payment|invoice paid|settlement|payout|business income|professional income|retainer received/i.test(d)) return "Business Income";
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

function parseDelimitedLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeAmount(value: string): number {
  const cleaned = value.replace(/["₹,\s]/g, "").replace(/cr$/i, "").replace(/dr$/i, "");
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

function normalizeDate(value: string): string {
  const cleaned = value.trim();
  const compact = cleaned.match(/^(\d{1,2})([A-Za-z]{3})(\d{2,4})$/);
  if (compact) {
    const [, day, month, year] = compact;
    const parsed = new Date(`${day} ${month} ${year.length === 2 ? `20${year}` : year}`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
  }

  const parsed = new Date(cleaned.replace(/-/g, "/"));
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];

  return cleaned;
}

function classifyStatementProfile(transactions: ParsedTransaction[]): StatementProfile {
  const text = transactions.map((t) => t.description).join(" ").toLowerCase();
  const businessMatches = (text.match(/gst|invoice|vendor|supplier|payroll|client|office|retainer|payout|settlement|professional fee/g) || []).length;
  const personalMatches = (text.match(/swiggy|zomato|grocery|rent|school|shopping|movie|uber|ola|petrol|pharmacy/g) || []).length;

  if (businessMatches >= 3 && personalMatches >= 2) return "mixed";
  if (businessMatches >= 2) return "business";
  return "personal";
}

function parseCSV(text: string): ParsedTransaction[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const results: ParsedTransaction[] = [];

  const cols = parseDelimitedLine(lines[0]).map((c) => c.trim().toLowerCase().replace(/"/g, ""));
  const dateIdx = cols.findIndex((c) => /date/i.test(c));
  const descIdx = cols.findIndex((c) => /desc|narration|particular|detail|remark/i.test(c));
  const debitIdx = cols.findIndex((c) => /debit|withdrawal|dr\b/i.test(c));
  const creditIdx = cols.findIndex((c) => /credit|deposit/i.test(c));
  const amountIdx = cols.findIndex((c) => /amount/i.test(c));

  for (let i = 1; i < lines.length; i++) {
    const parts = parseDelimitedLine(lines[i]).map((c) => c.trim().replace(/"/g, ""));
    if (parts.length < 2) continue;

    const date = dateIdx >= 0 ? parts[dateIdx] : parts[0];
    const description = descIdx >= 0 ? parts[descIdx] : parts[1];
    const debitAmt = debitIdx >= 0 ? normalizeAmount(parts[debitIdx]) : 0;
    const creditAmt = creditIdx >= 0 ? normalizeAmount(parts[creditIdx]) : 0;
    const genericAmount = amountIdx >= 0 ? normalizeAmount(parts[amountIdx]) : normalizeAmount(parts[parts.length - 1]);
    const amount = debitAmt || creditAmt || genericAmount;

    if (!amount || !description) continue;

    const isIncome = creditAmt > 0 || /salary|credit|refund|cashback|received|deposit|cr\b/i.test(description);

    results.push({
      date: normalizeDate(date),
      description,
      amount: Math.abs(amount),
      type: isIncome ? "income" : "expense",
      category: guessCategory(description),
      selected: true,
    });
  }

  return results;
}

function parsePlainTextStatement(text: string): ParsedTransaction[] {
  const dateToken = String.raw`(?:\d{1,2}[-/][A-Za-z]{3}[-/]\d{2,4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}[A-Za-z]{3}\d{2,4})`;
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/\s{2,}/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const dateSplitRows = text
    .replace(/\s{2,}/g, " ")
    .split(new RegExp(`(?=${dateToken}\\s+)`, "i"))
    .map((line) => line.trim())
    .filter(Boolean);

  const results: ParsedTransaction[] = [];
  const rowPattern = new RegExp(`(${dateToken})\\s+(.+?)\\s+(?:₹|rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d{1,2})?)\\s*(cr|dr|credit|debit)?$`, "i");
  const amountPattern = /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)(?:\s*(cr|dr|credit|debit))?/gi;

  for (const line of [...normalized, ...dateSplitRows]) {
    const match = line.match(rowPattern);
    if (!match) {
      const looseDate = line.match(new RegExp(`^(${dateToken})\\s+`, "i"));
      if (!looseDate) continue;

      const amounts = Array.from(line.matchAll(amountPattern))
        .map((amountMatch) => ({
          amount: normalizeAmount(amountMatch[1]),
          marker: amountMatch[2] || "",
          index: amountMatch.index || 0,
        }))
        .filter((entry) => entry.amount > 0);

      if (amounts.length === 0) continue;

      const debitOrCredit = amounts.find((entry) => /dr|debit|cr|credit/i.test(entry.marker));
      const amountEntry = debitOrCredit || (amounts.length >= 3 ? amounts[amounts.length - 3] : amounts[amounts.length - 1]);
      const marker = amountEntry.marker;
      const description = line
        .slice(looseDate[0].length, amountEntry.index)
        .replace(/\s+/g, " ")
        .trim();

      if (!description) continue;

      results.push({
        date: normalizeDate(looseDate[1]),
        description,
        amount: amountEntry.amount,
        type: /cr|credit/i.test(marker || description) ? "income" : "expense",
        category: guessCategory(description),
        selected: true,
      });
      continue;
    }

    const [, date, description, amountText, marker] = match;
    const type = /cr|credit/i.test(marker || description) ? "income" : "expense";
    const amount = normalizeAmount(amountText);
    if (!amount || !description) continue;

    results.push({
      date: normalizeDate(date),
      description: description.trim(),
      amount,
      type,
      category: guessCategory(description),
      selected: true,
    });
  }

  return results;
}

function parseHTMLStatement(text: string): ParsedTransaction[] {
  const document = new DOMParser().parseFromString(text, "text/html");
  const tableRows = Array.from(document.querySelectorAll("tr"));
  const csvLikeRows = tableRows
    .map((row) => Array.from(row.querySelectorAll("th,td")).map((cell) => `"${cell.textContent?.trim() || ""}"`).join(","))
    .filter(Boolean)
    .join("\n");

  if (csvLikeRows) {
    const parsed = parseCSV(csvLikeRows);
    if (parsed.length > 0) return parsed;
  }

  return parsePlainTextStatement(document.body.textContent || text);
}

async function extractPDFText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const textItems = content.items
      .filter((item): item is { str: string; transform: number[] } => "str" in item && "transform" in item)
      .map((item) => ({
        text: item.str.trim(),
        x: item.transform[4] || 0,
        y: Math.round(item.transform[5] || 0),
      }))
      .filter((item) => item.text.length > 0);

    const lineMap = new Map<number, typeof textItems>();
    for (const item of textItems) {
      const line = lineMap.get(item.y) || [];
      line.push(item);
      lineMap.set(item.y, line);
    }

    const lines = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, lineItems]) =>
        lineItems
          .sort((a, b) => a.x - b.x)
          .map((item) => item.text)
          .join(" ")
      );

    pages.push(lines.join("\n"));
  }

  return pages.join("\n");
}

export default function BankStatementImport() {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [statementProfile, setStatementProfile] = useState<StatementProfile | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const createExpense = useCreateExpense();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      const fileName = file.name.toLowerCase();
      let parsed: ParsedTransaction[] = [];

      if (fileName.endsWith(".csv") || file.type === "text/csv") {
        parsed = parseCSV(await file.text());
      } else if (fileName.endsWith(".txt") || file.type === "text/plain") {
        parsed = parsePlainTextStatement(await file.text());
      } else if (fileName.endsWith(".html") || fileName.endsWith(".htm") || file.type === "text/html") {
        parsed = parseHTMLStatement(await file.text());
      } else if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
        parsed = parsePlainTextStatement(await extractPDFText(file));
      } else {
        toast({ title: "Unsupported format", description: "Please upload CSV, PDF, HTML, or TXT.", variant: "destructive" });
        return;
      }

      setTransactions(parsed);
      setStatementProfile(parsed.length > 0 ? classifyStatementProfile(parsed) : null);

      if (parsed.length === 0) {
        toast({
          title: "No transactions found",
          description: fileName.endsWith(".pdf")
            ? "This PDF may be scanned, password-protected, or using a bank layout we cannot map yet. Try HTML/TXT export, or OCR support can be added next."
            : "Try exporting the statement as text/HTML or check the statement format.",
          variant: "destructive"
        });
      } else {
        toast({ title: `Found ${parsed.length} transactions`, description: `Detected as ${classifyStatementProfile(parsed)} statement` });
      }
    } catch (error) {
      console.error("[Statement Import Error]", error);
      toast({ title: "Could not read statement", description: "The file may be scanned, encrypted, or in an unsupported layout.", variant: "destructive" });
    } finally {
      setParsing(false);
      e.target.value = "";
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
    setStatementProfile(null);
  };

  const selectedCount = transactions.filter((t) => t.selected).length;
  const categories = ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Education", "Salary", "Business Income", "Business Expense", "Other"];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Import Bank Statement</h1>
        <p className="text-muted-foreground">Upload CSV, PDF, HTML, or TXT bank statements to bulk-import transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Statement</CardTitle>
          <CardDescription>Supported: CSV, PDF, HTML, and TXT statements from most Indian & international banks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <Label htmlFor="statement-upload" className="cursor-pointer">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
              <p className="text-sm text-muted-foreground mt-1">CSV, PDF, HTML, or TXT files up to 10MB</p>
              {parsing && <p className="text-sm text-primary mt-2">Reading statement...</p>}
            </Label>
            <Input id="statement-upload" type="file" accept=".csv,.pdf,.html,.htm,.txt,text/csv,text/plain,text/html,application/pdf" onChange={handleFileUpload} className="hidden" />
          </div>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{transactions.length} Transactions Found</CardTitle>
                {statementProfile && (
                  <CardDescription className="mt-1">
                    AI-style detection: this looks like a <strong>{statementProfile}</strong> statement.
                  </CardDescription>
                )}
              </div>
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
