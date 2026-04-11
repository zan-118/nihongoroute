export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.nihongoroute.my.id/sitemap.xml",
  };
}
