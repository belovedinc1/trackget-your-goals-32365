import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type HouseholdRole = "owner" | "editor" | "viewer";

export interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  joined_at: string;
}

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  invited_email: string;
  role: HouseholdRole;
  status: string;
  token: string;
  created_at: string;
}

export function useHouseholds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["households", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Household[];
    },
  });
}

export function useHouseholdMembers(householdId?: string) {
  return useQuery({
    queryKey: ["household_members", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("household_members")
        .select("*")
        .eq("household_id", householdId!);
      if (error) throw error;
      return data as HouseholdMember[];
    },
  });
}

export function useHouseholdInvitations(householdId?: string) {
  return useQuery({
    queryKey: ["household_invitations", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("household_invitations")
        .select("*")
        .eq("household_id", householdId!)
        .eq("status", "pending");
      if (error) throw error;
      return data as HouseholdInvitation[];
    },
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("households")
        .insert({ name, owner_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["households"] });
      toast({ title: "Household created" });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { householdId: string; email: string; role: HouseholdRole }) => {
      const { error } = await supabase.from("household_invitations").insert({
        household_id: input.householdId,
        invited_email: input.email.toLowerCase(),
        invited_by: user!.id,
        role: input.role,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["household_invitations", vars.householdId] });
      toast({ title: "Invitation created", description: "Share the invite link with them." });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("household_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["household_members"] });
      toast({ title: "Member removed" });
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: HouseholdRole }) => {
      const { error } = await supabase.from("household_members").update({ role }).eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["household_members"] });
      toast({ title: "Role updated" });
    },
  });
}

export function useDeleteHousehold() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("households").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["households"] });
      toast({ title: "Household deleted" });
    },
  });
}
