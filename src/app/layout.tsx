import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tyre Hi Tyre - Complete Tyre Sales & Purchase Management",
  description: "Comprehensive tyre sales and purchase management system. Search, buy, and manage tyre inventory with ease. Mobile-friendly PWA for tyre businesses.",
  keywords: ["tyre", "sales", "purchase", "inventory", "MRF", "CEAT", "Apollo", "Bridgestone", "car tyres", "bike tyres", "SUV tyres"],
  authors: [{ name: "Tyre Hi Tyre Team" }],
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Tyre Hi Tyre - Tyre Management System",
    description: "Complete tyre sales and purchase management system for your business",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyre Hi Tyre",
    description: "Complete tyre sales and purchase management system",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tyre Hi Tyre",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  )
}