import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Porto Blog',
  description: 'Full Stack Developer transitioning to Cybersecurity. Explore my projects, experience, and thoughts on tech.',
  icons: {
    icon: '/logo.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let accent = 'purple'
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_stats')
      .select('text_value')
      .eq('key', 'site_accent')
      .maybeSingle()
    if (data?.text_value) accent = data.text_value
  } catch {
    // site_stats may not exist yet — fall back to purple
  }

  return (
    <html lang="en" data-accent={accent} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
