import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

interface Level {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export const metadata: Metadata = {
  title: "JLPT Curriculum | NihongoPath",
  description:
    "Belajar bahasa Jepang dari level N5 hingga N1 dengan sistem terstruktur dan interaktif.",
  alternates: { canonical: "/jlpt" },
};

async function getLevels(): Promise<Level[]> {
  const query = `*[_type == "level"] | order(code asc) {
    "id": _id,
    code,
    name,
    description
  }`;
  const data = await client.fetch(query);
  return data ?? [];
}

function getDifficultyLabel(code: string) {
  switch (code.toLowerCase()) {
    case "n5":
      return "Beginner";
    case "n4":
      return "Elementary";
    case "n3":
      return "Intermediate";
    case "n2":
      return "Upper Intermediate";
    case "n1":
      return "Advanced";
    default:
      return "Level";
  }
}

function getColor(code: string) {
  switch (code.toLowerCase()) {
    case "n5":
      return "from-green-500/20 to-green-500/5";
    case "n4":
      return "from-blue-500/20 to-blue-500/5";
    case "n3":
      return "from-yellow-500/20 to-yellow-500/5";
    case "n2":
      return "from-orange-500/20 to-orange-500/5";
    case "n1":
      return "from-red-500/20 to-red-500/5";
    default:
      return "from-gray-500/20 to-gray-500/5";
  }
}

export default async function JLPTLandingPage() {
  const levels = await getLevels();

  return (
    <div className="min-h-screen px-4 md:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 text-center">
          <p className="text-[#0ef] text-xs uppercase tracking-widest mb-4">
            Official Curriculum
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase">
            JLPT Learning Path
          </h1>
          <p className="text-[#c4cfde]/60 mt-6 max-w-2xl mx-auto text-sm md:text-base">
            Pilih level dan mulai perjalanan belajar bahasa Jepang secara
            sistematis dari N5 hingga N1.
          </p>
        </header>

        {levels.length === 0 ? (
          <div className="text-center text-[#c4cfde]/60">
            No levels available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {levels.map((level) => (
              <Link
                key={level.id}
                href={`/jlpt/${level.code}`}
                className="group"
              >
                <div
                  className={`bg-gradient-to-br ${getColor(level.code)} p-8 rounded-2xl border border-white/10 hover:border-[#0ef]/40 transition-all`}
                >
                  <span className="text-xs uppercase tracking-widest text-[#0ef]">
                    {getDifficultyLabel(level.code)}
                  </span>
                  <h2 className="text-3xl font-black text-white mt-4 group-hover:text-[#0ef] transition">
                    JLPT {level.name}
                  </h2>
                  {level.description && (
                    <p className="text-sm text-[#c4cfde]/60 mt-4">
                      {level.description}
                    </p>
                  )}
                  <div className="mt-6 text-xs uppercase tracking-wider text-white/40 group-hover:text-[#0ef] transition">
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-[#c4cfde]/40 text-xs uppercase tracking-widest">
            Not sure where to start?
          </p>
          <Link
            href="/jlpt/n5"
            className="inline-block mt-6 px-8 py-4 bg-[#0ef] text-black font-bold rounded-xl hover:scale-105 transition"
          >
            Start from N5 →
          </Link>
        </div>
      </div>
    </div>
  );
}
