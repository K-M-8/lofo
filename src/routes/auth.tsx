import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created! Welcome to LoFo!");
        navigate({ to: "/join-org" });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            LoFo / {isLogin ? "Sign In" : "Create Account"}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
            {isLogin ? "Welcome back." : "Join LoFo."}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Sign in to report or claim items."
              : "Create an account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                Full Name
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
                placeholder="Your full name"
              />
            </div>
          )}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-primary-foreground font-bold uppercase tracking-tight hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </section>
  );
}