import { client } from "@/sanity/lib/client";
import { allCheatsheetsQuery } from "@/lib/queries";

export default async function CheatsheetPage() {
  const data = await client.fetch(allCheatsheetsQuery);

  return (
    <div className="min-h-screen bg-[#1f242d] px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <p className="text-[#0ef] text-[10px] font-black uppercase tracking-[0.5em] mb-2">
            Reference
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
            Pusat Referensi Cepat
          </h1>
          <p className="text-[#c4cfde]/60 mt-4 italic">
            Daftar hafalan angka, waktu, dan kata bantu bilangan (counter).
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((sheet: any) => (
            <div
              key={sheet._id}
              className="bg-[#1e2024] rounded-[2rem] border border-white/5 overflow-hidden hover:border-[#0ef]/30 transition-all"
            >
              <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h2 className="font-black text-white uppercase italic">
                  {sheet.title}
                </h2>
                <span className="text-[10px] text-[#0ef] font-bold uppercase tracking-widest bg-[#0ef]/10 px-3 py-1 rounded-full">
                  {sheet.category}
                </span>
              </div>
              <div className="p-2">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-white/5">
                    {sheet.items.map((item: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-[#c4cfde]/70 font-medium w-1/3">
                          {item.label}
                        </td>
                        <td className="p-4 font-black text-white text-lg">
                          {item.jp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
