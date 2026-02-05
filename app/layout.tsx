import React from "react"
import type { Metadata } from 'next'
import { Nanum_Gothic } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const nanumGothic = Nanum_Gothic({ 
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '오늘의 단어장',
  description: 'Focus on your learning, day by day.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${nanumGothic.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
