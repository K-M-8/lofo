import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  const links = user
? [
  { to: "/dashboard", label: "Home" },
  { to: "/browse", label: "Browse All" },
  { to: "/report", label: "Report Item" },
]
: [
  { to: "/", label: "Home" }, //home should go to marketing when logged out
  { to: "/browse", label: "Browse All" }
];



  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id, organizations(name)")
          .eq("id", session.user.id)
          .single();
        setOrgName((profile?.organizations as any)?.name ?? null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id, organizations(name)")
          .eq("id", session.user.id)
          .single();
        setOrgName((profile?.organizations as any)?.name ?? null);
      } else {
        setOrgName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

 const handleLogout = async () => {
  try {
  await supabase.auth.signOut();
  } catch(error) {
    console.error("Sign out error (continuing anyway):",error);
  }
  toast.success("Logged out successfully!");
  window.location.href = "/";
};

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="size-8 bg-foreground flex items-center justify-center">
            <div className="size-3 border-2 border-background rotate-45 group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span className="font-mono font-bold tracking-tighter text-xl">LoFo</span>
        </Link>

        {/* Nav Links */}
        <div className="flex gap-6 sm:gap-8 text-sm font-medium">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  "transition-colors hover:text-primary " +
                  (active ? "text-primary" : "text-foreground")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {user.email}
                </span>
                {orgName ? (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                    {orgName}
                  </span>
                ) : (
                  <Link
                    to="/join-org"
                    className="font-mono text-[10px] uppercase tracking-widest text-yellow-500 hover:text-yellow-400"
                  >
                    Join an org →
                  </Link>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 font-bold text-sm uppercase tracking-tight border border-border hover:bg-foreground hover:text-background transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 font-bold text-sm uppercase tracking-tight bg-primary text-primary-foreground hover:brightness-110 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}