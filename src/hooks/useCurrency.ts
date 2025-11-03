import { useUserPreferences } from "./useUserPreferences";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
};

export function useCurrency() {
  const { data: preferences } = useUserPreferences();
  const currency = preferences?.default_currency || "USD";
  const symbol = CURRENCY_SYMBOLS[currency] || "$";

  const formatAmount = (amount: number, showSymbol = true) => {
    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return showSymbol ? `${symbol}${formatted}` : formatted;
  };

  return {
    currency,
    symbol,
    formatAmount,
    currencyName: CURRENCY_NAMES[currency] || "US Dollar",
  };
}
