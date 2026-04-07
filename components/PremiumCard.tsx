// components/PremiumCard.tsx

interface Example {
  jp: string;
  furigana: string;
  id: string;
}

interface CardData {
  word: string;
  romaji: string;
  meaning: string;
  details: {
    onyomi: string;
    kunyomi: string;
  };
  examples?: Example[];
}

export default function PremiumCard({ data }: { data: CardData }) {
  return (
    <div className="bg-[#1e2024] rounded-3xl p-8 border border-white/5 shadow-2xl max-w-md mx-auto">
      {/* Front: Kanji Besar */}
      <div className="text-center mb-8">
        <h1 className="text-8xl font-bold text-white mb-2">{data.word}</h1>
        <p className="text-[#0ef] font-mono tracking-widest uppercase">
          {data.romaji}
        </p>
      </div>

      <hr className="border-white/10 mb-6" />

      {/* Back: Detail Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-center">
            <span className="text-[10px] text-blue-400 block uppercase font-bold mb-1">
              Onyomi
            </span>
            <span className="text-white font-bold">
              {data.details.onyomi || "-"}
            </span>
          </div>
          <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-center">
            <span className="text-[10px] text-orange-400 block uppercase font-bold mb-1">
              Kunyomi
            </span>
            <span className="text-white font-bold">
              {data.details.kunyomi || "-"}
            </span>
          </div>
        </div>

        <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20">
          <span className="text-[10px] text-green-400 block uppercase mb-2 font-bold">
            Meaning
          </span>
          <p className="text-white text-lg font-semibold">{data.meaning}</p>
        </div>

        {/* Opsional: Render Contoh Kalimat jika ada */}
        {data.examples && data.examples.length > 0 && (
          <div className="space-y-2 mt-4">
            {data.examples.map((ex, i) => (
              <div
                key={i}
                className="bg-white/5 p-3 rounded-lg border border-white/10"
              >
                <ruby className="text-white text-sm">
                  {ex.jp}{" "}
                  <rt className="text-[10px] text-green-400">{ex.furigana}</rt>
                </ruby>
                <p className="text-xs text-gray-400 mt-1">{ex.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
