"use client"

import { useState } from "react"
import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@onelabs/dapp-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "@onelabs/dapp-kit/dist/index.css"

const ONECHAIN_RPC = "https://rpc-testnet.onelabs.cc:443"

const { networkConfig } = createNetworkConfig({
  testnet: { url: ONECHAIN_RPC },
})

export function OneChainProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork="testnet"
      >
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
