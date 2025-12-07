import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { ClientToastProvider } from '@/providers/ToastProvider'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { Footer } from '@/components/landing/Footer'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'TripVerse - Your Travel Companion',
  description: 'Discover hotels, cars, monuments and more for your perfect trip',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <ClientToastProvider>
                <LandingHeader />
                <div className="pt-16 min-h-screen flex flex-col">
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
              </ClientToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
