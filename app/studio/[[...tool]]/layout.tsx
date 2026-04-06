// app/studio/[[...tool]]/layout.tsx

export const dynamic = "force-static";

export const metadata = {
  title: "NihongoPath Studio",
  description: "Admin Dashboard for NihongoPath",
  robots: "noindex, nofollow",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hanya me-return children karena kita sudah punya Root Layout utama
  return <>{children}</>;
}
