"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Trash2, Info, Trophy, AlertTriangle, Zap } from "lucide-react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default function NotificationPopover({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { notifications, markAsRead, clearAll } = useProgressStore(
    useShallow((state) => ({
      notifications: state.progress.notifications,
      markAsRead: state.markNotificationAsRead,
      clearAll: state.clearNotifications,
    }))
  );

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "achievement": return <Trophy size={16} className="text-amber-500" />;
      case "success": return <Zap size={16} className="text-primary" />;
      case "warning": return <AlertTriangle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-[100] md:hidden bg-black/20 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-[calc(100vw-2rem)] md:w-96 bg-card/95 backdrop-blur-2xl border border-border shadow-2xl rounded-3xl overflow-hidden z-[110]"
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Notifikasi</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {unreadCount} Belum Dibaca
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={clearAll}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                  title="Hapus Semua"
                 >
                   <Trash2 size={14} />
                 </button>
                 <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all"
                 >
                   <X size={14} />
                 </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications?.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {notifications?.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-muted/30 transition-all cursor-pointer relative group ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          n.type === 'achievement' ? 'bg-amber-500/10' : 
                          n.type === 'success' ? 'bg-primary/10' : 
                          'bg-blue-500/10'
                        }`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-[11px] font-black uppercase tracking-wider truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap ml-2">
                              {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: id })}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      </div>
                      
                      {!n.read && (
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,238,255,1)]" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border/50">
                    <Bell className="text-muted-foreground/30" size={24} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Tidak Ada Notifikasi</h4>
                </div>
              )}
            </div>

            {notifications?.length > 0 && (
               <div className="p-3 border-t border-border bg-muted/20">
                  <Button 
                    variant="ghost" 
                    className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                    onClick={() => notifications.forEach(n => markAsRead(n.id))}
                  >
                    Tandai Semua Selesai
                  </Button>
               </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
