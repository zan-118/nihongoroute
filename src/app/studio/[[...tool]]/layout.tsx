import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NihongoRoute Sanity Studio",
  description: "Portal manajemen konten editorial CMS NihongoRoute.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
