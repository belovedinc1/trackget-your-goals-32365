import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScanReceipt } from "@/hooks/useScanReceipt";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ReceiptCameraButtonProps {
  onExpenseAdded?: () => void;
  variant?: "default" | "fab";
}

export function ReceiptCameraButton({ onExpenseAdded, variant = "default" }: ReceiptCameraButtonProps) {
  const { user } = useAuth();
  const scanReceiptMutation = useScanReceipt();
  const createExpense = useCreateExpense();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    data: { amount: number; category: string; description: string; date: string } | null;
  }>({ open: false, data: null });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await scanReceiptMutation.mutateAsync(file);
      
      if (result) {
        setConfirmDialog({
          open: true,
          data: {
            amount: result.amount || 0,
            category: result.category || "Other",
            description: result.merchant || result.description || "Receipt scan",
            date: result.date || new Date().toISOString().split('T')[0],
          },
        });
      }
    } catch (error) {
      console.error("Error scanning receipt:", error);
      toast.error("Failed to scan receipt");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirm = async () => {
    if (!user || !confirmDialog.data) return;

    try {
      await createExpense.mutateAsync({
        amount: confirmDialog.data.amount,
        category: confirmDialog.data.category,
        description: confirmDialog.data.description,
        expense_date: confirmDialog.data.date,
        type: "expense",
        receipt_url: null,
        account_id: null,
      });

      toast.success(`Added expense: ₹${confirmDialog.data.amount}`);
      setConfirmDialog({ open: false, data: null });
      onExpenseAdded?.();
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (variant === "fab") {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          size="lg"
          className={cn(
            "fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-40",
            "bg-primary hover:bg-primary/90"
          )}
          onClick={handleClick}
          disabled={scanReceiptMutation.isPending}
        >
          {scanReceiptMutation.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
        </Button>

        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, data: open ? confirmDialog.data : null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Receipt Scan</DialogTitle>
            </DialogHeader>
            {confirmDialog.data && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={confirmDialog.data.amount}
                    onChange={(e) => setConfirmDialog({
                      ...confirmDialog,
                      data: { ...confirmDialog.data!, amount: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={confirmDialog.data.description}
                    onChange={(e) => setConfirmDialog({
                      ...confirmDialog,
                      data: { ...confirmDialog.data!, description: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={confirmDialog.data.category}
                    onChange={(e) => setConfirmDialog({
                      ...confirmDialog,
                      data: { ...confirmDialog.data!, category: e.target.value }
                    })}
                  />
                </div>
                <Button onClick={handleConfirm} className="w-full" disabled={createExpense.isPending}>
                  Add Expense
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        className="flex flex-col h-auto py-3 gap-1"
        onClick={handleClick}
        disabled={scanReceiptMutation.isPending}
      >
        {scanReceiptMutation.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
        <span className="text-xs">Scan Receipt</span>
      </Button>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, data: open ? confirmDialog.data : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Receipt Scan</DialogTitle>
          </DialogHeader>
          {confirmDialog.data && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={confirmDialog.data.amount}
                  onChange={(e) => setConfirmDialog({
                    ...confirmDialog,
                    data: { ...confirmDialog.data!, amount: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={confirmDialog.data.description}
                  onChange={(e) => setConfirmDialog({
                    ...confirmDialog,
                    data: { ...confirmDialog.data!, description: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={confirmDialog.data.category}
                  onChange={(e) => setConfirmDialog({
                    ...confirmDialog,
                    data: { ...confirmDialog.data!, category: e.target.value }
                  })}
                />
              </div>
              <Button onClick={handleConfirm} className="w-full" disabled={createExpense.isPending}>
                Add Expense
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
