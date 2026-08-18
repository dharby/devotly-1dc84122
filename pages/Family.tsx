import { useState } from "react";
import { Users, Plus, Link2, Heart, Copy, Check, LogOut, Share2, BookOpen, Crown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useFamily } from "@/hooks/useFamily";
import { useDevotionals } from "@/hooks/useDevotionals";
import { useTracker } from "@/hooks/useTracker";
import { useAuth } from "@/hooks/useAuth";

const Family = () => {
  const { user } = useAuth();
  const { family, members, sharedDevotionals, loading, createFamily, joinFamily, leaveFamily, shareDevotional } = useFamily();
  const { devotionals } = useDevotionals();
  const { streak } = useTracker();
  const [view, setView] = useState<"home" | "create" | "join">("home");
  const [familyName, setFamilyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSharePicker, setShowSharePicker] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!familyName.trim() || !displayName.trim()) return;
    setSubmitting(true);
    const result = await createFamily(familyName.trim(), displayName.trim());
    setSubmitting(false);
    if (result) {
      toast.success("Family group created!");
      setView("home");
    } else {
      toast.error("Failed to create family group");
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !displayName.trim()) return;
    setSubmitting(true);
    const { error } = await joinFamily(inviteCode.trim(), displayName.trim());
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Joined family group!");
      setView("home");
    }
  };

  const handleCopyCode = () => {
    if (!family) return;
    navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this family group?")) return;
    await leaveFamily();
    toast.success("Left family group");
  };

  const handleShare = async (devotionalId: string) => {
    await shareDevotional(devotionalId);
    setShowSharePicker(false);
    toast.success("Devotional shared with family!");
  };

  // Not in a family — show create/join
  if (!family) {
    if (view === "create") {
      return (
        <div className="min-h-screen pb-24">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
            <h1 className="font-display text-lg font-semibold">Create Family Group</h1>
          </div>
          <div className="px-6 pt-6 max-w-sm mx-auto space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Family Name</label>
              <Input placeholder="e.g. The Johnsons" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Display Name</label>
              <Input placeholder="e.g. Dad, Mom, John" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button variant="golden" className="w-full rounded-xl" onClick={handleCreate} disabled={!familyName.trim() || !displayName.trim() || submitting}>
              {submitting ? "Creating..." : "Create Group"}
            </Button>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setView("home")}>Cancel</Button>
          </div>
        </div>
      );
    }

    if (view === "join") {
      return (
        <div className="min-h-screen pb-24">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
            <h1 className="font-display text-lg font-semibold">Join Family Group</h1>
          </div>
          <div className="px-6 pt-6 max-w-sm mx-auto space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Invite Code</label>
              <Input placeholder="Enter 8-character code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} maxLength={8} className="font-mono tracking-widest text-center text-lg" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Display Name</label>
              <Input placeholder="e.g. Dad, Mom, John" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button variant="golden" className="w-full rounded-xl" onClick={handleJoin} disabled={!inviteCode.trim() || !displayName.trim() || submitting}>
              {submitting ? "Joining..." : "Join Group"}
            </Button>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setView("home")}>Cancel</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pb-24">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
          <h1 className="font-display text-lg font-semibold">Family</h1>
        </div>
        <div className="px-6 pt-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent mb-5">
            <Users className="h-9 w-9 text-accent-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Family Devotions</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
            Create or join a family group to share devotionals and track your spiritual journey together.
          </p>
          <div className="space-y-3 max-w-sm mx-auto">
            <Button variant="golden" size="lg" className="w-full rounded-xl h-12" onClick={() => setView("create")}>
              <Plus className="h-4 w-4 mr-2" /> Create Family Group
            </Button>
            <Button variant="outline" size="lg" className="w-full rounded-xl h-12" onClick={() => setView("join")}>
              <Link2 className="h-4 w-4 mr-2" /> Join with Invite Code
            </Button>
          </div>
          <div className="mt-12 bg-card rounded-2xl border border-border p-6 text-left max-w-sm mx-auto">
            <Heart className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-display font-semibold mb-2">What you can do together</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Share daily devotionals with family members</li>
              <li>• Track group devotional streaks</li>
              <li>• Generate family-focused devotionals</li>
              <li>• Encourage one another in faith</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // In a family — show dashboard
  const isOwner = family.createdBy === user?.id;

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold">{family.name}</h1>
          <Button variant="soft" size="sm" className="rounded-lg" onClick={() => setShowSharePicker(true)}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </div>

      <div className="px-6 pt-6 animate-fade-in">
        {/* Invite Code Banner */}
        <div className="bg-gradient-golden rounded-2xl p-5 shadow-golden mb-6">
          <p className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider mb-1">Invite Code</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-2xl font-bold text-primary-foreground tracking-widest">{family.inviteCode}</p>
            <button onClick={handleCopyCode} className="text-primary-foreground/80 hover:text-primary-foreground">
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-primary-foreground/70 mt-1">Share this code with your family</p>
        </div>

        {/* Members */}
        <div className="mb-6">
          <h2 className="font-display text-base font-semibold mb-3">Members ({members.length})</h2>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  {m.role === "owner" ? <Crown className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-sm">{m.displayName || "Member"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                </div>
                {m.userId === user?.id && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">You</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shared Devotionals */}
        <div className="mb-6">
          <h2 className="font-display text-base font-semibold mb-3">Shared Devotionals</h2>
          {sharedDevotionals.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No shared devotionals yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Share a devotional to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedDevotionals.map((sd) => (
                <div key={sd.id} className="bg-card rounded-xl p-4 border border-border">
                  <p className="font-display font-semibold text-sm">{sd.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sd.scriptureReference} · {sd.topic}</p>
                  {sd.message && <p className="text-xs text-foreground/80 mt-2 italic">"{sd.message}"</p>}
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(sd.sharedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Group */}
        <Button variant="outline" className="w-full rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleLeave}>
          <LogOut className="h-4 w-4 mr-2" /> Leave Family Group
        </Button>
      </div>

      {/* Share Picker Modal */}
      {showSharePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowSharePicker(false)}>
          <div className="bg-card border-t border-border rounded-t-2xl w-full max-w-md p-6 animate-fade-in max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold mb-4">Share a Devotional</h3>
            {devotionals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No devotionals to share yet.</p>
            ) : (
              <div className="space-y-2">
                {devotionals.slice(0, 10).map((d) => (
                  <button key={d.id} onClick={() => handleShare(d.id)} className="w-full text-left bg-muted rounded-xl p-3 hover:bg-accent transition-colors">
                    <p className="font-display font-semibold text-sm">{d.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.scriptureReference} · {d.topic}</p>
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4 rounded-xl" onClick={() => setShowSharePicker(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Family;
