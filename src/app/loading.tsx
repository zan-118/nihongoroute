/**
 * @file loading.tsx
 * @description Komponen pemuat awal global yang ringan tanpa JavaScript client tambahan.
 */
export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground">
      <div className="neural-grid" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative size-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
          Menyiapkan NihongoRoute...
        </p>
      </div>
    </div>
  );
}
