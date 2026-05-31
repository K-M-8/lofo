import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/join-org")({
  component: JoinOrg,
});

type Organization = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  description: string | null;
  join_method: string;
};

function JoinOrg() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    // Check if user already has an org
   const checkProfile = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    navigate({ to: "/auth" });
    return;
  }
  // Don't redirect even if they have an org
  // They might want to switch orgs
};

    // Load approved organizations
   const loadOrgs = async () => {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, type, location, description, join_method")
      .eq("status", "approved")
      .order("name");
    
    console.log("Orgs data:", data, "Error:", error);
    
    if (data) setOrgs(data);
  } catch (err) {
    console.error("Failed to load orgs:", err);
  } finally {
    setLoading(false);
  }
};

    checkProfile();
    loadOrgs();
  }, []);

  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = async () => {
    if (!selectedOrg) return;
    setJoining(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      // Check invite code if required
      if (selectedOrg.join_method === "invite_code") {
        const { data: org } = await supabase
          .from("organizations")
          .select("invite_code")
          .eq("id", selectedOrg.id)
          .single();

        if (org?.invite_code !== inviteCode.trim()) {
          toast.error("Invalid invite code!");
          setJoining(false);
          return;
        }
      }

      // Join the org
      const { error } = await supabase
        .from("profiles")
        .update({
          org_id: selectedOrg.id,
          role: "member",
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success(`Welcome to ${selectedOrg.name}! 🎉`);
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "Could not join organization.");
    } finally {
      setJoining(false);
    }
  };

  const orgTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      university: "🎓",
      office: "🏢",
      society: "🏘️",
      airport: "✈️",
      other: "🏛️",
    };
    return icons[type] || "🏛️";
  };

  return (
    <section className="px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            LoFo / Join Organization
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
            Find your org.
          </h1>
          <p className="text-muted-foreground">
            Search for your college, office, or society and join to see items
            reported there.
          </p>
        </header>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary mb-8"
        />

        {/* Org List */}
        {loading ? (
          <div className="font-mono text-sm text-muted-foreground">
            Loading organizations...
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="border border-dashed border-border p-12 text-center mb-8">
            <p className="font-bold text-lg mb-2">No organizations found.</p>
            <p className="text-sm text-muted-foreground mb-6">
              Can't find yours? Register it!
            </p>
            <button
              onClick={() => navigate({ to: "/register-org" })}
              className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase text-sm"
            >
              Register Organization
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {filteredOrgs.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => setSelectedOrg(org)}
                className={
                  "w-full text-left p-4 border transition-all " +
                  (selectedOrg?.id === org.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-foreground/50")
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="mr-2">{orgTypeIcon(org.type)}</span>
                    <span className="font-bold">{org.name}</span>
                    {org.location && (
                      <span className="text-sm text-muted-foreground ml-2">
                        {org.location}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {org.join_method === "open" ? "Open" :
                     org.join_method === "invite_code" ? "Invite Only" :
                     org.join_method === "email_domain" ? "Email Domain" :
                     "Admin Approval"}
                  </span>
                </div>
                {org.description && (
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    {org.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Invite code input */}
        {selectedOrg?.join_method === "invite_code" && (
          <div className="mb-6">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Enter Invite Code
            </label>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary mt-2"
              placeholder="e.g. IITK2024"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {selectedOrg && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-tight hover:brightness-110 transition-all disabled:opacity-60"
            >
              {joining ? "Joining…" : `Join ${selectedOrg.name}`}
            </button>
          )}
          <button
            onClick={() => navigate({ to: "/register-org" })}
            className="px-8 py-4 font-bold uppercase tracking-tight border border-border hover:bg-foreground hover:text-background transition-colors"
          >
            Register New Org
          </button>
        </div>
      </div>
    </section>
  );
}