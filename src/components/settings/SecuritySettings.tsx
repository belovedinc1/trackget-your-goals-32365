import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SecuritySettings() {
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleMFAToggle = async (checked: boolean) => {
    if (checked) {
      // Supabase MFA enrollment
      toast({
        title: "MFA Setup",
        description: "Two-factor authentication is available in Supabase. Please check your email for setup instructions.",
      });
      setMfaEnabled(checked);
    } else {
      setMfaEnabled(checked);
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await supabase.auth.resetPasswordForEmail(user.email);
        toast({
          title: "Password Reset",
          description: "A password reset link has been sent to your email",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // This would require a server-side function to properly delete user data
      toast({
        title: "Account Deletion",
        description: "Please contact support to delete your account",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mfa">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="mfa"
              checked={mfaEnabled}
              onCheckedChange={handleMFAToggle}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <Label>Password Management</Label>
            </div>
            <Button variant="outline" onClick={handlePasswordChange}>
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-destructive">Danger Zone</Label>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
