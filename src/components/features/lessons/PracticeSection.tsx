import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";

interface PracticeSectionProps {
  lesson: any;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({ lesson }) => {
  if (!lesson.finalPractice) return null;

  return (
    <section>
      <div className="neo-card p-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <Award size={180} />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6">
            <Award size={32} />
          </div>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4">
            Siap untuk Ujian Akhir?
          </h3>
          <p className="text-muted-foreground mb-8 text-sm md:text-base font-medium">
            Uji pemahaman kamu tentang materi <strong>{lesson.title}</strong> dengan simulasi ujian komprehensif.
          </p>
          <Link
            href={`/exams/${lesson.finalPractice.slug}`}
            className="px-10 py-4 rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
          >
            Mulai Latihan: {lesson.finalPractice.title}
          </Link>
        </div>
      </div>
    </section>
  );
};
