import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import './globals.css'

/* ─── Font ───────────────────────────────────────────────────────────────── */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Preload the most common weights
  weight: ['400', '500', '600', '700'],
})

/* ─── Metadata ───────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'StoryboardGenerator',
    template: '%s · StoryboardGenerator',
  },
  description:
    'AI-powered storyboard generation — turn your scripts into visual shot lists and storyboard images in minutes.',
  keywords: [
    'storyboard',
    'AI storyboard',
    'shot list generator',
    'screenplay',
    'film production',
    'video production',
    'AI image generation',
  ],
  authors: [{ name: 'StoryboardGenerator' }],
  creator: 'StoryboardGenerator',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'StoryboardGenerator',
    description:
      'AI-powered storyboard generation — turn your scripts into visual shot lists and storyboard images in minutes.',
    siteName: 'StoryboardGenerator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StoryboardGenerator',
    description:
      'AI-powered storyboard generation — turn your scripts into visual shot lists and storyboard images in minutes.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

/* ─── Root Layout ────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={inter.variable}
      // next-themes will manage the `class` attribute; suppress hydration
      // mismatch warning caused by the forced theme injection.
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
