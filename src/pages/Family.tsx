import { Users, Plus, Link2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Family = () => {
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
          <Button variant="golden" size="lg" className="w-full rounded-xl h-12">
            <Plus className="h-4 w-4 mr-2" />
            Create Family Group
          </Button>
          <Button variant="outline" size="lg" className="w-full rounded-xl h-12">
            <Link2 className="h-4 w-4 mr-2" />
            Join with Invite Code
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
};

export default Family;
