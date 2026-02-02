"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export default function WalletConnect() {
  const account = useCurrentAccount();

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600"></div>
          <h1 className="text-xl font-bold text-white">Hero Adventure</h1>
        </div>

        <div className="flex items-center gap-4">
          {account && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2">
              <p className="text-xs text-zinc-400">Connected as</p>
              <p className="font-mono text-sm text-white">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </p>
            </div>
          )}
          <ConnectButton className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 font-semibold text-white transition-all hover:from-purple-700 hover:to-blue-700" />
        </div>
      </div>
    </header>
  );
}
