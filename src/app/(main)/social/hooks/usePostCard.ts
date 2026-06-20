"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  toggleLikePost, 
  getPostComments, 
  addCommunityComment,
  deleteCommunityPost,
  deleteCommunityComment
} from "@/actions/community.actions";
import { toast } from "sonner";

interface UsePostCardParams {
  post: any;
  currentUserId: string;
  isGuest: boolean;
}

/**
 * Hook kustom untuk memisahkan logika interaksi kartu postingan (likes, komentar, dan hapus).
 * 
 * @param {UsePostCardParams} params - Data postingan, user ID aktif, dan status guest
 */
export function usePostCard({ post, currentUserId, isGuest }: UsePostCardParams) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  // Query untuk mengambil komentar secara dinamis saat di-expand
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["post_comments", post.id],
    queryFn: () => getPostComments(post.id),
    enabled: showComments,
  });

  // Mutasi Like
  const likeMutation = useMutation({
    mutationFn: () => toggleLikePost(post.id),
    onMutate: async () => {
      setIsLiking(true);
      await queryClient.cancelQueries({ queryKey: ["community_posts"] });
      const previousPosts = queryClient.getQueryData<any[]>(["community_posts"]);
      
      if (previousPosts) {
        queryClient.setQueryData(
          ["community_posts"],
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
      return { previousPosts };
    },
    onError: (err, newLike, context: any) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["community_posts"], context.previousPosts);
      }
      toast.error("Gagal menyukai postingan.");
    },
    onSuccess: () => {
      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      setIsLiking(false);
    },
  });

  // Mutasi tambah komentar
  const commentMutation = useMutation({
    mutationFn: (text: string) => addCommunityComment(post.id, text),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["post_comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Komentar ditambahkan!");

      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal menambahkan komentar.");
    },
  });

  // Mutasi Hapus Postingan
  const deletePostMutation = useMutation({
    mutationFn: () => deleteCommunityPost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Postingan berhasil dihapus!");

      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal menghapus postingan.");
    },
  });

  // Mutasi Hapus Komentar
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommunityComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post_comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Komentar berhasil dihapus!");

      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal menghapus komentar.");
    },
  });

  const handleLike = () => {
    if (isGuest) {
      toast.error("Anda harus masuk log terlebih dahulu.");
      return;
    }
    if (isLiking) return;
    likeMutation.mutate();
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      toast.error("Anda harus masuk log terlebih dahulu.");
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleDeletePost = () => {
    if (confirm("Apakah Anda yakin ingin menghapus postingan ini beserta seluruh komentarnya?")) {
      deletePostMutation.mutate();
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

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
