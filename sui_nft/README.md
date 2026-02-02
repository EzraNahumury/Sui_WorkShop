# Sui NFT Project

This project implements a simple NFT on the Sui blockchain.

## Commands

### Build
To build the project, run:
```bash
sui move build
```

### Publish
To publish the package to the Sui network, run:
```bash
sui client publish
```

### Mint NFT
To mint a new NFT to the sender, use the following command:
```bash
sui client call --package 0x447a5d28fc7b4d8a01f81cb6c0b4191d3cace550acfc78b0b40d04adc6884d00 --module sui_nft  --function mint_to_sender --args "DIAN SI NIAS" "nft anomali brainrot" "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc86GK0f6dYTIhxp72_gEK13lCjhg91MeXfg&s"
```
