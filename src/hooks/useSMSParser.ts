import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCreateExpense } from "@/hooks/useExpenses";
import { format } from "date-fns";

interface ParsedTransaction {
  amount: number;
  type: "expense" | "income";
  description: string;
  category: string;
  merchant?: string;
  date: string;
}

// Common bank SMS patterns for Indian and international banks
const SMS_PATTERNS = [
  // Debited patterns
  {
    pattern: /(?:debited|withdrawn|spent|paid|deducted)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
    type: "expense" as const,
  },
  {
    pattern: /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:debited|withdrawn|spent|paid|deducted)/i,
    type: "expense" as const,
  },
  // Credit patterns
  {
    pattern: /(?:credited|received|deposited)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
    type: "income" as const,
  },
  {
    pattern: /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:credited|received|deposited)/i,
    type: "income" as const,
  },
  // UPI transaction patterns
  {
    pattern: /upi[:\s]+(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
    type: "expense" as const,
  },
  // Transaction at patterns
  {
    pattern: /txn\s*(?:of\s*)?(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:at|@)\s*(\w+)/i,
    type: "expense" as const,
  },
];

// Merchant to category mapping
const MERCHANT_CATEGORIES: Record<string, string> = {
  swiggy: "Food & Dining",
  zomato: "Food & Dining",
  uber: "Transportation",
  ola: "Transportation",
  rapido: "Transportation",
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  netflix: "Entertainment",
  spotify: "Entertainment",
  hotstar: "Entertainment",
  airtel: "Bills & Utilities",
  jio: "Bills & Utilities",
  vodafone: "Bills & Utilities",
  paytm: "Other",
  phonepe: "Other",
  gpay: "Other",
};

function extractMerchant(sms: string): string | undefined {
  // Look for common patterns
  const atMatch = sms.match(/(?:at|@|to)\s+(\w+)/i);
  if (atMatch) return atMatch[1].toLowerCase();

  // Look for UPI ID patterns
  const upiMatch = sms.match(/(\w+)@\w+/i);
  if (upiMatch) return upiMatch[1].toLowerCase();

  // Look for known merchants
  const lowerSms = sms.toLowerCase();
  for (const merchant of Object.keys(MERCHANT_CATEGORIES)) {
    if (lowerSms.includes(merchant)) return merchant;
  }

  return undefined;
}

function getCategoryFromMerchant(merchant?: string): string {
  if (!merchant) return "Other";
  const lowerMerchant = merchant.toLowerCase();
  return MERCHANT_CATEGORIES[lowerMerchant] || "Other";
}

export function parseBankSMS(sms: string): ParsedTransaction | null {
  for (const { pattern, type } of SMS_PATTERNS) {
    const match = sms.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, "");
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0) continue;

      const merchant = extractMerchant(sms);
      const category = getCategoryFromMerchant(merchant);

      return {
        amount,
        type,
        description: merchant
          ? `${type === "expense" ? "Payment to" : "Received from"} ${merchant}`
          : `Bank ${type === "expense" ? "debit" : "credit"}`,
        category,
        merchant,
        date: format(new Date(), "yyyy-MM-dd"),
      };
    }
  }

  return null;
}

export function useSMSParser() {
  const { toast } = useToast();
  const createExpense = useCreateExpense();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastParsed, setLastParsed] = useState<ParsedTransaction | null>(null);

  const processSMS = useCallback(
    async (smsText: string) => {
      setIsProcessing(true);
      try {
        const parsed = parseBankSMS(smsText);

        if (!parsed) {
          toast({
            title: "Could not parse SMS",
            description: "This doesn't look like a bank transaction SMS",
            variant: "destructive",
          });
          return null;
        }

        setLastParsed(parsed);

        // Auto-add to expenses
        await createExpense.mutateAsync({
          amount: parsed.amount,
          category: parsed.category,
          description: parsed.description,
          expense_date: parsed.date,
          type: parsed.type,
          receipt_url: null,
          account_id: null,
        });

        toast({
          title: `${parsed.type === "expense" ? "Expense" : "Income"} added`,
          description: `${parsed.description} - ₹${parsed.amount}`,
        });

        return parsed;
      } catch (error: any) {
        toast({
          title: "Error processing SMS",
          description: error.message,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [createExpense, toast]
  );

  return {
    processSMS,
    isProcessing,
    lastParsed,
  };
}
