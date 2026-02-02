import { useCurrentAccount, useCurrentClient } from "@mysten/dapp-kit-react";
import { useQuery } from "@tanstack/react-query";
import { NFT_TYPE } from "@/lib/contracts";

export interface PSILNFT {
  id: string;
  name: string;
  description: string;
  url: string;
  edition: number;
}

export function useOwnedNfts() {
  const account = useCurrentAccount();
  const client = useCurrentClient();

  return useQuery({
    queryKey: ["owned-nfts", account?.address],
    queryFn: async (): Promise<PSILNFT[]> => {
      if (!account?.address) return [];

      const { objects } = await client.listOwnedObjects({
        owner: account.address,
        type: NFT_TYPE,
        include: { json: true },
      });

      return objects
        .map((obj) => {
          const json = obj.json as Record<string, unknown> | null;
          if (!json) return null;
          return {
            id: obj.objectId || "",
            name: String(json.name || ""),
            description: String(json.description || ""),
            url: String(json.url || ""),
            edition: Number(json.edition || 0),
          };
        })
        .filter((nft): nft is PSILNFT => nft !== null);
    },
    enabled: !!account?.address,
    staleTime: 5000,
  });
}
