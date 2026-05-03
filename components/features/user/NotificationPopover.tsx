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
          {/* Backdrop for mobile - Dimmed background to focus on notification */}
          <div className="fixed inset-0 z-[100] md:hidden bg-black/40 backdrop-blur-sm" onClick={onClose} />
          
          {/* Main Popover Container */}
          <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 md:w-96 z-[110] flex justify-center md:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="w-full bg-[#0a0a0a] border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-[2rem] overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground leading-none mb-1">Notifikasi</h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                      {unreadCount} Belum Dibaca
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
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
                            n.type === 'achievement' ? 'bg-amber-500/10 border border-amber-500/20' : 
                            n.type === 'success' ? 'bg-primary/10 border border-primary/20' : 
                            'bg-blue-500/10 border border-blue-500/20'
                          }`}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4 className={`text-[11px] font-black uppercase tracking-wider truncate leading-tight ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap pt-0.5">
                                {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: id })}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 font-medium">
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
                  <div className="py-16 px-8 text-center">
                    <div className="w-16 h-16 rounded-[2rem] bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border/50 rotate-6 group-hover:rotate-0 transition-transform">
                      <Bell className="text-muted-foreground/20" size={24} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Hening Sekali...</h4>
                    <p className="text-[9px] font-medium text-muted-foreground/40 mt-1 uppercase tracking-widest">Belum ada notifikasi untukmu</p>
                  </div>
                )}
              </div>

              {notifications?.length > 0 && (
                <div className="p-4 border-t border-border/50 bg-muted/20">
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white dark:hover:text-black transition-all shadow-none border border-primary/20"
                    onClick={() => notifications.forEach(n => markAsRead(n.id))}
                  >
                    Tandai Semua Selesai
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
