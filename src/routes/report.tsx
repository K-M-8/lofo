import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { toast } from "sonner";
import { CATEGORIES, LOCATIONS, useAddItem } from "@/lib/items-store";

const searchSchema = z.object({
  status: fallback(z.enum(["lost", "found"]), "lost").default("lost"),
});

export const Route = createFileRoute("/report")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Report an Item — LoFo" },
      {
        name: "description",
        content: "Report a lost or found item to the ledger.",
      },
    ],
  }),
  component: Report,
});

function Report() {
  const { status: initialStatus } = Route.useSearch();
  const addItem = useAddItem();
  const navigate = useNavigate();

  const [type, setType] = useState<"lost" | "found">(initialStatus);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [date_lost_found, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState("");
  const [secret_question, setSecretQuestion] = useState("");
  const [secret_answer, setSecretAnswer] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to report an item!");
        navigate({ to: "/auth" });
      }
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Item title is required.");
      return;
    }
    if (type === "lost" && (!secret_question.trim() || !secret_answer.trim())) {
      toast.error("Please add a secret question and answer to protect your item.");
      return;
    }
    try {
      let photo_url = undefined;

      if (photo) {
        setUploading(true);
        const fileExt = photo.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("item-photos")
          .upload(fileName, photo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("item-photos")
          .getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
        setUploading(false);
      }

      await addItem.mutateAsync({
        title: title.trim(),
        category,
        location,
        type,
        date_lost_found,
        description: description.trim() || undefined,
        secret_question: secret_question.trim() || undefined,
        secret_answer: secret_answer.trim() || undefined,
        photo_url: photo_url,
      });

      toast.success(
        type === "lost"
          ? "Lost item reported successfully!"
          : "Found item posted successfully!"
      );
      navigate({ to: "/browse" });
    } catch (err) {
      toast.error("Could not post item. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 animate-reveal">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            LoFo / New Report
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4">
            File a report.
          </h1>
          <p className="text-muted-foreground max-w-[55ch]">
            Report a lost or found item. The faster it goes up, the faster it
            finds its way home.
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-10 animate-reveal [animation-delay:150ms]">

          {/* Type toggle */}
          <Field label="Report Type">
            <div className="flex gap-2">
              {(["lost", "found"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setType(s)}
                  className={
                    "flex-1 py-4 font-bold tracking-tight uppercase transition-all border " +
                    (type === s
                      ? s === "lost"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-green-600 text-white border-green-600"
                      : "bg-transparent border-border text-muted-foreground hover:text-foreground")
                  }
                >
                  {s === "lost" ? "I Lost Something" : "I Found Something"}
                </button>
              ))}
            </div>
          </Field>

          {/* Title */}
          <Field label="Item Name" hint="e.g. Black Moleskine Notebook">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary"
              placeholder="What is it?"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Category */}
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            {/* Location */}
            <Field label="Location">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-primary"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>

            {/* Date */}
            <Field label={type === "lost" ? "Date Lost" : "Date Found"}>
              <input
                type="date"
                value={date_lost_found}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-primary"
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" hint="Optional — distinguishing marks, contents…">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-primary resize-none"
              placeholder="Any details that would help identify it."
            />
          </Field>

          {/* Photo Upload */}
          <Field label="Photo" hint="Optional — helps identify the item faster">
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhoto(file);
                    setPhotoPreview(URL.createObjectURL(file));
                  }
                }}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 bg-background border border-border px-2 py-1 text-xs font-bold uppercase"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-foreground/30 py-8 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors uppercase font-mono tracking-widest"
                >
                  + Upload Photo
                </button>
              )}
            </div>
          </Field>

          {/* Secret Question — only for lost items */}
          {type === "lost" && (
            <div className="border border-yellow-500/30 bg-yellow-500/5 p-6 space-y-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-500 mb-1">
                  🔐 Claim Protection
                </div>
                <p className="text-sm text-muted-foreground">
                  Set a secret question only the real owner would know. Anyone claiming this item must answer it correctly.
                </p>
              </div>
              <Field label="Secret Question" hint="e.g. What colour is the strap?">
                <input
                  required
                  value={secret_question}
                  onChange={(e) => setSecretQuestion(e.target.value)}
                  className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-primary"
                  placeholder="Ask something only you would know"
                />
              </Field>
              <Field label="Secret Answer" hint="This is hidden from everyone else">
                <input
                  required
                  value={secret_answer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  className="w-full bg-transparent border-b border-foreground/30 py-3 text-base focus:outline-none focus:border-primary"
                  placeholder="Your answer"
                />
              </Field>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={addItem.isPending || uploading}
              className={
                "px-8 py-4 font-bold tracking-tight uppercase flex items-center gap-4 transition-all disabled:opacity-60 " +
                (type === "lost"
                  ? "bg-primary text-primary-foreground hover:brightness-110"
                  : "bg-green-600 text-white hover:brightness-110")
              }
            >
              {uploading
                ? "Uploading photo…"
                : addItem.isPending
                ? "Posting…"
                : "Post Report"}
              <span className="font-mono text-xs opacity-60">[↵]</span>
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/browse" })}
              className="px-8 py-4 font-bold tracking-tight uppercase border border-border hover:bg-foreground hover:text-background transition-colors"
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
    <label className="block">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[10px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}