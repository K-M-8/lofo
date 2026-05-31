import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register-org")({
  component: RegisterOrg,
});

const ORG_TYPES = [
  { value: "university", label: "🎓 University / College" },
  { value: "office", label: "🏢 Office / Workplace" },
  { value: "society", label: "🏘️ Residential Society" },
  { value: "airport", label: "✈️ Airport / Transport Hub" },
  { value: "other", label: "🏛️ Other" },
];

const JOIN_METHODS = [
  { value: "open", label: "Open — Anyone can join" },
  { value: "email_domain", label: "Email Domain — Only org emails allowed" },
  { value: "admin_approval", label: "Admin Approval — You approve each member" },
  { value: "invite_code", label: "Invite Code — Members join with a code" },
];

function RegisterOrg() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState(ORG_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [joinMethod, setJoinMethod] = useState(JOIN_METHODS[0].value);
  const [emailDomain, setEmailDomain] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in first!");
        navigate({ to: "/auth" });
        return;
      }

      // Create the organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: name.trim(),
          type,
          description: description.trim() || null,
          location: location.trim() || null,
          join_method: joinMethod,
          email_domain: joinMethod === "email_domain" ? emailDomain.trim() : null,
          invite_code: joinMethod === "invite_code" ? inviteCode.trim() : null,
          status: "pending",
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Make the creator the org admin
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          org_id: org.id,
          role: "org_admin",
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      toast.success("Organization registered! Waiting for approval.");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "Could not register organization.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            LoFo / Register Organization
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
            Register your org.
          </h1>
          <p className="text-muted-foreground">
            Set up LoFo for your college, office, or society. 
            Your registration will be reviewed and approved shortly.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Org Name */}
          <Field label="Organization Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
              placeholder="e.g. IIT Kanpur, TCS Noida Office"
            />
          </Field>

          {/* Org Type */}
          <Field label="Organization Type">
            <div className="grid grid-cols-2 gap-3 mt-2">
              {ORG_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={
                    "py-3 px-4 text-sm font-medium border transition-all text-left " +
                    (type === t.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-foreground/50")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Location */}
          <Field label="Location" hint="City, State">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
              placeholder="e.g. Kanpur, Uttar Pradesh"
            />
          </Field>

          {/* Description */}
          <Field label="Description" hint="Optional">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-primary resize-none"
              placeholder="Brief description of your organization"
            />
          </Field>

          {/* Join Method */}
          <Field label="How do members join?">
            <div className="space-y-2 mt-2">
              {JOIN_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setJoinMethod(m.value)}
                  className={
                    "w-full py-3 px-4 text-sm font-medium border transition-all text-left " +
                    (joinMethod === m.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-foreground/50")
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Email domain input */}
          {joinMethod === "email_domain" && (
            <Field label="Email Domain" hint="e.g. iitk.ac.in">
              <input
                required
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
                placeholder="yourdomain.com"
              />
            </Field>
          )}

          {/* Invite code input */}
          {joinMethod === "invite_code" && (
            <Field label="Invite Code" hint="Members will use this to join">
              <input
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
                placeholder="e.g. IITK2024"
              />
            </Field>
          )}

          {/* Submit */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-tight hover:brightness-110 transition-all disabled:opacity-60"
            >
              {loading ? "Registering…" : "Register Organization"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="px-8 py-4 font-bold uppercase tracking-tight border border-border hover:bg-foreground hover:text-background transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[10px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}