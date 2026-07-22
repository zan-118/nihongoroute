"use client";

/**
 * @file NotificationPopover.tsx
 * @description Komponen visual popover daftar notifikasi (Notification Popover) yang tampil di header aplikasi.
 * Terintegrasi ke Zustand Store (`useUIStore`) untuk menandai notifikasi telah dibaca, menghapus notifikasi, 
 * dan menyelaraskan penanda unread.
 */

// ======================
// IMPOR
// ======================
import { m, AnimatePresence } from "framer-motion";
import { Bell, X, Trash2, Info, Trophy, AlertTriangle, Zap } from "@/components/ui/icons";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Notification popover component. Show user notifications.
 * @param props - Component properties.
 * @param props.isOpen - Popover visibility state.
 * @param props.onClose - Callback to close popover.
 */
export default function NotificationPopover({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Get notification state and actions from UI store
  const notifications = useUIStore(s => s.notifications);
  const markAsRead = useUIStore(s => s.markNotificationAsRead);
  const markAllAsRead = useUIStore(s => s.markAllNotificationsAsRead);
  const clearAll = useUIStore(s => s.clearNotifications);

  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  /**
   * Get icon by notification type.
   * @param type - Notification type string.
   */
  const getIcon = (type: string) => {
    switch (type) {
      case "achievement": return <Trophy size={16} className="text-warning" />;
      case "success": return <Zap size={16} className="text-primary" />;
      case "warning": return <AlertTriangle size={16} className="text-destructive" />;
      default: return <Info size={16} className="text-primary" />;
    }
  };

  /**
   * Format timestamp safely to relative time.
   * @param timestamp - Raw timestamp value.
   */
  const formatTimeSafely = (timestamp: unknown) => {
    try {
      // Convert timestamp. Fallback if invalid.
      const t = Number(timestamp);
      if (isNaN(t) || t <= 0) return "Baru saja";
      return formatDistanceToNow(t, { addSuffix: true, locale: id });
    } catch (e) {
      return "Baru saja";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Latar Belakang Redup untuk Seluler - Memfokuskan tampilan pada notifikasi */}
          <div className="fixed inset-0 z-[100] md:hidden bg-background/40 " onClick={onClose} />
          
          {/* Wadah Utama Popover */}
          <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 md:w-96 z-[110] flex justify-center md:justify-end">
            <m.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="w-full bg-card border border-border shadow-[0_30px_60px_-15px_rgb(var(--background-rgb)/0.8)] rounded-xl overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-foreground leading-none mb-1">Notifikasi</h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                      {unreadCount} Belum Dibaca
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button type="button" 
                    onClick={clearAll}
                    className="size-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    title="Hapus Semua"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button type="button" 
                    onClick={onClose}
                    className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-[350px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications?.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {notifications?.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 hover:bg-muted/30 transition-all cursor-pointer relative group ${!n.read ? 'bg-primary/5' : ''}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="flex gap-4">
                          <div className={`mt-1 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            n.type === 'achievement' ? 'bg-warning/10 border border-warning/20' : 
                            n.type === 'success' ? 'bg-primary/10 border border-primary/20' : 
                            'bg-primary/10 border border-primary/20'
                          }`}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4 className={`text-[11px] font-black uppercase tracking-wider truncate leading-tight ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap pt-0.5">
                                {formatTimeSafely(n.timestamp)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                              {n.message}
                            </p>
                          </div>
                        </div>
                        
                        {!n.read && (
                          <div className="absolute top-4 right-4 size-1.5 bg-primary rounded-full shadow-[0_0_8px_rgb(var(--primary-rgb)/1)]" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 px-8 text-center">
                    <div className="size-16 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border/50 rotate-6 group-hover:rotate-0 transition-transform">
                      <Bell className="text-muted-foreground/20" size={24} />
                    </div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">Hening Sekali…</h4>
                    <p className="text-[9px] font-medium text-muted-foreground/40 mt-1 uppercase tracking-widest">Belum ada notifikasi untukmu</p>
                  </div>
                )}
              </div>

              {notifications?.length > 0 && (
                <div className="p-4 border-t border-border/50 bg-muted/20">
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-none border border-primary/20"
                    onClick={markAllAsRead}
                  >
                    Tandai Semua Selesai
                  </Button>
                </div>
              )}
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}