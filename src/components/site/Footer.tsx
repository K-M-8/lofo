export function Footer() {
  return (
    <footer className="border-t border-border mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Operational Efficiency: 94.2% / Uptime: 99.9%
        </div>
        <div className="flex gap-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <span>Status System</span>
          <span>Privacy Protocols</span>
          <span>Campus Safety</span>
        </div>
      </div>
    </footer>
  );
}