import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit-react";
import { UsdcSection } from "./components/usdc-section";
import { NftMintSection } from "./components/nft-mint-section";
import { NftGallery } from "./components/nft-gallery";

export function App() {
  const account = useCurrentAccount();

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold">Sui Workshop</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {account ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <UsdcSection />
              <NftGallery />
            </div>
            <NftMintSection />
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">Welcome</h2>
            <p className="text-muted-foreground mb-4">Connect wallet to start</p>
            <ConnectButton />
          </div>
        )}
      </main>
    </div>
  );
}
