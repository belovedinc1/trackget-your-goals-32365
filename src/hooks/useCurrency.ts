import { useUserPreferences } from "./useUserPreferences";
import { useQuery } from "@tanstack/react-query";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  AED: "د.إ",
  CHF: "CHF",
  CNY: "¥",
  BRL: "R$",
  MXN: "MX$",
  ZAR: "R",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  NZD: "NZ$",
  THB: "฿",
  MYR: "RM",
  PHP: "₱",
  IDR: "Rp",
  KRW: "₩",
  BDT: "৳",
  PKR: "₨",
  LKR: "Rs",
  NPR: "₨",
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  SGD: "Singapore Dollar",
  AED: "UAE Dirham",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  ZAR: "South African Rand",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  NZD: "New Zealand Dollar",
  THB: "Thai Baht",
  MYR: "Malaysian Ringgit",
  PHP: "Philippine Peso",
  IDR: "Indonesian Rupiah",
  KRW: "South Korean Won",
  BDT: "Bangladeshi Taka",
  PKR: "Pakistani Rupee",
  LKR: "Sri Lankan Rupee",
  NPR: "Nepalese Rupee",
};

// Static exchange rates (relative to USD) - updated periodically
// For a production app, you'd fetch these from an API
const EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 154.5,
  AUD: 1.55,
  CAD: 1.37,
  SGD: 1.35,
  AED: 3.67,
  CHF: 0.88,
  CNY: 7.25,
  BRL: 4.97,
  MXN: 17.15,
  ZAR: 18.6,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.88,
  NZD: 1.67,
  THB: 35.5,
  MYR: 4.72,
  PHP: 56.0,
  IDR: 15650,
  KRW: 1330,
  BDT: 110,
  PKR: 278,
  LKR: 320,
  NPR: 133.5,
};

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      // Use static rates; could be replaced with a live API
      return EXCHANGE_RATES_TO_USD;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCurrency() {
  const { data: preferences } = useUserPreferences();
  const currency = preferences?.default_currency || "USD";
  const symbol = CURRENCY_SYMBOLS[currency] || "$";

  const convertAmount = (amount: number, fromCurrency: string, toCurrency?: string) => {
    const target = toCurrency || currency;
    if (fromCurrency === target) return amount;
    const fromRate = EXCHANGE_RATES_TO_USD[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES_TO_USD[target] || 1;
    return (amount / fromRate) * toRate;
  };

  const formatAmount = (amount: number, showSymbol = true, overrideCurrency?: string) => {
    const curr = overrideCurrency || currency;
    const sym = CURRENCY_SYMBOLS[curr] || "$";
    
    // Determine decimal places based on currency
    const noDecimalCurrencies = ["JPY", "KRW", "IDR"];
    const fractionDigits = noDecimalCurrencies.includes(curr) ? 0 : 2;
    
    const formatted = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    
    const sign = amount < 0 ? "-" : "";
    return showSymbol ? `${sign}${sym}${formatted}` : `${sign}${formatted}`;
  };

  return {
    currency,
    symbol,
    formatAmount,
    convertAmount,
    currencyName: CURRENCY_NAMES[currency] || "US Dollar",
    availableCurrencies: Object.keys(CURRENCY_NAMES),
    exchangeRates: EXCHANGE_RATES_TO_USD,
  };
}
