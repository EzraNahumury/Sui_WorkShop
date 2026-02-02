export const CONTRACTS = {
  PACKAGE_ID: "0xa552a0057e4795edb5b6e5f0fbc9af98e69628a8dc96f11a363675c65eda17b1",
  USDC_TREASURY_CAP: "0xb172a6fb5da46b56ccaaf3374b9fcc0a5955653c6190f9073433a3f16e95db4e",
  NFT_TREASURY: "0x100ecbcc66d76ea44161940ecc0a637b26d8dcfc4903c1d355d7db946c13ae9a",
} as const;

export const USDC_TYPE = `${CONTRACTS.PACKAGE_ID}::usdc::USDC`;
export const NFT_TYPE = `${CONTRACTS.PACKAGE_ID}::psil_nft::PSILNFT`;

export const USDC_DECIMALS = 6;
export const USDC_MINT_AMOUNT = 100;
export const NFT_MINT_PRICE = 100_000_000n;

export const formatUSDC = (amount: bigint | number): string => {
  const value = Number(amount) / 10 ** USDC_DECIMALS;
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const parseUSDC = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 10 ** USDC_DECIMALS));
};
