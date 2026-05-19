import { ReactNode } from "react";

export const metadata = {
  title: "NihongoRoute Studio",
  description: "Sanity CMS Content Studio for NihongoRoute",
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-[#0a0a0a]">
      {children}
    </div>
  );
}
