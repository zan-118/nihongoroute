import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard | NihongoRoute",
  description: "Pantau progres belajar bahasa Jepang Anda, kelola jadwal SRS, dan taklukkan quest harian.",
};

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden pt-12 pb-24 px-4 md:px-8 transition-colors duration-300">
      {/* BACKGROUND EFFECTS (Server Rendered for visual stability) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-cyber-neon/5 dark:bg-cyber-neon/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="neural-grid" />

      <DashboardClient />
    </div>
  );
}
