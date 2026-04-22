import { metadata, viewport } from 'next-sanity/studio'

export { metadata, viewport }

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
