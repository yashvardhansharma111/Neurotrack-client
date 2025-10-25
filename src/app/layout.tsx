'use client'

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { ToastProvider } from "@/hooks/use-toast"



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={cn(`font-sans ${GeistSans.variable} ${GeistMono.variable}`)}>
        <Suspense fallback={null}>
          <ToastProvider>
          <Toaster richColors position="top-right" closeButton />
          {children}
          </ToastProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
