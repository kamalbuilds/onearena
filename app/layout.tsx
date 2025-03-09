import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { OneChainProviderWrapper } from "@/components/providers/onechain-provider"
import Header from "@/components/layout/header"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OneArena - AI Battle Royale on OneChain",
  description:
    "Create, train, and battle AI-powered NFT fighters on OneChain. What if your NFTs could think?",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%2300f0ff' font-weight='bold'>⚡</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <OneChainProviderWrapper>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster theme="dark" />
        </OneChainProviderWrapper>
      </body>
    </html>
  )
}
