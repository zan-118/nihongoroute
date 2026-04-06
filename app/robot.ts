export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://nihongopath-nine.vercel.app/sitemap.xml",
  };
}
