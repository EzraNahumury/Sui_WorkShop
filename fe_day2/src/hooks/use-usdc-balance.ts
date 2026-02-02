import { useCurrentAccount, useCurrentClient } from "@mysten/dapp-kit-react";
import { useQuery } from "@tanstack/react-query";
import { USDC_TYPE } from "@/lib/contracts";

export function useUsdcBalance() {
  const account = useCurrentAccount();
  const client = useCurrentClient();

  return useQuery({
    queryKey: ["usdc-balance", account?.address],
    queryFn: async () => {
      if (!account?.address) return { balance: 0n };
      const { objects } = await client.listCoins({
        owner: account.address,
        coinType: USDC_TYPE,
      });

      const balance = objects.reduce((sum, coin) => {
        const bal = (coin as { balance?: string | bigint }).balance;
        return sum + BigInt(String(bal ?? 0));
      }, 0n);

      return { balance };
    },
    enabled: !!account?.address,
    staleTime: 0,
    refetchInterval: 3000,
  });
}
