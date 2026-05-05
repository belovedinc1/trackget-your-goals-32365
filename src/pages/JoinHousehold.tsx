import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function JoinHousehold() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "joining" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(`/login?redirect=/join-household?token=${token}`);
    }
  }, [user, loading, token, navigate]);

  const accept = async () => {
    if (!token || !user) return;
    setStatus("joining");
    try {
      const { data: inv, error: invErr } = await (supabase as any)
        .from("household_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();
      if (invErr || !inv) throw new Error("Invitation not found or already used.");
      if (inv.invited_email.toLowerCase() !== (user.email || "").toLowerCase()) {
        throw new Error(`This invitation is for ${inv.invited_email}.`);
      }

      const { error: memErr } = await (supabase as any).from("household_members").insert({
        household_id: inv.household_id,
        user_id: user.id,
        role: inv.role,
      });
      if (memErr && !String(memErr.message).includes("duplicate")) throw memErr;

      await (supabase as any).from("household_invitations").update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      }).eq("id", inv.id);

      setStatus("done");
      toast({ title: "Joined household!" });
      setTimeout(() => navigate("/households"), 1200);
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message || "Failed to accept invitation.");
    }
  };

  if (loading || !user) return null;

  return (
    <div className="container py-16 max-w-md">
      <Card>
        <CardHeader><CardTitle>Join Household</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              <p className="text-sm text-muted-foreground">You've been invited to join a household. Accept to start sharing expenses.</p>
              <Button className="w-full" onClick={accept}>Accept Invitation</Button>
            </>
          )}
          {status === "joining" && <p>Joining…</p>}
          {status === "done" && <p className="text-emerald-600">Successfully joined! Redirecting…</p>}
          {status === "error" && <p className="text-destructive text-sm">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
