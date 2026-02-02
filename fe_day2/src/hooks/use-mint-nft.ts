import { useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACTS, NFT_MINT_PRICE, USDC_TYPE } from "@/lib/contracts";

export function useMintNft() {
  const account = useCurrentAccount();
  const { getClient, signAndExecuteTransaction } = useDAppKit();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const mint = async () => {
    if (!account?.address) return;

    setIsPending(true);
    try {
      const client = getClient();
      const { objects: coins } = await client.listCoins({
        owner: account.address,
        coinType: USDC_TYPE,
      });

      if (!coins.length) return;

      const tx = new Transaction();
      const [primaryCoin, ...otherCoins] = coins;

      if (otherCoins.length > 0) {
        tx.mergeCoins(
          tx.object(primaryCoin.objectId),
          otherCoins.map((c: { objectId: string }) => tx.object(c.objectId))
        );
      }

      const [paymentCoin] = tx.splitCoins(tx.object(primaryCoin.objectId), [
        tx.pure.u64(NFT_MINT_PRICE),
      ]);

      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::psil_nft::mint`,
        arguments: [tx.object(CONTRACTS.NFT_TREASURY), paymentCoin],
      });

      await signAndExecuteTransaction({ transaction: tx });
      queryClient.invalidateQueries({ queryKey: ["usdc-balance"] });
      queryClient.invalidateQueries({ queryKey: ["owned-nfts"] });
    } catch (error) {
      console.error("Mint NFT failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  return { mint, isPending };
}
