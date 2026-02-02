"use client";

import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import AdventureDashboard from "@/components/AdventureDashboard";
import Inventory from "@/components/Inventory";
import BattleArena from "@/components/BattleArena";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black">
      <WalletConnect />
      <AdventureDashboard onRefresh={handleRefresh} />
      <BattleArena onRefresh={handleRefresh} key={`battle-${refreshKey}`} />
      <Inventory key={`inventory-${refreshKey}`} />
    </div>
  );
}
