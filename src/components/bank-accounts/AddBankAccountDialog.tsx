import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateBankAccount } from "@/hooks/useBankAccounts";

interface AddBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddBankAccountDialog = ({ open, onOpenChange }: AddBankAccountDialogProps) => {
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "checking" | "credit" | "investment" | "other">("checking");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isPrimary, setIsPrimary] = useState(false);

  const createAccount = useCreateBankAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName || !bankName || !initialBalance) {
      return;
    }

    await createAccount.mutateAsync({
      account_name: accountName,
      account_type: accountType,
      bank_name: bankName,
      account_number: accountNumber || undefined,
      initial_balance: parseFloat(initialBalance),
      currency,
      is_primary: isPrimary,
      status: "active",
    });

    setAccountName("");
    setAccountType("checking");
    setBankName("");
    setAccountNumber("");
    setInitialBalance("");
    setCurrency("USD");
    setIsPrimary(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>Add a new bank account to track your finances</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name *</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Personal Savings, Business Checking, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type *</Label>
            <Select value={accountType} onValueChange={(value: any) => setAccountType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Chase, Bank of America, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number (Optional)</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Last 4 digits"
              maxLength={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">Initial Balance *</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isPrimary">Set as Primary Account</Label>
            <Switch
              id="isPrimary"
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending ? "Adding..." : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
