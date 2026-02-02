# Battle NFT Arena

Ini adalah proyek NFT Battle Arena di mana pengguna dapat mencetak (mint) Hero, melengkapinya dengan Aksesoris, dan bertarung melawan pemain lain untuk memenangkan SUI.

## Struktur Proyek

Proyek ini terdiri dari dua bagian utama:
1.  **Smart Contract (`battle_sc`)**: Logika on-chain yang ditulis dalam bahasa Move.
2.  **Frontend (`nft_battle_arena-fe`)**: Antarmuka pengguna yang dibangun dengan Next.js dan Sui dApp Kit.

---

## 1. Smart Contract (`battle_sc`)

Folder `battle_sc` berisi modul Move `hero_adventure.move` yang menangani semua logika permainan.

### Fitur Utama:
*   **Hero (`Hero` struct)**: Karakter utama dengan atribut seperti level, total kemenangan, dan kekalahan.
*   **Aksesoris (`Accessory` struct)**: Item yang dapat meningkatkan kekuatan Hero.
*   **Sistem Pertarungan**: Pemain dapat membuat dan menerima tantangan pertarungan dengan taruhan (bet) dalam bentuk SUI.

### Fungsi Penting:
*   `mint_hero`: Membuat Hero baru.
*   `mint_accessory`: Membuat Aksesoris baru.
*   `equip_accessory`: Memasang Aksesoris ke Hero.
*   `create_battle_challenge`: Membuat tantangan pertarungan baru dengan taruhan.
*   `accept_battle_challenge`: Menerima tantangan dari pemain lain.

---

## 2. Frontend (`nft_battle_arena-fe`)

Frontend dibangun menggunakan **Next.js**, **TailwindCSS**, dan **Sui dApp Kit**.

### Komponen Utama:
*   **Adventure Dashboard**: Tempat utama untuk melihat status Hero dan memulai petualangan.
*   **Inventory**: Menampilkan koleksi Hero dan Aksesoris yang dimiliki pengguna.
*   **Battle Arena**: Area untuk melihat tantangan aktif dan bertarung melawan pemain lain.
*   **WalletConnect**: Komponen untuk menghubungkan dompet Sui pengguna.

---

## Cara Menjalankan Proyek (Step-by-Step)

Ikuti langkah-langkah berikut untuk menjalankan proyek ini dari awal.

### Prasyarat
*   [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) terinstal.
*   [Node.js](https://nodejs.org/) terinstal.

### Langkah 1: Deploy Smart Contract

1.  Buka terminal dan navigasikan ke folder `battle_sc`:
    ```bash
    cd battle_sc
    ```

2.  Build dan Publish smart contract ke jaringan Sui (pastikan Anda memiliki gas SUI):
    ```bash
    sui client publish --gas-budget 100000000
    ```

3.  **PENTING**: Setelah proses publish selesai, terminal akan menampilkan output JSON. Cari bagian **"Immutable"** atau **Package ID**. Salin ID tersebut (contoh: `0x...`).

### Langkah 2: Konfigurasi Frontend

1.  Buka file `nft_battle_arena-fe/lib/constants.ts`.
2.  Ganti nilai `PACKAGE_ID` dengan ID yang baru saja Anda salin:
    ```typescript
    export const PACKAGE_ID = "0xGANTI_DENGAN_PACKAGE_ID_BARU";
    ```
    *(Pastikan untuk menyimpan file setelah diedit)*

### Langkah 3: Jalankan Aplikasi Frontend

1.  Buka terminal baru dan navigasikan ke folder frontend:
    ```bash
    cd nft_battle_arena-fe
    ```

2.  Instal dependensi proyek:
    ```bash
    npm install
    ```
    *(atau `yarn install` / `pnpm install` jika Anda menggunakan package manager lain)*

3.  Jalankan server pengembangan:
    ```bash
    npm run dev
    ```

4.  Buka browser dan kunjungi [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

---

## Catatan Tambahan
*   Pastikan wallet Anda terhubung ke jaringan yang sama dengan tempat Anda mendeploy contract (Devnet/Testnet/Mainnet).
*   Gunakan faucet untuk mendapatkan SUI testnet/devnet jika diperlukan.
