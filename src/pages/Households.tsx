import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Mail, Copy } from "lucide-react";
import {
  useHouseholds,
  useCreateHousehold,
  useDeleteHousehold,
  useHouseholdMembers,
  useHouseholdInvitations,
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
  type HouseholdRole,
} from "@/hooks/useHouseholds";
import { useToast } from "@/hooks/use-toast";

export default function Households() {
  const { data: households = [] } = useHouseholds();
  const create = useCreateHousehold();
  const del = useDeleteHousehold();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Family & Shared Budgets</h1>
          <p className="text-muted-foreground">Share expenses with family or roommates with role-based access.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Household</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Household</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="The Smith Family" />
            </div>
            <DialogFooter>
              <Button onClick={async () => { if (!name) return; await create.mutateAsync(name); setName(""); setOpen(false); }}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {households.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          No households yet. Create one to start sharing expenses.
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {households.map((h) => (
            <Card key={h.id} className={`cursor-pointer transition-colors ${selectedId === h.id ? "border-primary" : ""}`} onClick={() => setSelectedId(h.id)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> {h.name}</CardTitle>
                  <CardDescription>Created {new Date(h.created_at).toLocaleDateString()}</CardDescription>
                </div>
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this household?")) del.mutate(h.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {selectedId && <HouseholdDetail householdId={selectedId} />}
    </div>
  );
}

function HouseholdDetail({ householdId }: { householdId: string }) {
  const { data: members = [] } = useHouseholdMembers(householdId);
  const { data: invitations = [] } = useHouseholdInvitations(householdId);
  const invite = useInviteMember();
  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<HouseholdRole>("viewer");

  const inviteLink = (token: string) => `${window.location.origin}/join-household?token=${token}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members & Invitations</CardTitle>
        <CardDescription>Owners can manage roles and invitations. Editors can add/edit shared expenses. Viewers are read-only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Invite a member</h3>
          <div className="flex gap-2 flex-wrap">
            <Input className="flex-1 min-w-[200px]" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onValueChange={(v) => setRole(v as HouseholdRole)}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={async () => {
              if (!email) return;
              await invite.mutateAsync({ householdId, email, role });
              setEmail("");
            }}><Mail className="mr-2 h-4 w-4" /> Invite</Button>
          </div>
        </div>

        {invitations.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Pending invitations</h3>
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">{inv.invited_email}</div>
                  <Badge variant="outline" className="text-xs">{inv.role}</Badge>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(inviteLink(inv.token));
                  toast({ title: "Invite link copied" });
                }}><Copy className="h-3 w-3 mr-1" /> Copy link</Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Members ({members.length})</h3>
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="text-sm font-mono">{m.user_id.slice(0, 8)}…</div>
              <div className="flex items-center gap-2">
                <Select value={m.role} onValueChange={(v) => updateRole.mutate({ memberId: m.id, role: v as HouseholdRole })}>
                  <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" onClick={() => removeMember.mutate(m.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
