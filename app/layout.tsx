import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "StudyFlow",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("dark antialiased", fontMono.variable, inter.variable)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}