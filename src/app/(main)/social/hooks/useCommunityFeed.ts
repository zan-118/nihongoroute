"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCommunityPosts, 
  createCommunityPost,
  getPublicProfile,
  type PublicProfile
} from "@/actions/community.actions";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

/**
 * Custom hook to manage community feed state, post creation, 
 * user profile modal fetching, and cross-tab synchronization.
 * 
 * @returns Object containing feed states, query results, mutations, and event handlers.
 */
export function useCommunityFeed() {
  const queryClient = useQueryClient();
  
  // Input state for new post content
  const [postContent, setPostContent] = useState("");
  // Filter state for filtering posts by category
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  // Category state for new post creation
  const [postCategory, setPostCategory] = useState("Umum");

  // Profile Modal State
  const [selectedUserProfile, setSelectedUserProfile] = useState<PublicProfile | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  // User authentication states
  const currentUserId = useUserStore((s) => s.id);
  const isGuest = useUserStore((s) => s.isGuest);

  // BroadcastChannel for cross-tab synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel("nihongoroute_sync");
    channel.onmessage = (event) => {
      // Invalidate cache when another tab completes sync
      if (event.data === "SYNC_COMPLETE") {
        queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  // Query community posts filtered by selected category
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["community_posts", selectedCategory],
    queryFn: () => getCommunityPosts(selectedCategory),
  });

  // Mutation to create a new community post
  const postMutation = useMutation({
    mutationFn: (payload: { content: string; category: string }) => 
      createCommunityPost(payload.content, payload.category),
    onSuccess: (data) => {
      if (data.success) {
        setPostContent("");
        queryClient.invalidateQueries({ queryKey: ["community_posts"] });
        toast.success("Postingan berhasil dikirim!");

        // Notify other tabs to sync feed
        const channel = new BroadcastChannel("nihongoroute_sync");
        channel.postMessage("SYNC_COMPLETE");
        channel.close();
      } else {
        toast.error(data.error || "Gagal kirim postingan.");
      }
    },
    onError: () => {
      toast.error("Waduh, ada yang salah. Coba lagi ya.");
    },
  });

  /**
   * Handles submission of a new community post.
   * Prevents action if user is guest or content is empty.
   * 
   * @param e - React form event
   */
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      toast.error("Login dulu yuk biar bisa posting!");
      return;
    }
    if (!postContent.trim()) return;
    postMutation.mutate({ content: postContent, category: postCategory });
  };

  /**
   * Fetches and sets public profile data for the selected user.
   * 
   * @param userId - ID of the user whose profile is requested
   */
  const handleAuthorClick = async (userId: string) => {
    setIsFetchingProfile(true);
    try {
      const res = await getPublicProfile(userId);
      if (res.success && res.profile) {
        setSelectedUserProfile(res.profile);
      } else {
        toast.error("Hmm, profilnya belum bisa dimuat.");
      }
    } catch (err) {
      toast.error("Gagal ambil profil. Coba lagi ya.");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  return {
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
    isCreatingPost: postMutation.isPending,
  };
}