import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  role: "owner" | "member";
  displayName: string;
  joinedAt: string;
}

export interface SharedDevotional {
  id: string;
  devotionalId: string;
  sharedBy: string;
  sharedByName: string;
  message: string | null;
  sharedAt: string;
  title: string;
  topic: string;
  scriptureReference: string;
}

export function useFamily() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [sharedDevotionals, setSharedDevotionals] = useState<SharedDevotional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFamily = useCallback(async () => {
    if (!user) { setFamily(null); setMembers([]); setLoading(false); return; }

    // Get user's family membership
    const { data: membership } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      setFamily(null);
      setMembers([]);
      setSharedDevotionals([]);
      setLoading(false);
      return;
    }

    // Get family details
    const { data: familyData } = await supabase
      .from("families")
      .select("*")
      .eq("id", membership.family_id)
      .single();

    if (familyData) {
      setFamily({
        id: familyData.id,
        name: familyData.name,
        inviteCode: familyData.invite_code,
        createdBy: familyData.created_by,
        createdAt: familyData.created_at,
      });
    }

    // Get members
    const { data: membersData } = await supabase
      .from("family_members")
      .select("*")
      .eq("family_id", membership.family_id)
      .order("joined_at", { ascending: true });

    if (membersData) {
      setMembers(membersData.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        role: m.role,
        displayName: m.display_name,
        joinedAt: m.joined_at,
      })));
    }

    // Get shared devotionals
    const { data: sharedData } = await supabase
      .from("family_devotionals")
      .select("*, devotionals(title, topic, scripture_reference)")
      .eq("family_id", membership.family_id)
      .order("shared_at", { ascending: false })
      .limit(20);

    if (sharedData) {
      setSharedDevotionals(sharedData.map((s: any) => ({
        id: s.id,
        devotionalId: s.devotional_id,
        sharedBy: s.shared_by,
        sharedByName: "",
        message: s.message,
        sharedAt: s.shared_at,
        title: s.devotionals?.title || "Devotional",
        topic: s.devotionals?.topic || "",
        scriptureReference: s.devotionals?.scripture_reference || "",
      })));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFamily(); }, [fetchFamily]);

  const createFamily = useCallback(async (name: string, displayName: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("families")
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (error || !data) return null;

    // Add creator as owner
    await supabase.from("family_members").insert({
      family_id: data.id,
      user_id: user.id,
      role: "owner",
      display_name: displayName,
    });

    await fetchFamily();
    return data;
  }, [user, fetchFamily]);

  const joinFamily = useCallback(async (inviteCode: string, displayName: string) => {
    if (!user) return { error: "Not authenticated" };

    const { data: familyData } = await supabase
      .from("families")
      .select("id")
      .eq("invite_code", inviteCode.trim().toLowerCase())
      .maybeSingle();

    if (!familyData) return { error: "Invalid invite code" };

    const { error } = await supabase.from("family_members").insert({
      family_id: familyData.id,
      user_id: user.id,
      role: "member",
      display_name: displayName,
    });

    if (error) {
      if (error.code === "23505") return { error: "You're already in this family" };
      return { error: error.message };
    }

    await fetchFamily();
    return { error: null };
  }, [user, fetchFamily]);

  const leaveFamily = useCallback(async () => {
    if (!user || !family) return;
    await supabase.from("family_members").delete()
      .eq("family_id", family.id)
      .eq("user_id", user.id);

    // If owner and last member, delete family
    if (family.createdBy === user.id) {
      const { data: remaining } = await supabase
        .from("family_members")
        .select("id")
        .eq("family_id", family.id)
        .limit(1);
      if (!remaining?.length) {
        await supabase.from("families").delete().eq("id", family.id);
      }
    }

    setFamily(null);
    setMembers([]);
    setSharedDevotionals([]);
  }, [user, family]);

  const shareDevotional = useCallback(async (devotionalId: string, message?: string) => {
    if (!user || !family) return;
    await supabase.from("family_devotionals").insert({
      family_id: family.id,
      devotional_id: devotionalId,
      shared_by: user.id,
      message: message || null,
    });
    await fetchFamily();
  }, [user, family, fetchFamily]);

  return {
    family,
    members,
    sharedDevotionals,
    loading,
    createFamily,
    joinFamily,
    leaveFamily,
    shareDevotional,
    refetch: fetchFamily,
  };
}
