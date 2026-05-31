import type { Item } from "@/lib/items-store";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function formatDate(iso: string) {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
}

export function ItemCard({ item }: { item: Item }) {
  const isLost = item.type === "lost";
  const [claiming, setClaiming] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleClaim = async () => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to claim an item.");
      return;
    }
    setShowClaim(true);
  };

  const submitClaim = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer.");
      return;
    }
    setClaiming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You are not logged in!");
        return;
      }

      console.log("User ID:", session.user.id);
      console.log("Item ID:", item.id);

      const { data, error } = await supabase.from("claims").insert({
        item_id: item.id,
        claimed_by: session.user.id,
        secret_answer_given: answer.trim(),
        status: "pending",
      });

      console.log("Result:", data, error);

      if (error) {
        console.error("Full error:", error);
        toast.error(`Error: ${error.message} (${error.code})`);
        return;
      }

      toast.success("Claim submitted! The admin will review it shortly.");
      setShowClaim(false);
      setAnswer("");
    } catch (err: any) {
      console.error("Catch error:", err);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <article
      className={
        "group border border-border bg-card p-5 transition-all " +
        (isLost ? "hover:border-primary" : "hover:border-green-500")
      }
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <span
          className={
            "font-mono text-[10px] font-bold px-2 py-0.5 " +
            (isLost
              ? "bg-primary/10 text-primary"
              : "bg-green-500/10 text-green-500")
          }
        >
          {item.type.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase">
          {formatDate(item.date_lost_found)}
        </span>
      </div>

      {/* Image or placeholder */}
      <div className="w-full aspect-[4/3] bg-secondary border border-border mb-4 overflow-hidden">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg mb-2 leading-tight">{item.title}</h3>

      {/* Details */}
      <div className="space-y-1 mb-4">
        <Row label="Loc" value={item.location} />
        <Row label="Cat" value={item.category} />
        <Row label="Status" value={item.status.toUpperCase()} />
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* Claim form */}
      {showClaim && (
        <div className="mb-4 space-y-3 border border-yellow-500/30 bg-yellow-500/5 p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-yellow-500">
            🔐 Answer to Claim
          </div>
          {item.secret_question && (
            <p className="text-sm font-medium">{item.secret_question}</p>
          )}
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="Your answer..."
          />
          <div className="flex gap-2">
            <button
              onClick={submitClaim}
              disabled={claiming}
              className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase disabled:opacity-60"
            >
              {claiming ? "Submitting…" : "Submit Claim"}
            </button>
            <button
              onClick={() => setShowClaim(false)}
              className="flex-1 py-2 border border-border text-xs font-bold uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action button */}
      {!showClaim && item.status === "open" && (
        <button
          onClick={handleClaim}
          className={
            "w-full border border-foreground/10 py-2 text-xs font-bold uppercase tracking-widest transition-colors " +
            (isLost
              ? "hover:bg-foreground hover:text-background"
              : "hover:bg-green-500 hover:text-white")
          }
        >
          {isLost ? "I Found This" : "Claim Item"}
        </button>
      )}

      {/* Closed/claimed status */}
      {item.status !== "open" && (
        <div className="w-full py-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground border border-dashed border-border">
          {item.status === "claimed" ? "⏳ Claim Pending" : "✅ Recovered"}
        </div>
      )}
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="font-mono text-[9px] text-muted-foreground uppercase w-10 shrink-0">
        {label}
      </span>
      <span className="text-xs font-medium truncate">{value}</span>
    </div>
  );
}