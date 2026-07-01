"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface PostAuthor {
  full_name: string;
  avatar_url?: string;
  level: number;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_users: string[]; // UUIDs of users who liked
  comments_count: number;
  author?: PostAuthor;
  category?: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: PostAuthor;
}

/**
 * Memastikan user sudah terautentikasi dan mengembalikan client Supabase + User.
 */
async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Anda harus masuk log terlebih dahulu.");
  }

  return { supabase, user };
}

/**
 * Mengambil daftar postingan komunitas terbaru.
 */
export async function getCommunityPosts(category?: string): Promise<CommunityPost[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("community_posts")
      .select(`
        id,
        user_id,
        content,
        created_at,
        likes_users,
        comments_count,
        category,
        author:profiles(full_name, avatar_url, level)
      `);

    if (category && category !== "Semua") {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    
    // Konversi format likes_users dari JSONB array ke string[]
    return (data || []).map((post: {
      id: string;
      user_id: string;
      content: string;
      created_at: string;
      likes_users: unknown;
      comments_count: number;
      category?: string;
      author?: unknown;
    }) => {
      const authorData = post.author as { full_name: string; avatar_url?: string; level?: number } | null | undefined;
      return {
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        created_at: post.created_at,
        comments_count: post.comments_count,
        category: post.category,
        likes_users: Array.isArray(post.likes_users) ? (post.likes_users as string[]) : [],
        author: authorData ? {
          full_name: authorData.full_name,
          avatar_url: authorData.avatar_url,
          level: authorData.level || 1,
        } : undefined
      };
    }) as CommunityPost[];
  } catch (error) {
    console.error("Gagal mengambil postingan komunitas:", error);
    return [];
  }
}

/**
 * Membuat postingan baru di feed komunitas.
 */
export async function createCommunityPost(content: string, category: string = "Umum"): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();
    
    if (!content.trim()) {
      return { success: false, error: "Konten tidak boleh kosong." };
    }

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      content: content.trim(),
      likes_users: [],
      comments_count: 0,
      category
    });

    if (error) throw error;

    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal membuat postingan:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat postingan." };
  }
}

/**
 * Menyukai atau membatalkan suka pada postingan.
 */
export async function toggleLikePost(postId: string): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
  try {
    const { supabase, user } = await requireAuth();

    // Dapatkan data postingan saat ini
    const { data: post, error: fetchErr } = await supabase
      .from("community_posts")
      .select("likes_users")
      .eq("id", postId)
      .single();

    if (fetchErr || !post) throw new Error("Postingan tidak ditemukan.");

    let likesList: string[] = Array.isArray(post.likes_users) ? post.likes_users : [];
    const userIndex = likesList.indexOf(user.id);
    let isLiked = false;

    if (userIndex > -1) {
      // Batal suka
      likesList = likesList.filter(id => id !== user.id);
    } else {
      // Menyukai
      likesList.push(user.id);
      isLiked = true;
    }

    // Gunakan admin client untuk bypass RLS saat update likes_users
    const adminSupabase = createAdminClient();
    const { error: updateErr } = await adminSupabase
      .from("community_posts")
      .update({ likes_users: likesList })
      .eq("id", postId);

    if (updateErr) throw updateErr;

    revalidatePath("/social");
    return { success: true, likesCount: likesList.length, isLiked };
  } catch (error) {
    console.error("Gagal mengubah suka postingan:", error);
    return { success: false, likesCount: 0, isLiked: false };
  }
}

/**
 * Mengambil daftar komentar untuk postingan tertentu.
 */
export async function getPostComments(postId: string): Promise<CommunityComment[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("community_comments")
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        author:profiles(full_name, avatar_url, level)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((comment: {
      id: string;
      post_id: string;
      user_id: string;
      content: string;
      created_at: string;
      author?: unknown;
    }) => {
      const authorData = comment.author as { full_name: string; avatar_url?: string; level?: number } | null | undefined;
      return {
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        author: authorData ? {
          full_name: authorData.full_name,
          avatar_url: authorData.avatar_url,
          level: authorData.level || 1,
        } : undefined
      };
    }) as CommunityComment[];
  } catch (error) {
    console.error("Gagal mengambil komentar:", error);
    return [];
  }
}

/**
 * Menambahkan komentar ke postingan.
 */
export async function addCommunityComment(postId: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();

    if (!content.trim()) {
      return { success: false, error: "Komentar tidak boleh kosong." };
    }

    const { error } = await supabase.from("community_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim()
    });

    if (error) throw error;

    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menambahkan komentar:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menambahkan komentar." };
  }
}

export interface PublicProfile {
  id: string;
  full_name: string | null;
  xp: number;
  level: number;
  streak: number;
  avatar_url: string | null;
  study_days: Record<string, number | boolean>;
}

/**
 * Mengambil profil detail lengkap pengguna berdasarkan ID untuk modal profil.
 */
export async function getPublicProfile(userId: string): Promise<{ success: boolean; profile?: PublicProfile; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, xp, level, streak, avatar_url, study_days")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { success: true, profile: data as PublicProfile };
  } catch (error: unknown) {
    console.error("Gagal mengambil profil publik:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengambil profil." };
  }
}

/**
 * Menghapus postingan sendiri.
 */
export async function deleteCommunityPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menghapus postingan:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus postingan." };
  }
}

/**
 * Menghapus komentar sendiri.
 */
export async function deleteCommunityComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();

    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menghapus komentar:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus komentar." };
  }
}
