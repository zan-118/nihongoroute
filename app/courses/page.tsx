"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CoursesPage() {
  const courses = [
    {
      id: "basics",
      title: "Kana Basics",
      desc: "Fondasi mutlak. Kuasai membaca dan menulis Hiragana & Katakana sebelum masuk ke JLPT.",
      level: "Beginner",
      icon: "⛩️",
      href: "/courses/basics",
      color: "text-emerald-400",
      progress: 100, // Dummy progress
    },
    {
      id: "n5",
      title: "JLPT N5",
      desc: "Langkah pertama. Pola kalimat dasar, 100+ Kanji, dan kosakata untuk kehidupan sehari-hari.",
      level: "N5",
      icon: "🌸",
      href: "/courses/jlpt-n5",
      color: "text-cyan-400",
      progress: 45,
    },
    {
      id: "n4",
      title: "JLPT N4",
      desc: "Level bertahan hidup. Bentuk kasual, Keigo dasar, dan tata bahasa esensial.",
      level: "N4",
      icon: "🏮",
      href: "/courses/jlpt-n4",
      color: "text-indigo-400",
      progress: 0,
      locked: true,
    },
    {
      id: "n3",
      title: "JLPT N3",
      desc: "Menjembatani ke tingkat mahir. Membaca artikel nyata dan memahami percakapan natural.",
      level: "N3",
      icon: "🗻",
      href: "/courses/jlpt-n3",
      color: "text-purple-400",
      progress: 0,
      locked: true,
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-32">
      <header className="mb-16 border-b border-white/5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] hidden md:block" />
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
              Learning <span className="text-cyan-400">Path</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium md:ml-6 max-w-2xl text-sm leading-relaxed">
            Kurikulum terstruktur dari dasar hingga mahir. Pilih modul Anda dan
            biarkan sistem SRS mengurus retensi memori Anda.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {courses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              href={course.locked ? "#" : course.href}
              className="block group"
            >
              <article
                className={`neo-card p-8 md:p-10 transition-all duration-300 h-full flex flex-col justify-between ${course.locked ? "opacity-50 grayscale cursor-not-allowed" : "hover:-translate-y-2 hover:border-cyan-400/30"}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform origin-top-left">
                      {course.icon}
                    </span>
                    <span className="neo-inset px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
                      {course.level}
                    </span>
                  </div>

                  <h2
                    className={`text-2xl md:text-3xl font-black uppercase italic tracking-tight mb-3 ${course.color}`}
                  >
                    {course.title}
                    {course.locked && (
                      <span className="ml-3 text-sm text-slate-600">🔒</span>
                    )}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    {course.desc}
                  </p>
                </div>

                {!course.locked && (
                  <div>
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                      <span>Progress</span>
                      <span className={course.color}>{course.progress}%</span>
                    </div>
                    <div className="neo-inset w-full h-2 overflow-hidden mb-6">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${course.color.replace("text", "bg")}`}
                      />
                    </div>

                    <div className="neo-inset w-full text-center py-3 text-xs font-mono font-black uppercase tracking-widest text-slate-400 group-hover:text-cyan-400 group-hover:bg-white/5 transition-all">
                      Access Module →
                    </div>
                  </div>
                )}
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
