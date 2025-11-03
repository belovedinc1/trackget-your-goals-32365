import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { BudgetSettings } from "@/components/settings/BudgetSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { useToast } from "@/hooks/use-toast";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { useEMI } from "@/hooks/useEMI";
import { CURRENCY_SYMBOLS, CURRENCY_NAMES } from "@/hooks/useCurrency";
import Papa from "papaparse";
import { format } from "date-fns";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: preferences } = useUserPreferences();
  const { data: profile } = useProfile();
  const updatePreferences = useUpdateUserPreferences();
  const updateProfile = useUpdateProfile();
  const { data: transactions } = useExpenses({});
  const { goals } = useSavings();
  const { loans } = useEMI();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [currency, setCurrency] = useState("USD");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.email_notifications);
      setPushNotifications(preferences.push_notifications);
      setReminderDays(preferences.reminder_days_before);
      setCurrency(preferences.default_currency || "USD");
    }
  }, [preferences]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSaveNotifications = () => {
    updatePreferences.mutate({
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      reminder_days_before: reminderDays,
      default_currency: currency,
    });
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({
      full_name: fullName,
    });
  };

  const handleExportData = () => {
    if (!transactions || !goals || !loans) {
      toast({
        title: "Export failed",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV data
    const csvData = [];
    
    // Add transactions
    csvData.push(["Transactions"]);
    csvData.push(["Date", "Type", "Category", "Description", "Amount"]);
    transactions.forEach((t) => {
      csvData.push([
        t.expense_date,
        t.type || "expense",
        t.category,
        t.description || "",
        t.amount.toString(),
      ]);
    });
    
    csvData.push([]);
    
    // Add savings goals
    csvData.push(["Savings Goals"]);
    csvData.push(["Title", "Current Amount", "Target Amount", "Deadline"]);
    goals.forEach((g) => {
      csvData.push([
        g.title,
        g.current_amount.toString(),
        g.target_amount.toString(),
        g.deadline || "",
      ]);
    });
    
    csvData.push([]);
    
    // Add loans
    csvData.push(["Loans"]);
    csvData.push(["Lender", "Loan Amount", "EMI Amount", "Outstanding", "Status"]);
    loans.forEach((l) => {
      csvData.push([
        l.lender_name,
        l.loan_amount.toString(),
        l.emi_amount.toString(),
        l.outstanding_amount.toString(),
        l.status,
      ]);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `trackget-data-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Data exported",
      description: "Your data has been exported successfully",
    });
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <Button onClick={handleSaveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email updates about your finances</p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get push notifications for important alerts</p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="reminder-days">EMI Reminder Days</Label>
            <Input
              id="reminder-days"
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(parseInt(e.target.value) || 3)}
              min="1"
              max="30"
            />
            <p className="text-xs text-muted-foreground">
              Get notified this many days before EMI due dates
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                  <SelectItem key={code} value={code}>
                    {symbol} - {CURRENCY_NAMES[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This currency will be used throughout the app
            </p>
          </div>
          <Button onClick={handleSaveNotifications}>Save Settings</Button>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <BudgetSettings />

      {/* Security Settings */}
      <SecuritySettings />

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={handleExportData} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export My Data
          </Button>
          <p className="text-xs text-muted-foreground">
            Download all your financial data in CSV format
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
