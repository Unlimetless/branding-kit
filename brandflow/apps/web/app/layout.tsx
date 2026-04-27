import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrandFlow - AI-Powered Social Media Content Platform',
  description: 'Create, edit and publish social media content with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}