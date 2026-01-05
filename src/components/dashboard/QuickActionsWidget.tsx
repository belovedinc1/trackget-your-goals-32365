import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { QuickExpenseTemplates } from "@/components/expenses/QuickExpenseTemplates";
import { VoiceExpenseInput } from "@/components/expenses/VoiceExpenseInput";
import { ReceiptCameraButton } from "@/components/expenses/ReceiptCameraButton";

export function QuickActionsWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Templates */}
        <QuickExpenseTemplates />
        
        {/* Voice and Camera Actions */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex flex-col items-center gap-1">
            <VoiceExpenseInput />
            <span className="text-xs text-muted-foreground">Voice</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ReceiptCameraButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
