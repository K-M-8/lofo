import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useItems } from "@/lib/items-store";
import { ItemCard } from "@/components/site/ItemCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LoFo — Lost & Found Platform" },
      {
        name: "description",
        content: "A universal lost & found platform for colleges, offices, and societies.",
      },
      { property: "og:title", content: "LoFo — Lost & Found Platform" },
      {
        property: "og:description",
        content: "Reuniting people with their lost items.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { items, isLoading } = useItems();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id, role, organizations(name, type)")
          .eq("id", session.user.id)
          .single();

        setOrgName((profile?.organizations as any)?.name ?? null);
        setOrgType((profile?.organizations as any)?.type ?? null);
      }
      setProfileLoading(false);
    };
    loadProfile();
  }, []);

  const recovered = items.filter((i) => i.status === "recovered").length;
  const active = items.filter((i) => i.status === "open").length;
  const thisWeek = items.filter((i) => {
    const date = new Date(i.date_lost_found);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;

  const preview = items.slice(0, 3);

  const orgTypeIcon = (type: string | null) => {
    const icons: Record<string, string> = {
      university: "🎓",
      office: "🏢",
      society: "🏘️",
      airport: "✈️",
      other: "🏛️",
    };
    return type ? icons[type] || "🏛️" : "📍";
  };

  return (
    <>
      <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-end">
          <div className="animate-reveal">
            {!profileLoading && (
              <div className="mb-6">
                {orgName ? (
                  <div className="inline-flex items-center gap-2 border border-border px-3 py-1.5">
                    <span>{orgTypeIcon(orgType)}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {orgName}
                    </span>
                  </div>
                ) : user ? (
                  <button
                    onClick={() => navigate({ to: "/join-org" })}
                    className="inline-flex items-center gap-2 border border-yellow-500/50 px-3 py-1.5 text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest">
                      ⚠️ Join an organization to get started →
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate({ to: "/landing" })}
                    className="inline-flex items-center gap-2 border border-primary/50 px-3 py-1.5 text-primary hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest">
                      Sign in to get started →
                    </span>
                  </button>
                )}
              </div>
            )}

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] text-balance mb-8">
              {orgName ? (
                <>
                  {orgName.split(" ")[0]} <br />
                  <span className="text-primary">
                    {orgName.split(" ").slice(1).join(" ") || "L&F"}
                  </span>
                </>
              ) : (
                <>
                  The <br />
                  <span className="text-primary">Archive.</span>
                </>
              )}
            </h1>

            <p className="max-w-[45ch] text-lg text-muted-foreground text-pretty leading-relaxed mb-10">
              {orgName
                ? `Lost & found platform for ${orgName}. Report missing items, post what you've found, and get reunited fast.`
                : "A universal lost & found platform for colleges, offices, and societies. Sign in to get started."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/report"
                search={{ status: "lost" } as never}
                className="bg-primary text-primary-foreground px-8 py-4 font-bold tracking-tight hover:brightness-110 transition-all flex items-center gap-4"
              >
                REPORT LOST ITEM
                <span className="font-mono text-xs opacity-60">[L]</span>
              </Link>
              <Link
                to="/report"
                search={{ status: "found" } as never}
                className="bg-foreground text-background px-8 py-4 font-bold tracking-tight hover:opacity-90 transition-all flex items-center gap-4"
              >
                POST FOUND ITEM
                <span className="font-mono text-xs opacity-60">[F]</span>
              </Link>
            </div>
          </div>

          <div className="animate-reveal [animation-delay:150ms] border-l border-border pl-8">
            <div className="space-y-6">
              <Stat label="Total Recovered" value={String(recovered || 0)} />
              <Stat label="Active Listings" value={String(active)} />
              <Stat label="Posted This Week" value={String(thisWeek)} />
              <Stat
                label="Recovery Rate"
                value={
                  items.length > 0
                    ? `${Math.round((recovered / items.length) * 100)}%`
                    : "0%"
                }
              />
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Latest Listings
              {orgName && (
                <span className="text-muted-foreground font-normal text-lg ml-2">
                  — {orgName}
                </span>
              )}
            </h2>
            <Link
              to="/browse"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Browse all →
            </Link>
          </div>

          {isLoading ? (
            <div className="font-mono text-sm text-muted-foreground">
              Loading listings...
            </div>
          ) : preview.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center">
              <p className="font-bold text-lg mb-2">No listings yet.</p>
              <p className="text-sm text-muted-foreground mb-6">
                Be the first to report a lost or found item!
              </p>
              <Link
                to="/report"
                search={{ status: "lost" } as never}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase text-sm"
              >
                Report First Item
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {preview.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-end border-b border-border pb-2">
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span className="text-4xl font-extrabold tabular-nums tracking-tighter">
        {value}
      </span>
    </div>
  );
}