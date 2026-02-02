"use client";

import {
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { PACKAGE_ID, HERO_TYPE, ACCESSORY_TYPE } from "@/lib/constants";

interface Hero {
  id: string;
  name: string;
  description: string;
  image_url: string;
  level: string;
  total_wins: string;
  total_losses: string;
}

interface Accessory {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  bonus_power: string;
}

interface DynamicField {
  name: {
    type: string;
    value: string;
  };
  objectId: string;
}

export default function Inventory() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [selectedAccessory, setSelectedAccessory] = useState<{
    [heroId: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { data: heroesData, refetch: refetchHeroes } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: { StructType: HERO_TYPE },
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!account && !!PACKAGE_ID,
    },
  );

  const { data: accessoriesData, refetch: refetchAccessories } =
    useSuiClientQuery(
      "getOwnedObjects",
      {
        owner: account?.address as string,
        filter: { StructType: ACCESSORY_TYPE },
        options: {
          showContent: true,
          showType: true,
        },
      },
      {
        enabled: !!account && !!PACKAGE_ID,
      },
    );

  const heroes: Hero[] = (heroesData?.data
    ?.map((obj) => {
      const content = obj.data?.content as any;
      if (content?.dataType === "moveObject" && content.fields) {
        return {
          id: obj.data?.objectId || "",
          name: content.fields.name || "Unknown",
          description: content.fields.description || "",
          image_url: content.fields.image_url || "",
          level: content.fields.level || "1",
          total_wins: content.fields.total_wins || "0",
          total_losses: content.fields.total_losses || "0",
        };
      }
      return null;
    })
    .filter((h): h is Hero => h !== null) || []) as Hero[];

  const accessories: Accessory[] = (accessoriesData?.data
    ?.map((obj) => {
      const content = obj.data?.content as any;
      if (content?.dataType === "moveObject" && content.fields) {
        return {
          id: obj.data?.objectId || "",
          name: content.fields.name || "Unknown",
          description: content.fields.description || "",
          image_url: content.fields.image_url || "",
          category: content.fields.category || "Unknown",
          bonus_power: content.fields.bonus_power || "0",
        };
      }
      return null;
    })
    .filter((a): a is Accessory => a !== null) || []) as Accessory[];

  const useDynamicFields = (heroId: string) => {
    return useSuiClientQuery(
      "getDynamicFields",
      { parentId: heroId },
      { enabled: !!heroId && !!account },
    );
  };

  const equipAccessory = (heroId: string, accessoryId: string) => {
    if (!account || !PACKAGE_ID) return;

    setIsLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::hero_adventure::equip_accessory`,
      arguments: [tx.object(heroId), tx.object(accessoryId)],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          refetchHeroes();
          refetchAccessories();
          setSelectedAccessory((prev) => ({ ...prev, [heroId]: "" }));
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const unequipAccessory = (heroId: string, category: string) => {
    if (!account || !PACKAGE_ID) return;

    setIsLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::hero_adventure::unequip_accessory`,
      arguments: [tx.object(heroId), tx.pure.string(category)],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          refetchHeroes();
          refetchAccessories();
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  if (!account) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold text-white">Your Inventory</h2>
        <p className="text-zinc-400">Manage your heroes and equipment</p>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold text-white">
          Heroes ({heroes.length})
        </h3>
        {heroes.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <div className="mb-2 text-4xl">🦸</div>
            <p className="text-zinc-400">
              No heroes yet. Create your first hero!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {heroes.map((hero) => (
              <HeroCard
                key={hero.id}
                hero={hero}
                accessories={accessories}
                selectedAccessory={selectedAccessory[hero.id] || ""}
                onSelectAccessory={(accessoryId) =>
                  setSelectedAccessory((prev) => ({
                    ...prev,
                    [hero.id]: accessoryId,
                  }))
                }
                onEquip={() =>
                  equipAccessory(hero.id, selectedAccessory[hero.id])
                }
                onUnequip={unequipAccessory}
                isLoading={isLoading}
                useDynamicFields={useDynamicFields}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">
          Unequipped Items ({accessories.length})
        </h3>
        {accessories.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <div className="mb-2 text-4xl">⚔️</div>
            <p className="text-zinc-400">
              No items yet. Forge your first item!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {accessories.map((accessory) => (
              <div
                key={accessory.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                {accessory.image_url ? (
                  <div className="mb-3">
                    <img
                      src={convertDriveUrl(accessory.image_url)}
                      alt={accessory.name}
                      className="h-32 w-full rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/200x150?text=Item";
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl">
                      {getCategoryIcon(accessory.category)}
                    </span>
                    <span className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                      +{accessory.bonus_power}
                    </span>
                  </div>
                )}
                <h4 className="mb-1 font-semibold text-white">
                  {accessory.name}
                </h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">{accessory.category}</p>
                  {accessory.image_url && (
                    <span className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                      +{accessory.bonus_power}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function convertDriveUrl(url: string): string {
  if (!url) return "";
  const match = url.match(/\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
  }
  return url;
}

function HeroCard({
  hero,
  accessories,
  selectedAccessory,
  onSelectAccessory,
  onEquip,
  onUnequip,
  isLoading,
  useDynamicFields,
}: {
  hero: Hero;
  accessories: Accessory[];
  selectedAccessory: string;
  onSelectAccessory: (id: string) => void;
  onEquip: () => void;
  onUnequip: (heroId: string, category: string) => void;
  isLoading: boolean;
  useDynamicFields: (heroId: string) => any;
}) {
  const { data: dynamicFieldsData } = useDynamicFields(hero.id);
  const equippedItems: DynamicField[] = dynamicFieldsData?.data || [];

  const { data: equippedAccessoriesData } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: equippedItems.map((field) => field.objectId),
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: equippedItems.length > 0,
    },
  );

  const equippedAccessories: Accessory[] = (equippedAccessoriesData
    ?.map((obj) => {
      const content = obj.data?.content as any;
      if (content?.dataType === "moveObject" && content.fields) {
        return {
          id: obj.data?.objectId || "",
          name: content.fields.name || "Unknown",
          description: content.fields.description || "",
          image_url: content.fields.image_url || "",
          category: content.fields.category || "Unknown",
          bonus_power: content.fields.bonus_power || "0",
        };
      }
      return null;
    })
    .filter((a): a is Accessory => a !== null) || []) as Accessory[];

  const totalPower = equippedAccessories.reduce(
    (sum, item) => sum + parseInt(item.bonus_power),
    0,
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      {hero.image_url && (
        <div className="mb-4">
          <img
            src={convertDriveUrl(hero.image_url)}
            alt={hero.name}
            className="h-48 w-full rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/400x300?text=Hero";
            }}
          />
        </div>
      )}

      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1 text-xl font-bold text-white">{hero.name}</h4>
          <div className="flex items-center gap-4 text-sm">
            <p className="text-zinc-400">Level {hero.level}</p>
            <p className="text-green-400">⚔️ {totalPower}</p>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs">
            <span className="text-green-500">✓ {hero.total_wins} Wins</span>
            <span className="text-red-500">✗ {hero.total_losses} Losses</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 text-2xl">
          🦸
        </div>
      </div>

      {equippedAccessories.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-zinc-300">Equipped Items:</p>
          {equippedAccessories.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3"
            >
              <div className="flex items-center gap-2">
                {item.image_url ? (
                  <img
                    src={convertDriveUrl(item.image_url)}
                    alt={item.name}
                    className="h-10 w-10 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const icon = document.createElement("span");
                      icon.className = "text-xl";
                      icon.textContent = getCategoryIcon(item.category);
                      e.currentTarget.parentElement?.appendChild(icon);
                    }}
                  />
                ) : (
                  <span className="text-xl">
                    {getCategoryIcon(item.category)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-400">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                  +{item.bonus_power}
                </span>
                <button
                  onClick={() => onUnequip(hero.id, item.category)}
                  disabled={isLoading}
                  className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Unequip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Select Item to Equip
          </label>
          <select
            value={selectedAccessory}
            onChange={(e) => onSelectAccessory(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">Choose an item...</option>
            {accessories.map((accessory) => (
              <option key={accessory.id} value={accessory.id}>
                {accessory.name} ({accessory.category}) +{accessory.bonus_power}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onEquip}
          disabled={!selectedAccessory || isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Equipping..." : "⚡ Equip Item"}
        </button>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    Weapon: "⚔️",
    Shield: "🛡️",
    Armor: "🎽",
    Helmet: "⛑️",
    Boots: "👢",
  };
  return icons[category] || "📦";
}
