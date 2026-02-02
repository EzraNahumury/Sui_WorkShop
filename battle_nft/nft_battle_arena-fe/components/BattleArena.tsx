"use client";

import {
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { PACKAGE_ID } from "@/lib/constants";

interface Hero {
  id: string;
  name: string;
  description: string;
  image_url: string;
  level: string;
  total_wins: string;
  total_losses: string;
}

interface BattleChallenge {
  id: string;
  challenger: string;
  challenger_hero: string;
  bet_amount: string;
  weapon_power: string;
}

interface ChallengeEvent {
  challenge_id: string;
  challenger: string;
  challenger_hero: string;
  weapon_power: string;
  bet_amount: string;
}

interface BattleResultEvent {
  challenge_id: string;
  winner: string;
  loser: string;
  winner_hero: string;
  loser_hero: string;
  total_prize: string;
  winner_power: string;
  loser_power: string;
}

interface CompletedChallenge {
  id: string;
  winner: string;
  loser: string;
  total_prize: string;
  winner_power: string;
  loser_power: string;
  isWinner: boolean;
}

function convertDriveUrl(url: string): string {
  if (!url) return "";
  const match = url.match(/\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
  }
  return url;
}

export default function BattleArena({ onRefresh }: { onRefresh?: () => void }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [selectedHero, setSelectedHero] = useState("");
  const [betAmount, setBetAmount] = useState("0.1");
  const [isLoading, setIsLoading] = useState(false);

  const { data: heroesData, refetch: refetchHeroes } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: { StructType: `${PACKAGE_ID}::hero_adventure::Hero` },
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!account && !!PACKAGE_ID,
    },
  );

  const { data: challengeEventsData, refetch: refetchChallenges } =
    useSuiClientQuery(
      "queryEvents",
      {
        query: {
          MoveEventType: `${PACKAGE_ID}::hero_adventure::ChallengeCreated`,
        },
        limit: 50,
        order: "descending",
      },
      {
        enabled: !!PACKAGE_ID,
      },
    );

  const { data: battleResultsData, refetch: refetchBattleResults } =
    useSuiClientQuery(
      "queryEvents",
      {
        query: {
          MoveEventType: `${PACKAGE_ID}::hero_adventure::BattleResult`,
        },
        limit: 50,
        order: "descending",
      },
      {
        enabled: !!PACKAGE_ID,
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

  // Get active challenges from events
  const activeChallengeIds = new Set<string>();
  const challengeEvents: ChallengeEvent[] = (challengeEventsData?.data
    ?.map((event) => {
      const parsedJson = event.parsedJson as any;
      if (parsedJson) {
        activeChallengeIds.add(parsedJson.challenge_id);
        return {
          challenge_id: parsedJson.challenge_id || "",
          challenger: parsedJson.challenger || "",
          challenger_hero: parsedJson.challenger_hero || "",
          weapon_power: parsedJson.weapon_power?.toString() || "0",
          bet_amount: parsedJson.bet_amount?.toString() || "0",
        };
      }
      return null;
    })
    .filter((e): e is ChallengeEvent => e !== null) || []) as ChallengeEvent[];

  // Get completed battles (challenges that have been resolved)
  const completedChallengeIds = new Set<string>();
  const battleResults: BattleResultEvent[] = (battleResultsData?.data
    ?.map((event) => {
      const parsedJson = event.parsedJson as any;
      if (parsedJson) {
        completedChallengeIds.add(parsedJson.challenge_id);
        return {
          challenge_id: parsedJson.challenge_id || "",
          winner: parsedJson.winner || "",
          loser: parsedJson.loser || "",
          winner_hero: parsedJson.winner_hero || "",
          loser_hero: parsedJson.loser_hero || "",
          total_prize: parsedJson.total_prize?.toString() || "0",
          winner_power: parsedJson.winner_power?.toString() || "0",
          loser_power: parsedJson.loser_power?.toString() || "0",
        };
      }
      return null;
    })
    .filter((e): e is BattleResultEvent => e !== null) ||
    []) as BattleResultEvent[];

  // Map battle results to completed challenges for current user
  const completedChallenges: CompletedChallenge[] = battleResults
    .filter(
      (result) =>
        result.winner === account?.address || result.loser === account?.address,
    )
    .map((result) => ({
      id: result.challenge_id,
      winner: result.winner,
      loser: result.loser,
      total_prize: result.total_prize,
      winner_power: result.winner_power,
      loser_power: result.loser_power,
      isWinner: result.winner === account?.address,
    }));

  // Filter out completed challenges from active challenges
  const challenges: BattleChallenge[] = challengeEvents
    .filter((event) => !completedChallengeIds.has(event.challenge_id))
    .map((event) => ({
      id: event.challenge_id,
      challenger: event.challenger,
      challenger_hero: event.challenger_hero,
      bet_amount: event.bet_amount,
      weapon_power: event.weapon_power,
    }));

  const createChallenge = () => {
    if (!account || !selectedHero || !PACKAGE_ID || !betAmount) return;

    setIsLoading(true);
    const tx = new Transaction();

    const betAmountInMist = Math.floor(parseFloat(betAmount) * 1_000_000_000);
    const [coin] = tx.splitCoins(tx.gas, [betAmountInMist]);

    tx.moveCall({
      target: `${PACKAGE_ID}::hero_adventure::create_battle_challenge`,
      arguments: [tx.object(selectedHero), coin],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          setTimeout(() => {
            refetchChallenges();
            onRefresh?.();
          }, 2000);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const acceptChallenge = (
    challengeId: string,
    heroId: string,
    betAmount: string,
  ) => {
    if (!account || !PACKAGE_ID) return;

    setIsLoading(true);
    const tx = new Transaction();

    const betAmountInMist = parseInt(betAmount);
    const [coin] = tx.splitCoins(tx.gas, [betAmountInMist]);

    tx.moveCall({
      target: `${PACKAGE_ID}::hero_adventure::accept_battle_challenge`,
      arguments: [tx.object(challengeId), tx.object(heroId), coin],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          setTimeout(() => {
            refetchChallenges();
            refetchHeroes();
            refetchBattleResults();
            onRefresh?.();
          }, 2000);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const cancelChallenge = (challengeId: string) => {
    if (!account || !PACKAGE_ID) return;

    setIsLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::hero_adventure::cancel_battle_challenge`,
      arguments: [tx.object(challengeId)],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          setTimeout(() => {
            refetchChallenges();
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
    return null;
  }

  const myChallenges = challenges.filter(
    (c) => c.challenger === account.address,
  );
  const otherChallenges = challenges.filter(
    (c) => c.challenger !== account.address,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold text-white">⚔️ Battle Arena</h2>
        <p className="text-zinc-400">
          Challenge other players and win SUI tokens!
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-xl font-bold text-white">
          Create Battle Challenge
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Select Your Hero
            </label>
            <select
              value={selectedHero}
              onChange={(e) => setSelectedHero(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">Choose a hero...</option>
              {heroes.map((hero) => (
                <option key={hero.id} value={hero.id}>
                  {hero.name} (Lvl {hero.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Bet Amount (SUI)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              step="0.1"
              min="0.1"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={createChallenge}
              disabled={!selectedHero || isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-6 py-2 font-semibold text-white transition-all hover:from-red-700 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "🔥 Create Challenge"}
            </button>
          </div>
        </div>
      </div>

      {myChallenges.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-white">
            My Challenges ({myChallenges.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-lg border border-yellow-600 bg-zinc-900 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded bg-yellow-600 px-2 py-1 text-xs font-semibold text-white">
                    Your Challenge
                  </span>
                  <span className="text-lg">⏳</span>
                </div>
                <p className="mb-2 text-sm text-zinc-400">
                  Weapon Power:{" "}
                  <span className="font-bold text-white">
                    {challenge.weapon_power}
                  </span>
                </p>
                <p className="mb-4 text-sm text-zinc-400">
                  Bet:{" "}
                  <span className="font-bold text-white">
                    {(parseInt(challenge.bet_amount) / 1_000_000_000).toFixed(
                      2,
                    )}{" "}
                    SUI
                  </span>
                </p>
                <button
                  onClick={() => cancelChallenge(challenge.id)}
                  disabled={isLoading}
                  className="w-full rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">
          Open Challenges ({otherChallenges.length})
        </h3>
        {otherChallenges.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <div className="mb-2 text-4xl">🏹</div>
            <p className="text-zinc-400">
              No challenges available. Create one!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-lg border border-zinc-700 bg-zinc-900 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded bg-purple-600 px-2 py-1 text-xs font-semibold text-white">
                    Challenge
                  </span>
                  <span className="text-lg">⚔️</span>
                </div>
                <p className="mb-2 text-sm text-zinc-400">
                  Enemy Power:{" "}
                  <span className="font-bold text-red-400">
                    {challenge.weapon_power}
                  </span>
                </p>
                <p className="mb-2 text-sm text-zinc-400">
                  Bet:{" "}
                  <span className="font-bold text-white">
                    {(parseInt(challenge.bet_amount) / 1_000_000_000).toFixed(
                      2,
                    )}{" "}
                    SUI
                  </span>
                </p>
                <p className="mb-4 text-sm text-zinc-400">
                  Prize:{" "}
                  <span className="font-bold text-green-400">
                    {(
                      (parseInt(challenge.bet_amount) * 2) /
                      1_000_000_000
                    ).toFixed(2)}{" "}
                    SUI
                  </span>
                </p>

                <div className="space-y-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        acceptChallenge(
                          challenge.id,
                          e.target.value,
                          challenge.bet_amount,
                        );
                      }
                    }}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select hero to battle...</option>
                    {heroes.map((hero) => (
                      <option key={hero.id} value={hero.id}>
                        {hero.name} (Lvl {hero.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedChallenges.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold text-white">
            Completed Battles ({completedChallenges.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedChallenges.map((battle) => (
              <div
                key={battle.id}
                className={`rounded-lg border p-4 ${
                  battle.isWinner
                    ? "border-green-600 bg-green-950/20"
                    : "border-red-600 bg-red-950/20"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold text-white ${
                      battle.isWinner ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {battle.isWinner ? "Victory! 🎉" : "Defeat 😢"}
                  </span>
                  <span className="text-2xl">
                    {battle.isWinner ? "👑" : "💔"}
                  </span>
                </div>

                <div className="mb-3 space-y-1">
                  <p className="text-sm text-zinc-400">
                    Your Power:{" "}
                    <span className="font-bold text-white">
                      {battle.isWinner
                        ? battle.winner_power
                        : battle.loser_power}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-400">
                    Enemy Power:{" "}
                    <span className="font-bold text-white">
                      {battle.isWinner
                        ? battle.loser_power
                        : battle.winner_power}
                    </span>
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 ${
                    battle.isWinner ? "bg-green-600/20" : "bg-red-600/20"
                  }`}
                >
                  <p className="text-center text-sm font-medium text-zinc-300">
                    {battle.isWinner ? "Won" : "Lost"}
                  </p>
                  <p
                    className={`text-center text-2xl font-bold ${
                      battle.isWinner ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {battle.isWinner ? "+" : "-"}
                    {(parseInt(battle.total_prize) / 1_000_000_000 / 2).toFixed(
                      2,
                    )}{" "}
                    SUI
                  </p>
                  <p className="mt-1 text-center text-xs text-zinc-500">
                    Total Prize:{" "}
                    {(parseInt(battle.total_prize) / 1_000_000_000).toFixed(2)}{" "}
                    SUI
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
