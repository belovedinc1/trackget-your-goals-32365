import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useUpdateBankAccount, BankAccount } from "@/hooks/useBankAccounts";

interface EditBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: BankAccount;
}

export function EditBalanceDialog({ open, onOpenChange, account }: EditBalanceDialogProps) {
  const updateAccount = useUpdateBankAccount();
  const [newBalance, setNewBalance] = useState(account.current_balance.toString());

  const handleSave = async () => {
    await updateAccount.mutateAsync({
      id: account.id,
      current_balance: Number(newBalance),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account Balance</DialogTitle>
          <DialogDescription>
            Manually update the current balance for {account.account_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateAccount.isPending}>
            {updateAccount.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
