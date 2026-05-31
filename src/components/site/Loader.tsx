export function Loader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}