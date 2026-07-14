"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { 
  toggleLikePost, 
  getPostComments, 
  addCommunityComment,
  deleteCommunityPost,
  deleteCommunityComment,
  type CommunityPost
} from "@/actions/community.actions";
import { toast } from "sonner";

/**
 * Parameters for usePostCard hook.
 */
interface UsePostCardParams {
  /** Post data. */
  post: CommunityPost;
  /** Active user ID. */
  currentUserId: string;
  /** Guest status flag. */
  isGuest: boolean;
}

/**
 * Manage post interactions like likes, comments, and deletion.
 * 
 * @param params Hook parameters.
 * @returns Interaction states and handlers.
 */
export function usePostCard({ post, currentUserId, isGuest }: UsePostCardParams) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  // Fetch comments when section expanded.
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["post_comments", post.id],
    queryFn: () => getPostComments(post.id),
    enabled: showComments,
  });

  // Toggle post like status.
  const likeMutation = useMutation({
    mutationFn: () => toggleLikePost(post.id),
    onMutate: async () => {
      setIsLiking(true);
      // Cancel active queries to prevent overwrite.
      await queryClient.cancelQueries({ queryKey: ["community_posts"] });
      
      // Get current cache state.
      const queries = queryClient.getQueriesData<CommunityPost[]>({ queryKey: ["community_posts"] });
      const previousQueries = queries.map(([queryKey, data]) => ({ queryKey, data }));

      // Update cache optimistically.
      queries.forEach(([queryKey, previousPosts]) => {
        if (previousPosts) {
          queryClient.setQueryData(
            queryKey,
            previousPosts.map((p) => {
              if (p.id === post.id) {
                const hasLiked = p.likes_users.includes(currentUserId);
                return {
                  ...p,
                  likes_users: hasLiked
                    ? p.likes_users.filter((id: string) => id !== currentUserId)
                    : [...p.likes_users, currentUserId],
                };
              }
              return p;
            })
          );
        }
      });

      return { previousQueries };
    },
    onError: (err, newLike, context: { previousQueries?: { queryKey: QueryKey; data: CommunityPost[] | undefined }[] } | undefined) => {
      // Rollback cache on error.
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Gagal kasih suka.");
    },
    onSuccess: () => {
      // Notify other tabs to sync.
      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      setIsLiking(false);
    },
  });

  // Add new comment to post.
  const commentMutation = useMutation({
    mutationFn: (text: string) => addCommunityComment(post.id, text),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["post_comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Komentar terkirim!");

      // Notify other tabs to sync.
      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal kirim komentar.");
    },
  });

  // Delete post and related comments.
  const deletePostMutation = useMutation({
    mutationFn: () => deleteCommunityPost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Postingan udah dihapus.");

      // Notify other tabs to sync.
      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal hapus postingan.");
    },
  });

  // Delete specific comment.
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommunityComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post_comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Komentar udah dihapus.");

      // Notify other tabs to sync.
      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal hapus komentar.");
    },
  });

  // Trigger like mutation if user authenticated.
  const handleLike = () => {
    if (isGuest) {
      toast.error("Login dulu yuk biar bisa ikutan!");
      return;
    }
    if (isLiking) return;
    likeMutation.mutate();
  };

  // Submit comment form.
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      toast.error("Login dulu yuk biar bisa ikutan!");
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  // Prompt confirmation before post deletion.
  const handleDeletePost = () => {
    if (confirm("Yakin ingin menghapus postingan ini beserta semua komentarnya?")) {
      deletePostMutation.mutate();
    }
  };

  // Prompt confirmation before comment deletion.
  const handleDeleteComment = (commentId: string) => {
    if (confirm("Yakin ingin menghapus komentar ini?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  // Check if current user liked post.
  const hasLiked = post.likes_users.includes(currentUserId);

  return {
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
    isDeletingPost: deletePostMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isCommenting: commentMutation.isPending,
  };
}