import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ItemStatus = "lost" | "found" | "open" | "claimed" | "recovered" | "closed";

export type Item = {
  id: string;
  title: string;
  category: string;
  location: string;
  type: "lost" | "found";
  status: string;
  date_lost_found: string;
  description?: string;
  photo_url?: string;
  reported_by?: string;
  org_id?: string;
  secret_question?: string;
};

type Row = {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  type: string;
  status: string;
  date_lost_found: string | null;
  description: string | null;
  photo_url: string | null;
  reported_by: string | null;
  org_id: string | null;
  secret_question: string | null;
};

function rowToItem(r: Row): Item {
  return {
    id: r.id,
    title: r.title,
    category: r.category ?? "Other",
    location: r.location ?? "Unknown",
    type: r.type as "lost" | "found",
    status: r.status,
    date_lost_found: r.date_lost_found ?? new Date().toISOString().split("T")[0],
    description: r.description ?? undefined,
    photo_url: r.photo_url ?? undefined,
    reported_by: r.reported_by ?? undefined,
    org_id: r.org_id ?? undefined,
    secret_question: r.secret_question ?? undefined,
  };
}

const ITEMS_KEY = ["items"] as const;

export function useItems() {
  const q = useQuery({
    queryKey: ITEMS_KEY,
    queryFn: async (): Promise<Item[]> => {
      // Get current user's org
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.org_id) return [];

      // Only fetch items from user's org
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Row[]).map(rowToItem);
    },
  });
  return { items: q.data ?? [], isLoading: q.isLoading, error: q.error };
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      title: string;
      category: string;
      location: string;
      type: "lost" | "found";
      date_lost_found: string;
      description?: string;
      photo_url?: string;
      secret_question?: string;
      secret_answer?: string;
    }) => {
      // Get user's org and id
const { data: { session } } = await supabase.auth.getSession();
if (!session) throw new Error("Not logged in");

const { data: profile } = await supabase
  .from("profiles")
  .select("org_id")
  .eq("id", session.user.id)
  .single();

if (!profile?.org_id) throw new Error("Please join an organization first!");

const { error } = await supabase.from("items").insert({
  title: item.title,
  category: item.category,
  location: item.location,
  type: item.type,
  date_lost_found: item.date_lost_found,
  description: item.description ?? null,
  photo_url: item.photo_url ?? null,
  secret_question: item.secret_question ?? null,
  secret_answer: item.secret_answer ?? null,
  status: "open",
  org_id: profile.org_id,
  reported_by: session.user.id,
});
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}

export const CATEGORIES = [
  "Electronics",
  "Stationery",
  "Accessories",
  "Identity",
  "Apparel",
  "Keys",
  "Wallet",
  "Bag",
  "Other",
];

export const LOCATIONS = [
  "Entrance / Lobby",
  "Meeting Room",
  "Cafeteria",
  "Parking",
  "Elevator",
  "Washroom",
  "Reception",
  "Common Area",
  "Other",
];

export type Filters = {
  status: "all" | "lost" | "found";
  categories: string[];
  location: string;
  from: string;
  to: string;
  query: string;
};

export function filterItems(items: Item[], f: Filters): Item[] {
  const q = f.query.trim().toLowerCase();
  return items.filter((it) => {
    if (f.status !== "all" && it.type !== f.status) return false;
    if (f.categories.length > 0 && !f.categories.includes(it.category)) return false;
    if (f.location && it.location !== f.location) return false;
    if (f.from && it.date_lost_found < f.from) return false;
    if (f.to && it.date_lost_found > f.to) return false;
    if (q && !it.title.toLowerCase().includes(q)) return false;
    return true;
  });
}