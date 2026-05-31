import { CATEGORIES, LOCATIONS, type Filters } from "@/lib/items-store";

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
};

export function FilterSidebar({ filters, onChange }: Props) {
  const toggleCategory = (cat: string) => {
    const has = filters.categories.includes(cat);
    onChange({
      ...filters,
      categories: has
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat],
    });
  };

  return (
    <aside className="space-y-10">
      <FilterGroup label="Status">
        <div className="flex gap-1 p-1 bg-secondary">
          {(["all", "lost", "found"] as const).map((s) => {
            const active = filters.status === s;
            return (
              <button
                key={s}
                onClick={() => onChange({ ...filters, status: s })}
                className={
                  "flex-1 text-[11px] font-mono font-bold uppercase tracking-widest py-1.5 transition-colors " +
                  (active
                    ? s === "found"
                      ? "bg-found text-found-foreground"
                      : s === "lost"
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Category">
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const active = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={
                  "block w-full text-left text-sm py-1 transition-colors " +
                  (active
                    ? "font-bold text-primary underline decoration-primary underline-offset-4"
                    : "hover:text-primary")
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Location">
        <select
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="w-full bg-transparent border-b border-foreground/20 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Date Range">
        <div className="grid gap-2">
          <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            From
            <input
              type="date"
              value={filters.from}
              onChange={(e) => onChange({ ...filters, from: e.target.value })}
              className="mt-1 w-full bg-transparent border-b border-foreground/20 py-1.5 text-sm focus:outline-none focus:border-primary"
            />
          </label>
          <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            To
            <input
              type="date"
              value={filters.to}
              onChange={(e) => onChange({ ...filters, to: e.target.value })}
              className="mt-1 w-full bg-transparent border-b border-foreground/20 py-1.5 text-sm focus:outline-none focus:border-primary"
            />
          </label>
        </div>
      </FilterGroup>

      <button
        onClick={() =>
          onChange({
            status: "all",
            categories: [],
            location: "",
            from: "",
            to: "",
            query: "",
          })
        }
        className="w-full border border-border py-2 text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
      >
        Reset filters
      </button>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-muted-foreground">
        {label}
      </h3>
      {children}
    </div>
  );
}