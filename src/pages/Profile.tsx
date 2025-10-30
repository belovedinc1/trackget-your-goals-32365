import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { Achievements } from "@/components/profile/Achievements";
import { format } from "date-fns";

const Profile = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({ full_name: fullName });
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">View your financial achievements and statistics</p>
      </div>

      {/* Profile Stats */}
      <ProfileStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {user?.email ? getInitials(user.email) : "US"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-1">
              <p className="font-medium">{fullName || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Separator />
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">
                  {profile?.created_at
                    ? format(new Date(profile.created_at), "MMM yyyy")
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Achievements />
    </div>
  );
};

export default Profile;
