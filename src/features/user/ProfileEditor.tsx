"use client";

/**
 * @file ProfileEditor.tsx
 * @description Inline profile name editor component allowing users to update their profile username directly from the dashboard header.
 * @module features/user
 */

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Edit2, Check, X, UserCircle, Loader2 } from "@/components/ui/icons";
import { useProfileEditor } from "@/features/user/useProfileEditor";

/**
 * ProfileEditor component.
 * Renders user profile name. Allows inline editing.
 * 
 * @returns React element.
 */
export default function ProfileEditor() {
 const {
 name,
 isEditing,
 editName,
 setEditName,
 isLoading,
 handleSave,
 startEditing,
 cancelEditing,
 } = useProfileEditor();

 return (
 <div className="w-full">
 {isEditing ? (
 /* Render input field when editing */
 <Card className="p-1 bg-muted border-border flex items-center gap-2 rounded-lg animate-in fade-in slide-in- shadow-sm">
 <Input
 value={editName}
 onChange={(e) => setEditName(e.target.value)}
 placeholder="Masukkan nama kamu..."
 className="bg-transparent border-none text-foreground font-black uppercase tracking-tighter text-xl h-12 focus-visible:ring-0 placeholder:text-muted-foreground/30"
 autoFocus
 onKeyDown={(e) => {
 // Save on Enter, cancel on Escape
 if (e.key === "Enter") handleSave();
 if (e.key === "Escape") cancelEditing();
 }}
 />
 <div className="flex gap-1 pr-2">
 <Button
 size="icon"
 variant="ghost"
 onClick={handleSave}
 disabled={isLoading}
 className="size-10 rounded-xl bg-success/10 text-success hover:bg-success hover:text-success-foreground transition-all"
 aria-label="Simpan Nama"
 >
 {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
 </Button>
 <Button
 size="icon"
 variant="ghost"
 onClick={cancelEditing}
 disabled={isLoading}
 className="size-10 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-background hover:text-foreground transition-all"
 aria-label="Batal Edit"
 >
 <X size={18} />
 </Button>
 </div>
 </Card>
 ) : (
 /* Render profile display when not editing */
 <div className="flex items-center gap-4 group">
 <div className="relative">
 <div className="size-16 rounded-lg border border-border flex items-center justify-center text-primary shadow-sm group-hover:shadow-md transition-all">
 <UserCircle size={32} />
 </div>
 <div className="absolute -bottom-1 -right-1 size-5 bg-success rounded-full border-2 border-background" />
 </div>
 
 <div className="flex-1">
 <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tighter leading-none flex items-center gap-3 sm:gap-4 text-balance">
 <span className="text-primary">
 {name || "Pelajar"}
 </span>
 <button type="button"
 onClick={startEditing}
 className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0"
 aria-label="Edit Nama Profil"
 >
 <Edit2 size={20} className="sm:w-6 sm:h-6" />
 </button>
 </h2>
 <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
 <span className="size-1.5 rounded-full bg-success animate-pulse" />
 Member Aktif NihongoRoute
 </p>
 </div>
 </div>
 )}
 </div>
 );
}