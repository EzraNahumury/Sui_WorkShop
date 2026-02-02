import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { useMintUsdc } from "@/hooks/use-mint-usdc";
import { formatUSDC, USDC_MINT_AMOUNT } from "@/lib/contracts";
import { Loader2, Plus } from "lucide-react";

export function UsdcSection() {
  const account = useCurrentAccount();
  const { data } = useUsdcBalance();
  const { mint, isPending } = useMintUsdc();

  if (!account) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img
            src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
            alt="USDC"
            className="w-5 h-5"
          />
          USDC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Balance</span>
          <span className="text-lg font-bold">{formatUSDC(data?.balance ?? 0n)}</span>
        </div>

        <Button onClick={mint} disabled={isPending} className="w-full">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Mint {USDC_MINT_AMOUNT}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
