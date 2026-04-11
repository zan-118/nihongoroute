// app/studio/[[...tool]]/layout.tsx

export const dynamic = "force-static";

export const metadata = {
  title: "NihongoRoute Studio",
  description: "Admin Dashboard for NihongoRoute",
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
