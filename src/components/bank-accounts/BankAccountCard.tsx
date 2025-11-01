import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, MoreVertical, Trash, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateBankAccount, useDeleteBankAccount, BankAccount } from "@/hooks/useBankAccounts";

interface BankAccountCardProps {
  account: BankAccount;
}

export const BankAccountCard = ({ account }: BankAccountCardProps) => {
  const updateAccount = useUpdateBankAccount();
  const deleteAccount = useDeleteBankAccount();

  const handleTogglePrimary = async () => {
    await updateAccount.mutateAsync({
      id: account.id,
      is_primary: !account.is_primary,
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      await deleteAccount.mutateAsync(account.id);
    }
  };

  const getAccountTypeLabel = () => {
    switch (account.account_type) {
      case "savings":
        return "Savings";
      case "checking":
        return "Checking";
      case "credit":
        return "Credit Card";
      case "investment":
        return "Investment";
      case "other":
        return "Other";
      default:
        return account.account_type;
    }
  };

  const getStatusColor = () => {
    switch (account.status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-yellow-500";
      case "closed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCurrencySymbol = () => {
    switch (account.currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "INR":
        return "₹";
      default:
        return "$";
    }
  };

  return (
    <Card className={account.is_primary ? "border-primary border-2" : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{account.account_name}</h3>
              {account.is_primary && (
                <Badge variant="outline" className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </Badge>
              )}
              <Badge variant="outline" className={`${getStatusColor()} text-white`}>
                {account.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="text-base font-medium">{account.bank_name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Account Type</p>
                <p className="text-base font-medium">{getAccountTypeLabel()}</p>
              </div>

              {account.account_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="text-base font-medium">****{account.account_number}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">
                  {getCurrencySymbol()}
                  {Number(account.current_balance).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Initial Balance</p>
                <p className="text-base">
                  {getCurrencySymbol()}
                  {Number(account.initial_balance).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Balance Change</p>
                <p
                  className={`text-base font-medium ${
                    Number(account.current_balance) >= Number(account.initial_balance)
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getCurrencySymbol()}
                  {(Number(account.current_balance) - Number(account.initial_balance)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleTogglePrimary}>
                <Star className="mr-2 h-4 w-4" />
                {account.is_primary ? "Remove Primary" : "Set as Primary"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
