"use client";

/**
 * @file CommunityFeed.tsx
 * @description Community discussion feed component rendering user posts, comments, likes, filters, and rich media cards.
 * @module features/social
 */

import { usePostCard } from "./hooks/usePostCard";
import { useCommunityFeed } from "./hooks/useCommunityFeed";
import type { CommunityComment, CommunityPost } from "@/actions/community.actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
 Message, 
 Heart, 
 SendPlane, 
 Fire, 
 Loader, 
 ErrorWarning,
 DeleteBin,
 Trophy,
 Target,
 CalendarEvent,
 Filter
} from "@/components/ui/icons";
import { m, AnimatePresence } from "framer-motion";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * Format date string to relative time.
 * @param dateString - ISO date string.
 * @returns Relative time string.
 */
function formatRelativeTime(dateString: string) {
 const date = new Date(dateString);
 const now = new Date();
 // Calculate time difference in milliseconds
 const diffMs = now.getTime() - date.getTime();
 const diffSec = Math.floor(diffMs / 1000);
 const diffMin = Math.floor(diffSec / 60);
 const diffHr = Math.floor(diffMin / 60);
 const diffDays = Math.floor(diffHr / 24);

 // Return relative time based on duration
 if (diffSec < 60) return "Baru saja";
 if (diffMin < 60) return `${diffMin} menit lalu`;
 if (diffHr < 24) return `${diffHr} jam lalu`;
 return `${diffDays} hari lalu`;
}

/**
 * Props for PostCard component.
 */
interface PostCardProps {
 /** Post data object */
 post: CommunityPost;
 /** Current logged-in user ID */
 currentUserId: string;
 /** Guest status flag */
 isGuest: boolean;
 /** Callback when author avatar or name clicked */
 onAuthorClick: (userId: string) => void;
}

/**
 * Render single community post card.
 * Handle likes, comments, and deletion.
 */
