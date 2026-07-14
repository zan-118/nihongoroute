"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Author profile details for posts and comments.
 */
export interface PostAuthor {
  full_name: string;
  avatar_url?: string;
  level: number;
}

/**
 * Community post structure.
 */
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

/**
 * Community comment structure.
 */
export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: PostAuthor;
}

/**
 * Verify user authentication.
 * Returns Supabase client and user object.
 * Throws error if unauthenticated.
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
 * Fetch latest community posts.
 * Optional category filter.
 * 
 * @param category - Filter posts by category.
 */
export async function getCommunityPosts(category?: string): Promise<CommunityPost[]> {
  try {
    const supabase = await createClient();
    // Build query to fetch posts with author profile details
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

    // Apply category filter if specified and not default
    if (category && category !== "Semua") {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    
    // Map database response to CommunityPost structure
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
        // Ensure likes_users is parsed as string array
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
 * Create new community post.
 * 
 * @param content - Post text content.
 * @param category - Post category classification.
 */
export async function createCommunityPost(content: string, category: string = "Umum"): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();
    
    // Validate non-empty content
    if (!content.trim()) {
      return { success: false, error: "Konten tidak boleh kosong." };
    }

    // Insert post record
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      content: content.trim(),
      likes_users: [],
      comments_count: 0,
      category
    });

    if (error) throw error;

    // Refresh social feed path
    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal membuat postingan:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat postingan." };
  }
}

/**
 * Toggle like status on a post.
 * Updates likes list and triggers notifications.
 * 
 * @param postId - Target post ID.
 */
export async function toggleLikePost(postId: string): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
  try {
    const { supabase, user } = await requireAuth();

    // Fetch current likes list and author ID
    const { data: post, error: fetchErr } = await supabase
      .from("community_posts")
      .select("likes_users, user_id")
      .eq("id", postId)
      .single();

    if (fetchErr || !post) throw new Error("Postingan tidak ditemukan.");

    let likesList: string[] = Array.isArray(post.likes_users) ? post.likes_users : [];
    const userIndex = likesList.indexOf(user.id);
    let isLiked = false;

    // Add or remove user ID from likes array
    if (userIndex > -1) {
      likesList = likesList.filter(id => id !== user.id);
    } else {
      likesList.push(user.id);
      isLiked = true;
    }

    // Update likes array using admin client to bypass RLS restrictions
    const adminSupabase = createAdminClient();
    const { error: updateErr } = await adminSupabase
      .from("community_posts")
      .update({ likes_users: likesList })
      .eq("id", postId);

    if (updateErr) throw updateErr;

    // Handle notification creation or deletion
    if (isLiked) {
      if (post.user_id !== user.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const senderName = profile?.full_name || "Seseorang";

        await adminSupabase.from("notifications").insert({
          user_id: post.user_id,
          sender_id: user.id,
          type: "like",
          title: "Suka Baru",
          message: `${senderName} menyukai postingan Anda.`,
          post_id: postId,
          read: false
        });
      }
    } else {
      if (post.user_id !== user.id) {
        await adminSupabase
          .from("notifications")
          .delete()
          .eq("user_id", post.user_id)
          .eq("sender_id", user.id)
          .eq("type", "like")
          .eq("post_id", postId);
      }
    }

    // Refresh social feed path
    revalidatePath("/social");
    return { success: true, likesCount: likesList.length, isLiked };
  } catch (error) {
    console.error("Gagal mengubah suka postingan:", error);
    return { success: false, likesCount: 0, isLiked: false };
  }
}

/**
 * Fetch comments for a specific post.
 * 
 * @param postId - Target post ID.
 */
export async function getPostComments(postId: string): Promise<CommunityComment[]> {
  try {
    const supabase = await createClient();
    // Fetch comments with author profile details
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

    // Map database response to CommunityComment structure
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
 * Add comment to a post.
 * Triggers notification to post owner.
 * 
 * @param postId - Target post ID.
 * @param content - Comment text content.
 */
export async function addCommunityComment(postId: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();

    // Validate non-empty content
    if (!content.trim()) {
      return { success: false, error: "Komentar tidak boleh kosong." };
    }

    // Insert comment record
    const { error } = await supabase.from("community_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim()
    });

    if (error) throw error;

    // Fetch post owner details for notification
    const { data: post } = await supabase
      .from("community_posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    // Notify post owner if commenter is a different user
    if (post && post.user_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      const senderName = profile?.full_name || "Seseorang";

      const adminSupabase = createAdminClient();
      await adminSupabase.from("notifications").insert({
        user_id: post.user_id,
        sender_id: user.id,
        type: "comment",
        title: "Komentar Baru",
        message: `${senderName} mengomentari postingan Anda.`,
        post_id: postId,
        read: false
      });
    }

    // Refresh social feed path
    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menambahkan komentar:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menambahkan komentar." };
  }
}

/**
 * Public profile details for user modal.
 */
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
 * Fetch public profile details by user ID.
 * 
 * @param userId - Target user ID.
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
 * Delete post owned by the authenticated user.
 * 
 * @param postId - Target post ID.
 */
export async function deleteCommunityPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();

    // Delete post matching ID and user ID ownership
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) throw error;

    // Refresh social feed path
    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menghapus postingan:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus postingan." };
  }
}

/**
 * Delete comment owned by the authenticated user.
 * 
 * @param commentId - Target comment ID.
 */
export async function deleteCommunityComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();

    // Delete comment matching ID and user ID ownership
    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) throw error;

    // Refresh social feed path
    revalidatePath("/social");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menghapus komentar:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus komentar." };
  }
}

/**
 * Notification structure.
 */
export interface CommunityNotification {
  id: string;
  user_id: string;
  sender_id: string | null;
  type: string;
  title: string;
  message: string;
  post_id: string | null;
  read: boolean;
  created_at: string;
}

/**
 * Fetch latest notifications for the authenticated user.
 */
export async function getNotifications(): Promise<CommunityNotification[]> {
  try {
    const { supabase, user } = await requireAuth();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as CommunityNotification[];
  } catch (error) {
    console.error("Gagal mengambil notifikasi:", error);
    return [];
  }
}

/**
 * Mark a specific notification as read.
 * 
 * @param notificationId - Target notification ID.
 */
export async function markNotificationRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menandai notifikasi terbaca:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menandai notifikasi." };
  }
}

/**
 * Mark all notifications of the authenticated user as read.
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menandai semua notifikasi terbaca:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menandai semua notifikasi." };
  }
}

/**
 * Delete all notifications of the authenticated user.
 */
export async function clearAllNotifications(): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireAuth();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menghapus semua notifikasi:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus semua notifikasi." };
  }
}