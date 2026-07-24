/**
 * @file loading.tsx
 * @description Komponen pemuat awal global yang ringan tanpa JavaScript client tambahan.
 */

/**
 * Global loading screen.
 * Show spinner during page transition.
 * 
 * @returns Loading UI element.
 */
export default function RootLoading() {
  return (
    // Cover viewport above all content
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground">
      {/* Background grid pattern */}
      <div className="grid-overlay" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative size-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          {/* Spin top border for ring effect */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
          Menyiapkan NihongoRoute...
        </p>
      </div>
    </div>
  );
}