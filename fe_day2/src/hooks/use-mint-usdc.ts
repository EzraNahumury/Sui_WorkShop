import { useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACTS, USDC_MINT_AMOUNT, parseUSDC } from "@/lib/contracts";

export function useMintUsdc() {
  const account = useCurrentAccount();
  const { signAndExecuteTransaction } = useDAppKit();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const mint = async () => {
    if (!account?.address) return;

    setIsPending(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::usdc::mint_to`,
        arguments: [
          tx.object(CONTRACTS.USDC_TREASURY_CAP),
          tx.pure.u64(parseUSDC(USDC_MINT_AMOUNT)),
          tx.pure.address(account.address),
        ],
      });

      await signAndExecuteTransaction({ transaction: tx });
      queryClient.invalidateQueries({ queryKey: ["usdc-balance"] });
    } catch (error) {
      console.error("Mint USDC failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  return { mint, isPending };
}
