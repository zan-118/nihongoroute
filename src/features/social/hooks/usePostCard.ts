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

interface UsePostCardParams {
  post: CommunityPost;
  currentUserId: string;
  isGuest: boolean;
}

export function usePostCard({ post, currentUserId, isGuest }: UsePostCardParams) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["post_comments", post.id],
    queryFn: () => getPostComments(post.id),
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLikePost(post.id),
    onMutate: async () => {
      setIsLiking(true);
      await queryClient.cancelQueries({ queryKey: ["community_posts"] });
      
      const queries = queryClient.getQueriesData<CommunityPost[]>({ queryKey: ["community_posts"] });
      const previousQueries = queries.map(([queryKey, data]) => ({ queryKey, data }));

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
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Gagal kasih suka.");
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

  const commentMutation = useMutation({
    mutationFn: (text: string) => addCommunityComment(post.id, text),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["post_comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Komentar terkirim!");

      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal kirim komentar.");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deleteCommunityPost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Postingan udah dihapus.");

      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal hapus postingan.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommunityComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post_comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      toast.success("Komentar udah dihapus.");

      const channel = new BroadcastChannel("nihongoroute_sync");
      channel.postMessage("SYNC_COMPLETE");
      channel.close();
    },
    onError: () => {
      toast.error("Gagal hapus komentar.");
    },
  });

  const handleLike = () => {
    if (isGuest) {
      toast.error("Login dulu yuk biar bisa ikutan!");
      return;
    }
    if (isLiking) return;
    likeMutation.mutate();
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      toast.error("Login dulu yuk biar bisa ikutan!");
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleDeletePost = () => {
    if (confirm("Yakin ingin menghapus postingan ini beserta semua komentarnya?")) {
      deletePostMutation.mutate();
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Yakin ingin menghapus komentar ini?")) {
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
    isLiking,
    isPostingComment: commentMutation.isPending,
    isDeletingPost: deletePostMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    handleLike,
    handleSendComment,
    handleDeletePost,
    handleDeleteComment,
  };
}
