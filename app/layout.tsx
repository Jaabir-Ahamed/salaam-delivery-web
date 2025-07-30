import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Salaam Delivery',
  description: 'Senior Breakfast Delivery Management System',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://images.squarespace-cdn.com/content/640a69d4ab6bd06b8101c1c7/69b970bb-3f0e-4ecf-b458-af07e5485667/Salaam+Food+Pantry+Favicon.png?content-type=image%2Fpng" />
        <link rel="shortcut icon" href="https://images.squarespace-cdn.com/content/640a69d4ab6bd06b8101c1c7/69b970bb-3f0e-4ecf-b458-af07e5485667/Salaam+Food+Pantry+Favicon.png?content-type=image%2Fpng" />
        <link rel="apple-touch-icon" href="https://images.squarespace-cdn.com/content/640a69d4ab6bd06b8101c1c7/69b970bb-3f0e-4ecf-b458-af07e5485667/Salaam+Food+Pantry+Favicon.png?content-type=image%2Fpng" />
      </head>
      <body>{children}</body>
    </html>
  )
}
