import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { filterItems, useItems, type Filters } from "@/lib/items-store";
import { FilterSidebar } from "@/components/site/FilterSidebar";
import { ItemCard } from "@/components/site/ItemCard";
import { Loader } from "@/components/site/Loader";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Lost & Found — LoFo" },
      {
        name: "description",
        content: "Search lost & found listings by name, category, location and date.",
      },
      { property: "og:title", content: "Browse Lost & Found — LoFo" },
    ],
  }),
  component: Browse,
});

const DEFAULTS: Filters = {
  status: "all",
  categories: [],
  location: "",
  from: "",
  to: "",
  query: "",
};

function Browse() {
  const { items, isLoading } = useItems();
  const [filters, setFilters] = useState<Filters>(DEFAULTS);

  const results = useMemo(() => filterItems(items, filters), [items, filters]);

  return (
    <section className="px-6 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 animate-reveal">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            LoFo / Browse
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6">
            Search the archive.
          </h1>
          <input
            type="text"
            placeholder="Search by item name…"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full max-w-xl bg-transparent border-b border-foreground/30 py-3 text-lg focus:outline-none focus:border-primary placeholder:text-muted-foreground"
          />
        </header>

        <div className="grid md:grid-cols-[240px_1fr] gap-12">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <main>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                {isLoading
                  ? "Loading…"
                  : `${results.length} ${results.length === 1 ? "Result" : "Results"}`}
              </h2>
              <div className="text-xs font-mono text-muted-foreground">
                SORT BY: RECENT
              </div>
            </div>

            {isLoading ? (
              <Loader />
            ) : results.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  No matches
                </div>
                <p className="text-lg font-bold">
                  Nothing in the ledger fits those filters.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try clearing some filters, or be the first to post.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}