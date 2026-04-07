export default function Flashcard({ data }: { data: any }) {
  return (
    <div className="bg-[#1e2024] rounded-3xl p-8 border border-[#0ef]/20 shadow-2xl w-full max-w-md mx-auto">
      {/* Header: Kanji & Romaji */}
      <div className="text-center mb-6">
        <h1 className="text-8xl font-bold text-white mb-2">{data.word}</h1>
        <p className="text-[#0ef] font-mono tracking-widest uppercase">
          {data.romaji}
        </p>
      </div>

      {/* Grid: Onyomi & Kunyomi */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-center">
          <span className="text-[10px] text-blue-400 block uppercase font-bold mb-1">
            Onyomi
          </span>
          <span className="text-white font-medium text-sm">
            {data.details?.onyomi || "-"}
          </span>
        </div>
        <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-center">
          <span className="text-[10px] text-orange-400 block uppercase font-bold mb-1">
            Kunyomi
          </span>
          <span className="text-white font-medium text-sm">
            {data.details?.kunyomi || "-"}
          </span>
        </div>
      </div>

      {/* Meaning & Examples */}
      <div className="space-y-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
          <p className="text-white text-lg font-semibold">{data.meaning}</p>
        </div>

        <div className="space-y-2">
          {data.examples?.map((ex: any, i: number) => (
            <div
              key={i}
              className="bg-green-500/5 p-3 rounded-lg border border-green-500/20"
            >
              <ruby className="text-white text-sm font-medium">
                {ex.jp}{" "}
                <rt className="text-[10px] text-green-400 ml-1">
                  {ex.furigana}
                </rt>
              </ruby>
              <p className="text-xs text-gray-400 mt-1">{ex.id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
