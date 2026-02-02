"use client";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { PACKAGE_ID } from "@/lib/constants";

export default function AdventureDashboard({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [heroName, setHeroName] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [accessoryName, setAccessoryName] = useState("");
  const [accessoryCategory, setAccessoryCategory] = useState("Weapon");
  const [accessoryImageUrl, setAccessoryImageUrl] = useState("");
  const [bonusPower, setBonusPower] = useState("10");
  const [isLoading, setIsLoading] = useState(false);

  const mintHero = () => {
    if (!account || !heroName || !PACKAGE_ID) return;

    setIsLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::hero_adventure::mint_hero`,
      arguments: [
        tx.pure.string(heroName),
        tx.pure.string(heroImageUrl || "https://via.placeholder.com/150"),
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setHeroName("");
          setHeroImageUrl("");
          setIsLoading(false);
          setTimeout(() => {
            onRefresh?.();
          }, 2000);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const mintAccessory = () => {
    if (!account || !accessoryName || !accessoryCategory || !PACKAGE_ID) return;

    setIsLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::hero_adventure::mint_accessory`,
      arguments: [
        tx.pure.string(accessoryName),
        tx.pure.string(accessoryCategory),
        tx.pure.u64(bonusPower),
        tx.pure.string(accessoryImageUrl || "https://via.placeholder.com/150"),
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setAccessoryName("");
          setAccessoryImageUrl("");
          setBonusPower("10");
          setIsLoading(false);
          setTimeout(() => {
            onRefresh?.();
          }, 2000);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  if (!account) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚔️</div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Connect Your Wallet
          </h2>
          <p className="text-zinc-400">
            Connect your wallet to start your adventure
          </p>
        </div>
      </div>
    );
  }

  if (!PACKAGE_ID) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Package Not Configured
          </h2>
          <p className="text-zinc-400">
            Please set the PACKAGE_ID in lib/constants.ts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold text-white">Adventure Hub</h2>
        <p className="text-zinc-400">Create heroes and forge legendary items</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 text-2xl">
              🦸
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create Hero</h3>
              <p className="text-sm text-zinc-400">Summon a new champion</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Hero Name
              </label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                placeholder="Enter hero name..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Image URL (Google Drive Link)
              </label>
              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Tip: Upload to Google Drive, right-click → Share → Anyone with
                link → Copy link
              </p>
            </div>

            <button
              onClick={mintHero}
              disabled={!heroName || isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Summoning..." : "⚡ Summon Hero"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-2xl">
              ⚔️
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Forge Item</h3>
              <p className="text-sm text-zinc-400">Create powerful equipment</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Item Name
              </label>
              <input
                type="text"
                value={accessoryName}
                onChange={(e) => setAccessoryName(e.target.value)}
                placeholder="Enter item name..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Category
              </label>
              <select
                value={accessoryCategory}
                onChange={(e) => setAccessoryCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Weapon">Weapon</option>
                <option value="Shield">Shield</option>
                <option value="Armor">Armor</option>
                <option value="Helmet">Helmet</option>
                <option value="Boots">Boots</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Bonus Power
              </label>
              <input
                type="number"
                value={bonusPower}
                onChange={(e) => setBonusPower(e.target.value)}
                placeholder="10"
                min="1"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Image URL (Google Drive Link)
              </label>
              <input
                type="text"
                value={accessoryImageUrl}
                onChange={(e) => setAccessoryImageUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Optional: Add image to your item NFT
              </p>
            </div>

            <button
              onClick={mintAccessory}
              disabled={!accessoryName || isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Forging..." : "🔨 Forge Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
