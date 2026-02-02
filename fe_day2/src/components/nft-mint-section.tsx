import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { useMintNft } from "@/hooks/use-mint-nft";
import { formatUSDC, NFT_MINT_PRICE } from "@/lib/contracts";
import { Sparkles, Loader2 } from "lucide-react";

export function NftMintSection() {
  const account = useCurrentAccount();
  const { data: usdcData } = useUsdcBalance();
  const { mint, isPending } = useMintNft();

  if (!account) return null;

  const hasEnoughBalance = (usdcData?.balance ?? 0n) >= NFT_MINT_PRICE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Mint NFT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative rounded-lg overflow-hidden">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh1cpBR8d2D2P55Z2kQzlr6uGuhRfWzEnoVQ&s"
            alt="PSIL NFT"
            className="w-full aspect-square object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 p-3 text-white">
            <p className="font-bold">Pria Solo Itu Lagi</p>
            <p className="text-xs opacity-80">SAYA AKAN PULANG KE SOLO</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="font-bold">{formatUSDC(NFT_MINT_PRICE)} USDC</span>
        </div>

        {!hasEnoughBalance && (
          <p className="text-sm text-destructive">Insufficient USDC balance</p>
        )}

        <Button onClick={mint} disabled={isPending || !hasEnoughBalance} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1" />
              Mint
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
