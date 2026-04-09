import TTSReader from "./TTSReader"; // Import komponennya

export default function Flashcard({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-br from-[#1e2024] to-[#1a1c20] rounded-[2rem] p-6 md:p-8 border border-white/5 shadow-2xl w-full max-w-md mx-auto cursor-default">
      {/* Header: Kanji & Romaji */}
      <div className="text-center mb-8 relative">
        <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tighter">
          {data.word}
        </h1>

        {/* Kontainer Romaji & Tombol Audio */}
        <div className="flex justify-center items-center gap-4">
          <p className="text-[#0ef] font-mono tracking-widest uppercase text-sm md:text-base font-bold bg-[#0ef]/5 px-4 py-1 rounded-full border border-[#0ef]/10">
            {data.romaji}
          </p>
          <TTSReader text={data.word} minimal={true} />
        </div>
      </div>

      <hr className="border-white/5 mb-6" />

      {/* Detail: Onyomi & Kunyomi */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10 text-center">
          <span className="text-[10px] text-blue-400 block uppercase font-black tracking-widest mb-1 opacity-70">
            Onyomi
          </span>
          <span className="text-white font-bold text-sm md:text-base">
            {data.details?.onyomi || "-"}
          </span>
        </div>
        <div className="bg-orange-500/5 p-3 rounded-2xl border border-orange-500/10 text-center">
          <span className="text-[10px] text-orange-400 block uppercase font-black tracking-widest mb-1 opacity-70">
            Kunyomi
          </span>
          <span className="text-white font-bold text-sm md:text-base">
            {data.details?.kunyomi || "-"}
          </span>
        </div>
      </div>

      {/* Meaning & Examples */}
      <div className="space-y-4">
        <div className="bg-green-500/5 p-4 rounded-2xl border border-green-500/10 text-center">
          <span className="text-[10px] text-green-400 block uppercase tracking-widest font-black mb-2 opacity-70">
            Arti
          </span>
          <p className="text-white text-lg font-bold leading-tight">
            {data.meaning}
          </p>
        </div>

        {/* Contoh Kalimat */}
        {data.examples && data.examples.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-[10px] text-[#c4cfde]/40 uppercase tracking-widest font-bold mb-3 px-2">
              Contoh Kalimat
            </p>
            {data.examples.map((ex: any, i: number) => (
              <div
                key={i}
                className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center gap-4"
              >
                <div className="flex-1">
                  <ruby className="text-white text-sm font-bold leading-relaxed">
                    {ex.jp}{" "}
                    <rt className="text-[10px] text-[#0ef] font-normal opacity-80 ml-1">
                      {ex.furigana}
                    </rt>
                  </ruby>
                  <p className="text-xs text-[#c4cfde]/60 mt-2 line-clamp-2">
                    {ex.id}
                  </p>
                </div>

                {/* Tombol Audio Khusus untuk Contoh Kalimat Ini */}
                <div className="shrink-0">
                  <TTSReader text={ex.jp} minimal={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
