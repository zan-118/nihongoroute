// components/PremiumCard.tsx
export default function PremiumCard({ data }) {
  return (
    <div className="bg-[#1e2024] rounded-3xl p-8 border border-white/5 shadow-2xl max-w-md mx-auto">
      {/* Front: Kanji Besar */}
      <div className="text-center mb-8">
        <h1 className="text-8xl font-bold text-white mb-2">{data.word}</h1>
        <p className="text-[#0ef] font-mono tracking-widest">{data.romaji}</p>
      </div>

      <hr className="border-white/10 mb-6" />

      {/* Back: Detail Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-center">
            <span className="text-[10px] text-blue-400 block uppercase">
              Onyomi
            </span>
            <span className="text-white font-bold">{data.details.onyomi}</span>
          </div>
          <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-center">
            <span className="text-[10px] text-orange-400 block uppercase">
              Kunyomi
            </span>
            <span className="text-white font-bold">{data.details.kunyomi}</span>
          </div>
        </div>

        <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20">
          <span className="text-[10px] text-green-400 block uppercase mb-2 font-bold">
            Meaning
          </span>
          <p className="text-white text-lg">{data.meaning}</p>
        </div>
      </div>
    </div>
  );
}
