import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setEmailNotifications(data.email_notifications);
      setPushNotifications(data.push_notifications);
      setReminderDays(data.reminder_days_before);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushNotifications(true);
        toast.success("Push notifications enabled!");
      } else {
        toast.error("Notification permission denied");
      }
    } else {
      toast.error("Browser doesn't support notifications");
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const preferences = {
        user_id: user.id,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        reminder_days_before: reminderDays,
      };

      const { error } = await supabase
        .from("user_preferences")
        .upsert(preferences, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Notification preferences saved!");
    } catch (error: any) {
      toast.error("Failed to save preferences: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>Configure how you want to receive payment reminders</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive payment reminders via email</p>
          </div>
          <Switch
            id="email"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push">Browser Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Get instant alerts in your browser</p>
          </div>
          <Switch
            id="push"
            checked={pushNotifications}
            onCheckedChange={(checked) => {
              if (checked && Notification.permission !== "granted") {
                requestNotificationPermission();
              } else {
                setPushNotifications(checked);
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminderDays">Reminder Days Before Due Date</Label>
          <Input
            id="reminderDays"
            type="number"
            min="1"
            max="30"
            value={reminderDays}
            onChange={(e) => setReminderDays(parseInt(e.target.value))}
          />
          <p className="text-sm text-muted-foreground">
            Get reminded {reminderDays} days before each payment is due
          </p>
        </div>

        <Button onClick={savePreferences} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
};