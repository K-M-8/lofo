import { Link, useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/landing")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    orgs: 0,
    items: 0,
    recovered: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const initializeLanding = async () => {
      try {
        // 1. Get the current session quietly ONCE without a live loop listener
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (session?.user) {
           setUser(session.user);
         }

        // 2. Fetch stats independently
        const [{ count: orgs }, { count: items }, { count: recovered }] =
          await Promise.all([
            supabase
              .from("organizations")
              .select("*", { count: "exact", head: true })
              .eq("status", "approved"),

            supabase
              .from("items")
              .select("*", { count: "exact", head: true }),

            supabase
              .from("items")
              .select("*", { count: "exact", head: true })
              .eq("status", "recovered"),
          ]);

        if (isMounted) {
          setStats({
            orgs: orgs ?? 0,
            items: items ?? 0,
            recovered: recovered ?? 0,
          });
        }
      } catch (error) {
        console.error("Error during landing initialization:", error);
      }
    };

    initializeLanding();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const recoveryRate = stats.items > 0
    ? Math.round((stats.recovered / stats.items) * 100)
    : 0;

  return (
    <div style={{ background: "#ffffff", color: "#111111", minHeight: "100vh", fontFamily: "inherit" }}>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ede9fe", padding: "0 1.5rem",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, border: "2.5px solid white", transform: "rotate(45deg)" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em", color: "#7C3AED" }}>LoFo</span>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["How it works", "For organizations", "Features"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                style={{ fontSize: 14, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>
                {l}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {user ? (
              <button onClick={() => navigate({ to: "/" })}
                style={{ padding: "8px 20px", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/auth" style={{ fontSize: 14, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>
                  Sign In
                </Link>
                <Link to="/register-org" style={{
                  padding: "8px 20px", background: "#7C3AED", color: "#fff",
                  borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none"
                }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#F5F3FF", border: "1px solid #DDD6FE",
              padding: "6px 14px", borderRadius: 100, marginBottom: 24
            }}>
              <div style={{ width: 8, height: 8, background: "#7C3AED", borderRadius: "50%" }} />
              <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600, letterSpacing: "0.05em" }}>
                TRUSTED BY COLLEGES, OFFICES & SOCIETIES
              </span>
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 24, color: "#111" }}>
              The smarter way to{" "}
              <span style={{ color: "#7C3AED" }}>recover</span>{" "}
              what's lost.
            </h1>
            <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              LoFo is a universal lost & found platform built for organizations.
              Report items, claim with proof, and reunite people with their belongings — fast.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/register-org" style={{
                padding: "14px 28px", background: "#7C3AED", color: "#fff",
                borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8
              }}>
                Register Your Organization →
              </Link>
              <Link to="/auth" style={{
                padding: "14px 28px", background: "#F5F3FF", color: "#7C3AED",
                borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
                border: "1.5px solid #DDD6FE"
              }}>
                Sign In
              </Link>
            </div>
          </div>

          {/* Mockup Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
            <div style={{
              background: "#fff", border: "1px solid #ede9fe", borderRadius: 16,
              padding: 20, boxShadow: "0 20px 60px rgba(124,58,237,0.1)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ background: "#FEE2E2", color: "#DC2626", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>LOST</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>2 hours ago</span>
              </div>
              <div style={{ background: "#F5F3FF", borderRadius: 10, height: 120, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 40 }}>🎒</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Blue Backpack</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span style={{ background: "#F5F3FF", color: "#7C3AED", fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600 }}>Library</span>
                <span style={{ background: "#F5F3FF", color: "#7C3AED", fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600 }}>Accessories</span>
              </div>
              <button style={{ width: "100%", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                🔐 Claim This Item
              </button>
            </div>

            <div style={{
              background: "#fff", border: "1px solid #d1fae5", borderRadius: 16,
              padding: 20, boxShadow: "0 20px 60px rgba(16,185,129,0.08)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ background: "#D1FAE5", color: "#059669", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>FOUND</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>1 day ago</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>MacBook Charger</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Found near cafeteria entrance. White USB-C charger.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, background: "#D1FAE5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✅</div>
                <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Awaiting claim</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: "#7C3AED", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[
            { value: stats.orgs.toString(), label: "Organizations" },
            { value: stats.items.toString(), label: "Items Reported" },
            { value: stats.recovered.toString(), label: "Items Recovered" },
            { value: `${recoveryRate}%`, label: "Recovery Rate" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#DDD6FE", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: "#7C3AED", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "#111" }}>Three steps to recovery.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { step: "01", icon: "📋", title: "Report It", desc: "Post a lost or found item with a photo, description and location. Set a secret question to protect against false claims." },
              { step: "02", icon: "🔐", title: "Claim It", desc: "Browse your organization's items. Answer the secret question to prove ownership and submit your claim instantly." },
              { step: "03", icon: "✅", title: "Recover It", desc: "Connect with the finder and arrange a handover. Or pick it up from the L&F desk using your digital token." },
            ].map((s) => (
              <div key={s.step} style={{
                background: "#F5F3FF", borderRadius: 16, padding: 32,
                border: "1px solid #EDE9FE"
              }}>
                <div style={{ fontSize: 12, color: "#A78BFA", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>{s.step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 12 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="for-organizations" style={{ padding: "80px 24px", background: "#FAFAF9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: "#7C3AED", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>FOR ORGANIZATIONS</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "#111" }}>Built for every organization.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { icon: "🎓", label: "Universities & Colleges", desc: "Campus-wide lost & found for students and staff." },
              { icon: "🏢", label: "Offices & Workplaces", desc: "Track items across floors and departments easily." },
              { icon: "🏘️", label: "Housing Societies", desc: "Help residents recover lost belongings quickly." },
              { icon: "✈️", label: "Airports & Hubs", desc: "High volume item management for busy spaces." },
            ].map((o) => (
              <div key={o.label} style={{
                background: "#fff", borderRadius: 16, padding: 28,
                border: "1px solid #EDE9FE", textAlign: "center"
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{o.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 8 }}>{o.label}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{o.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: "#7C3AED", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>FEATURES</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "#111" }}>Everything you need.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { icon: "🔐", title: "Claim Protection", desc: "Secret question system prevents false claims. Only the real owner can answer correctly." },
              { icon: "📸", title: "Photo Uploads", desc: "Attach photos to items for faster and more accurate identification." },
              { icon: "🏢", title: "Department Desk Mode", desc: "Staff can log items at the L&F desk. Owners collect with a digital pickup token." },
              { icon: "🔒", title: "Org-Only Visibility", desc: "Items are only visible to your organization's members. Complete privacy." },
              { icon: "⚡", title: "Instant Reports", desc: "Report a lost or found item in under 60 seconds. No paperwork needed." },
              { icon: "📱", title: "Mobile Friendly", desc: "Works perfectly on any device. Mobile app coming soon." },
            ].map((f) => (
              <div key={f.title} style={{
                background: "#F5F3FF", borderRadius: 16, padding: 28,
                border: "1px solid #EDE9FE", display: "flex", gap: 16
              }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: "80px 24px", background: "#7C3AED" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>
            Ready to set up LoFo?
          </h2>
          <p style={{ fontSize: 18, color: "#DDD6FE", marginBottom: 36, lineHeight: 1.6 }}>
            Register your organization for free. Setup takes less than 2 minutes.
            No credit card required.
          </p>
          <Link to="/register-org" style={{
            display: "inline-block", padding: "16px 36px",
            background: "#fff", color: "#7C3AED",
            borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none"
          }}>
            Register Your Organization — It's Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, border: "2px solid white", transform: "rotate(45deg)" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>LoFo</span>
          </div>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Universal Lost & Found Platform</span>
          <div style={{ display: "flex", gap: 24 }}>
            <Link to="/auth" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Sign In</Link>
            <Link to="/register-org" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Register Org</Link>
            <Link to="/join-org" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Join Org</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}