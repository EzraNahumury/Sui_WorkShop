# NIAS 69 (DIAN) Token

Project ini adalah implementasi Move Smart Contract untuk membuat Coin custom di jaringan Sui bernama **NIAS 69** dengan simbol **DIAN**.

## Deskripsi

Kontrak ini mendefinisikan mata uang baru yang diatur oleh modul `sui_token`.
- **Nama Coin**: NIAS 69
- **Simbol**: DIAN
- **Desimal**: 6
- **Deskripsi**: "NIAS ANJING 69"
- **Icon**: Url gambar custom

Pada saat deployment (publish), `TreasuryCap` akan dikirimkan ke pengirim (deployer), yang memberikan hak otorisasi untuk melakukan minting token baru.

## Eksekusi

Berikut adalah perintah-perintah untuk membangun, mempublikasikan, dan melakukan minting token:

### 1. Build Contract
Pastikan kode Move valid dan dependencies terinstall.

```bash
sui move build
```

### 2. Publish Contract
Mempublikasikan modul ke jaringan Sui (Testnet/Devnet/Mainnet tergantung konfigurasi aktif).

```bash
sui client publish
```

### 3. Mint Token
Memanggil fungsi `mint` untuk mencetak token baru.

**Parameter:**
- `package`: ID dari package yang sudah di-publish (didapat setelah publish).
- `function`: `mint`.
- `args`:
    1. `TreasuryCap` Object ID (didapat setelah publish).
    2. Jumlah token (dalam satuan terkecil, misal 6 desimal).
    3. Alamat penerima (`recipient address`).

Contoh perintah:

```bash
sui client call --package 0xc264a0b869bc7fcec949de930a6a7a3d8edac60a33627f22fb3d58510d2b548b --module sui_token --function mint --args 0x1cea0ef1c3403a9b7fe9ccade56f81b43c4a5361d1aeba64c83dcb6bdaa42889 "5000000000" 0x8c4551885e339c4b2cd88cb96f0fe34186a5a1dd03667957187c257c02e88776 --gas-budget 20000000
```
