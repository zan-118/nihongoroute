"use client";

import { useProgress } from "@/context/UserProgressContext";
import { client } from "@/sanity/lib/client";
import { vocabByIdsQuery } from "@/lib/queries";
import { useEffect, useState } from "react";
import SRSReviewEngine from "@/components/SRSReviewEngine";
import Link from "next/link";

export default function ReviewPage() {
  const { progress, loading } = useProgress();
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function getDueCards() {
      if (loading) return;

      const now = Date.now();
      // Filter ID yang sudah masuk waktu review
      const dueIds = Object.keys(progress.srs).filter(
        (id) => progress.srs[id].nextReview <= now,
      );

      if (dueIds.length > 0) {
        const data = await client.fetch(vocabByIdsQuery, { ids: dueIds });
        setReviewQueue(data);
      }
      setIsFetching(false);
    }

    getDueCards();
  }, [loading, progress.srs]);

  if (loading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0ef] font-mono">
        LOADING QUEUE...
      </div>
    );
  }

  if (reviewQueue.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-6">☕</span>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">
          Semua Beres!
        </h1>
        <p className="text-[#c4cfde]/60 mt-2">
          Tidak ada kosakata yang perlu di-review saat ini.
        </p>
        <Link
          href="/jlpt"
          className="mt-8 px-8 py-4 bg-[#0ef] text-black font-black rounded-2xl hover:scale-105 transition-all uppercase text-xs tracking-widest"
        >
          Cari Kosakata Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 md:py-20 bg-[#1f242d]">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-[#0ef] text-xs font-black uppercase tracking-widest mb-1">
              SRS Session
            </p>
            <h1 className="text-3xl font-black text-white uppercase italic">
              Daily Review
            </h1>
          </div>
          <span className="text-white/20 font-mono text-sm">
            {reviewQueue.length} CARDS DUE
          </span>
        </header>

        <SRSReviewEngine cards={reviewQueue} />
      </div>
    </div>
  );
}
