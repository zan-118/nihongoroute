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
 * Hook kustom untuk memisahkan logika utama halaman hub komunitas (komposisi, kategori filter, detail profil).
 */
export function useCommunityFeed() {
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [postCategory, setPostCategory] = useState("Umum");

  // Profile Modal State
  const [selectedUserProfile, setSelectedUserProfile] = useState<PublicProfile | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const currentUserId = useUserStore((s) => s.id);
  const isGuest = useUserStore((s) => s.isGuest);

  // BroadcastChannel untuk sinkronisasi lintas-tab
  useEffect(() => {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel("nihongoroute_sync");
    channel.onmessage = (event) => {
      if (event.data === "SYNC_COMPLETE") {
        queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  // Query daftar postingan berdasarkan kategori terpilih
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["community_posts", selectedCategory],
    queryFn: () => getCommunityPosts(selectedCategory),
  });

  // Mutasi membuat postingan baru
  const postMutation = useMutation({
    mutationFn: (payload: { content: string; category: string }) => 
      createCommunityPost(payload.content, payload.category),
    onSuccess: (data) => {
      if (data.success) {
        setPostContent("");
        queryClient.invalidateQueries({ queryKey: ["community_posts"] });
        toast.success("Postingan berhasil dikirim!");

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

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      toast.error("Login dulu yuk biar bisa posting!");
      return;
    }
    if (!postContent.trim()) return;
    postMutation.mutate({ content: postContent, category: postCategory });
  };

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
