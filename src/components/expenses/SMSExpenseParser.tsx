import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Smartphone, ArrowRight, Check, Info } from "lucide-react";
import { useSMSParser, parseBankSMS } from "@/hooks/useSMSParser";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function SMSExpenseParser() {
  const [smsText, setSmsText] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof parseBankSMS>>(null);
  const { processSMS, isProcessing, lastParsed } = useSMSParser();
  const { formatAmount } = useCurrency();

  const handlePreview = () => {
    const parsed = parseBankSMS(smsText);
    setPreview(parsed);
  };

  const handleAddExpense = async () => {
    await processSMS(smsText);
    setSmsText("");
    setPreview(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Expense Parser
        </CardTitle>
        <CardDescription>
          Paste bank SMS messages to automatically extract and add expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            Copy a bank transaction SMS and paste it here. We'll automatically detect
            the amount, type (expense/income), and categorize it for you.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Textarea
            placeholder="Paste your bank SMS here...
            
Example: 'Rs.500 debited from A/c XX1234 on 05-Jan for UPI/Swiggy. Avl Bal: Rs.15000'"
            value={smsText}
            onChange={(e) => {
              setSmsText(e.target.value);
              setPreview(null);
            }}
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!smsText.trim()}
            >
              Preview
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={!smsText.trim() || isProcessing}
            >
              {isProcessing ? "Processing..." : "Add Transaction"}
            </Button>
          </div>
        </div>

        {preview && (
          <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Detected Transaction</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-2 font-semibold">{formatAmount(preview.amount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <Badge
                  variant={preview.type === "expense" ? "destructive" : "default"}
                  className="ml-2"
                >
                  {preview.type}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2">{preview.category}</span>
              </div>
              {preview.merchant && (
                <div>
                  <span className="text-muted-foreground">Merchant:</span>
                  <span className="ml-2 capitalize">{preview.merchant}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!preview && smsText.trim() && (
          <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground">
            <Info className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Click "Preview" to see detected transaction</p>
          </div>
        )}

        {lastParsed && !preview && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span className="text-sm">
              Last added: {lastParsed.description} - {formatAmount(lastParsed.amount)}
            </span>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Supported banks:</strong> Most Indian banks (SBI, HDFC, ICICI, Axis, etc.)</p>
          <p><strong>Detected:</strong> UPI, Card transactions, ATM withdrawals, Account transfers</p>
        </div>
      </CardContent>
    </Card>
  );
}