function PostCard({ post, currentUserId, isGuest, onAuthorClick }: PostCardProps) {
 // Get post actions and state from hook
 const {
 showComments,
 setShowComments,
 commentText,
 setCommentText,
 comments,
 isLoadingComments,
 hasLiked,
 handleLike,
 handleSendComment,
 handleDeletePost,
 handleDeleteComment,
 isDeletingPost,
 isDeletingComment,
 } = usePostCard({ post, currentUserId, isGuest });

 return (
 <div className="relative group">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card className="bg-card border border-border/50 dark:border-white/10 p-5 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300 group-hover:border-primary/45">
 {/* Header Postingan */}
 <div className="flex items-center gap-3.5 mb-4">
 {/* Avatar */}
 <button 
 type="button"
 onClick={() => onAuthorClick(post.user_id)}
 className="size-10 rounded-lg flex items-center justify-center font-black text-foreground shrink-0 border border-primary/20 shadow-inner select-none font-japanese text-sm hover:scale-105 active:scale-95 transition-transform"
 aria-label={`Lihat profil ${post.author?.full_name || "Member"}`}
 >
 {post.author?.full_name?.charAt(0).toUpperCase() || "?"}
 </button>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <button 
 type="button"
 onClick={() => onAuthorClick(post.user_id)}
 className="text-xs sm:text-sm font-black text-foreground hover:text-primary transition-colors text-left"
 >
 {post.author?.full_name || "Member NihongoRoute"}
 </button>
 <Badge variant="ghost" className="p-0 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-primary/80">
 Lv.{post.author?.level || 1}
 </Badge>
 {post.category && (
 <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full select-none">
 {post.category}
 </Badge>
 )}
 </div>
 <span className="text-[10px] text-muted-foreground/60 font-semibold block sm:inline">{formatRelativeTime(post.created_at)}</span>
 </div>

 {/* Tombol Hapus Postingan Milik Sendiri */}
 {post.user_id === currentUserId && (
 <button
 type="button"
 onClick={handleDeletePost}
 disabled={isDeletingPost}
 className="p-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shrink-0 ml-auto"
 title="Hapus Postingan"
 aria-label="Hapus Postingan"
 >
 {isDeletingPost ? (
 <Loader className="animate-spin" size={14} />
 ) : (
 <DeleteBin size={14} />
 )}
 </button>
 )}
 </div>

 {/* Konten Postingan */}
 <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-6 font-medium">
 {post.content}
 </p>

 {/* Action Buttons (Like & Comment) */}
 <div className="flex items-center gap-6 border-t border-border/40 pt-4 text-muted-foreground/80">
 {/* Button Like */}
 <button 
 onClick={handleLike}
 className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors hover:text-primary ${
 hasLiked ? "text-primary" : ""
 }`}
 >
 <Heart size={16} className={hasLiked ? "fill-current text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]" : ""} />
 <span>{post.likes_users.length} Suka</span>
 </button>

 {/* Button Comments */}
 <button 
 onClick={() => setShowComments(!showComments)}
 className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors hover:text-primary ${
 showComments ? "text-primary" : ""
 }`}
 >
 <Message size={16} />
 <span>{post.comments_count} Diskusi</span>
 </button>
 </div>

 {/* Expandable Comments Area */}
 <AnimatePresence>
 {showComments && (
 <m.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden mt-4 pt-4 border-t border-border/40 space-y-4"
 >
 {/* List Komentar */}
 <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
 {isLoadingComments ? (
 <div className="flex items-center justify-center py-4 text-xs font-black uppercase tracking-wider text-muted-foreground/60 gap-2">
 <Loader className="animate-spin text-primary" size={14} /> Memuat komentar…
 </div>
 ) : comments && comments.length > 0 ? (
 comments.map((comment: CommunityComment) => (
 <div key={comment.id} className="p-3 bg-background/30 rounded-lg border border-border/60 flex flex-col relative">
 <div className="flex items-center justify-between mb-1.5">
 <div className="flex items-center gap-2">
 <button 
 type="button"
 onClick={() => onAuthorClick(comment.user_id)}
 className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-foreground text-[9px] hover:scale-105 transition-transform"
 aria-label={`Lihat profil ${comment.author?.full_name || "Member"}`}
 >
 {comment.author?.full_name?.charAt(0).toUpperCase()}
 </button>
 <div className="flex items-baseline gap-1.5">
 <button 
 type="button"
 onClick={() => onAuthorClick(comment.user_id)}
 className="text-[10px] font-black text-foreground hover:text-primary transition-colors text-left"
 >
 {comment.author?.full_name}
 </button>
 <span className="text-[8px] text-muted-foreground/50">{formatRelativeTime(comment.created_at)}</span>
 </div>
 </div>

 {/* Tombol Hapus Komentar Milik Sendiri */}
 {comment.user_id === currentUserId && (
 <button
 type="button"
 onClick={() => handleDeleteComment(comment.id)}
 disabled={isDeletingComment}
 className="p-1 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
 title="Hapus Komentar"
 aria-label="Hapus Komentar"
 >
 {isDeletingComment ? (
 <Loader className="animate-spin" size={10} />
 ) : (
 <DeleteBin size={12} />
 )}
 </button>
 )}
 </div>
 <p className="text-[11px] sm:text-xs text-foreground/80 leading-relaxed pl-8 font-medium">
 {comment.content}
 </p>
 </div>
 ))
 ) : (
 <div className="text-center py-6 text-[10px] font-black uppercase tracking-wider text-muted-foreground/45 border-2 border-dashed border-border/50 rounded-lg bg-muted/5">
 Belum ada komentar. Ajak berdiskusi!
 </div>
 )}
 </div>

 {/* Input Form Komentar */}
 {!isGuest && (
 <form onSubmit={handleSendComment} className="flex gap-2">
 <input aria-label="Tulis komentar"
 type="text"
 placeholder="Tulis balasan..."
 value={commentText}
 onChange={(e) => setCommentText(e.target.value)}
 className="flex-1 bg-background/25 border border-border/60 rounded-lg px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/45"
 />
 <Button 
 type="submit"
 disabled={isDeletingComment || !commentText.trim()}
 className="size-9 bg-primary hover:bg-secondary text-primary-foreground rounded-lg flex items-center justify-center p-0 shrink-0 shadow-sm"
 aria-label="Kirim Komentar"
 >
 {isDeletingComment ? (
 <Loader className="animate-spin" size={14} />
 ) : (
 <SendPlane size={14} />
 )}
 </Button>
 </form>
 )}
 </m.div>
 )}
 </AnimatePresence>
 </Card>
 </div>
 );
}

/**
 * Main community feed component.
 * Handle post creation, category filtering, and user profile modal.
 */
export default function CommunityFeed() {
 // Get feed state and actions from hook
 const {
 postContent,
 setPostContent,
 selectedCategory,
 setSelectedCategory,
 postCategory,
 setPostCategory,
 selectedUserProfile,
 setSelectedUserProfile,
 isFetchingProfile,
 currentUserId,
 isGuest,
 posts,
 isLoading,
 isError,
 handleSubmitPost,
 handleAuthorClick,
 isCreatingPost,
 } = useCommunityFeed();

 const CATEGORIES = ["Semua", "Tata Bahasa", "Kosakata", "JLPT", "Umum"] as const;
 const COMPOSE_CATEGORIES = ["Umum", "Tata Bahasa", "Kosakata", "JLPT"] as const;

 return (
 <div className="flex flex-col gap-6 sm:gap-8">
 
 {/* 🏷️ CATEGORY FILTER TABS */}
 <div className="flex items-center justify-between px-2 -mb-2 border-b border-border/40 pb-4">
 <div className="flex items-center gap-2 text-muted-foreground/60 text-xs font-black uppercase tracking-widest select-none">
 <Filter size={14} className="text-primary" />
 Kategori Diskusi
 </div>
 <div className="flex flex-wrap gap-1.5">
 {CATEGORIES.map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
 selectedCategory === cat
 ? "bg-primary text-primary-foreground shadow-sm"
 : "bg-background/25 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-background/45"
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* 📝 COMPOSE POST CARD */}
 {!isGuest ? (
 <div className="relative group">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card className="bg-card border border-border/50 dark:border-white/10 p-5 rounded-2xl shadow-sm relative overflow-hidden group-hover:border-primary/45 transition-colors duration-500">
 <form onSubmit={handleSubmitPost} className="space-y-4">
 <textarea
 aria-label="Tulis pertanyaan atau diskusi belajar"
 placeholder="Ada pertanyaan tentang Bahasa Jepang atau JLPT? Tulis di sini untuk berdiskusi dengan komunitas..."
 value={postContent}
 onChange={(e) => setPostContent(e.target.value)}
 rows={3}
 className="w-full bg-background/25 border border-border/60 rounded-lg p-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none focus:border-primary/45 focus:shadow-[0_0_12px_hsl(var(--primary)/0.06)]"
 />
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
 {/* Compose Category Selector */}
 <div className="flex items-center gap-1.5 bg-background/25 border border-border/60 rounded-lg p-1 shrink-0 w-full sm:w-auto">
 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 select-none">Kategori:</span>
 <div className="flex gap-1 overflow-x-auto">
 {COMPOSE_CATEGORIES.map((cat) => (
 <button
 key={cat}
 type="button"
 onClick={() => setPostCategory(cat)}
 className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
 postCategory === cat
 ? "bg-primary text-primary-foreground shadow-sm"
 : "text-muted-foreground hover:text-foreground hover:bg-background/20"
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* Kirim button */}
 <Button 
 type="submit" 
 disabled={isCreatingPost || !postContent.trim()}
 className="h-10 px-6 bg-primary hover:bg-secondary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-lg rounded-br-none flex items-center gap-2 shadow-sm transition-all w-full sm:w-auto justify-center"
 >
 {isCreatingPost ? (
 <>
 <Loader className="animate-spin" size={12} /> Mengirim…
 </>
 ) : (
 <>
 <SendPlane size={12} /> Kirim Diskusi
 </>
 )}
 </Button>
 </div>
 </form>
 </Card>
 </div>
 ) : (
 <Card className="bg-card border border-dashed border-border/80 p-6 rounded-2xl text-center flex flex-col items-center justify-center gap-3 shadow-sm">
 <div className="size-12 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground/60 border border-border">
 <ErrorWarning size={20} />
 </div>
 <div>
 <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Gabung Komunitas Diskusi</p>
 <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-sm">Kamu harus login/register dulu ya untuk bisa menulis postingan dan membalas pertanyaan di komunitas.</p>
 </div>
 </Card>
 )}

 {/* Profile loading overlay spinner */}
 {isFetchingProfile && (
 <div className="fixed inset-0 bg-background/40 -[1px] flex items-center justify-center z-50">
 <Card className="glass border-border p-5 rounded-lg flex items-center gap-3 shadow-lg">
 <Loader className="animate-spin text-primary" size={20} />
 <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Memuat profil member…</span>
 </Card>
 </div>
 )}

 {/* 📋 POSTS LIST */}
 <div className="flex flex-col gap-5 sm:gap-6">
 <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70 px-2">
 {selectedCategory === "Semua" ? "Semua Diskusi" : `Diskusi: ${selectedCategory}`}
 </h3>

 {isLoading ? (
 <div className="flex flex-col gap-5">
 {[...Array(3)].map((_, i) => (
 <Card key={`post-skeleton-${i}`} className="h-44 w-full bg-muted/15 animate-pulse rounded-2xl" />
 ))}
 </div>
 ) : isError ? (
 <div className="text-center py-20 border border-dashed border-border/80 rounded-2xl bg-muted/5 flex flex-col items-center justify-center gap-3">
 <p className="text-destructive font-black uppercase tracking-widest text-xs">Gagal Memuat Feed</p>
 <p className="text-[10px] text-muted-foreground/45">Coba periksa koneksi internetmu dan ulangi lagi.</p>
 </div>
 ) : posts && posts.length > 0 ? (
 posts.map((post) => (
 <PostCard 
 key={post.id} 
 post={post} 
 currentUserId={currentUserId}
 isGuest={isGuest}
 onAuthorClick={handleAuthorClick}
 />
 ))
 ) : (
 <div className="text-center py-20 border border-dashed border-border/80 rounded-2xl bg-muted/5 flex flex-col items-center justify-center gap-3 select-none">
 <div className="size-16 rounded-lg bg-primary/5 border border-primary/10 text-primary/60 flex items-center justify-center">
 <Message size={28} />
 </div>
 <p className="text-muted-foreground/60 font-black uppercase tracking-widest text-xs mt-2">Belum ada diskusi</p>
 <p className="text-[10px] text-muted-foreground/45">Jadilah yang pertama untuk bertanya atau membagikan sesuatu!</p>
 </div>
 )}
 </div>

 {/* 👤 USER DETAIL MODAL */}
 <Dialog open={!!selectedUserProfile} onOpenChange={(open) => !open && setSelectedUserProfile(null)}>
 <DialogContent className="border border-border/50 dark:border-white/10 max-w-sm w-full p-6 sm:p-8 rounded-2xl bg-card shadow-lg relative overflow-hidden">
 
 {selectedUserProfile && (
 <div className="relative z-10 flex flex-col items-center text-center">
 {/* Profile Avatar */}
 <div className="size-20 rounded-2xl flex items-center justify-center font-black text-foreground shrink-0 border border-primary/20 shadow-sm select-none font-japanese text-2xl mb-4">
 {selectedUserProfile.full_name?.charAt(0).toUpperCase() || "?"}
 </div>

 {/* Title & Badges */}
 <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tight mb-1">
 {selectedUserProfile.full_name || "Member Misterius"}
 </DialogTitle>
 
 <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
 {selectedUserProfile.level >= 15
 ? "Sensei Bahasa / Ahli Utama"
 : selectedUserProfile.level >= 10
 ? "Samurai Nihongo / Pembelajar Madya"
 : selectedUserProfile.level >= 5
 ? "Ronin Bahasa / Pembelajar Aktif"
 : "Chibi Nihongo / Pemula"}
 </DialogDescription>

 {/* Stats Grid */}
 <div className="grid grid-cols-2 gap-3.5 w-full mb-6 text-left">
 {/* Level */}
 <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3">
 <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
 <Target size={15} />
 </div>
 <div>
 <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Level</span>
 <span className="text-sm font-black text-foreground">{selectedUserProfile.level}</span>
 </div>
 </div>

 {/* Streak */}
 <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3">
 <div className="size-8 rounded-lg bg-warning/10 border border-warning/20 text-warning flex items-center justify-center shrink-0">
 <Fire size={15} className="fill-current" />
 </div>
 <div>
 <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Streak</span>
 <span className="text-sm font-black text-foreground">{selectedUserProfile.streak} Hari</span>
 </div>
 </div>

 {/* Total XP */}
 <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3 col-span-2">
 <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
 <Trophy size={15} />
 </div>
 <div>
 <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Total XP</span>
 <span className="text-base font-black text-primary font-mono">{selectedUserProfile.xp.toLocaleString()} XP</span>
 </div>
 </div>

 {/* Hari Aktif Belajar */}
 <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3 col-span-2">
 <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
 <CalendarEvent size={15} />
 </div>
 <div>
 <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Hari Belajar Aktif</span>
 <span className="text-sm font-black text-foreground">
 {selectedUserProfile.study_days && typeof selectedUserProfile.study_days === "object"
 ? Object.keys(selectedUserProfile.study_days).length
 : 0}{" "}
 Hari
 </span>
 </div>
 </div>
 </div>

 {/* Cheer Button */}
 <button
 type="button"
 onClick={() => {
 toast.success(`Kamu mengirimkan semangat kepada ${selectedUserProfile?.full_name || "member"}!`);
 }}
 className="w-full h-12 bg-primary hover:bg-secondary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all active:scale-[0.97]"
 >
 Kirim Semangat!
 </button>
 </div>
 )}
 </DialogContent>
 </Dialog>

 </div>
 );
}