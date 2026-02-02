# Sui Workshop Frontend

A modern decentralized application (dApp) frontend built for the Sui blockchain workshop. This application demonstrates key Sui features including wallet connection, token interactions, and NFT minting.

## Program Overview

This application serves as a practical example of a Sui dApp, featuring:

*   **Wallet Integration**: Seamless connection with Sui wallets using `@mysten/dapp-kit`.
*   **Token Operations**: Functionality to view and manage USDC tokens on the Sui network.
*   **NFT Capabilities**:
    *   **Minting**: Users can mint their own NFTs directly from the interface.
    *   **Gallery**: A visual gallery to display owned NFTs.

## Project Structure

The project follows a standard React/Vite structure with a focus on component modularity.

```
src/
├── main.tsx                # Application entry point, setup for Providers
├── App.tsx                 # Main layout and application logic
├── components/             # Reusable UI components
│   ├── providers.tsx       # Sui and QueryClient providers
│   ├── usdc-section.tsx    # Component for USDC token interactions
│   ├── nft-mint-section.tsx # Component for minting new NFTs
│   ├── nft-gallery.tsx     # Gallery component for displaying user NFTs
│   ├── wallet-status.tsx   # Widget showing connection status
│   └── ui/                 # Shared UI primitives (Buttons, Cards, etc.)
├── hooks/                  # Custom React hooks
└── lib/                    # Utility functions and helpers
```

### Key Files
*   **`src/main.tsx`**: Bootstraps the React application and wraps it with `Providers`.
*   **`src/components/providers.tsx`**: Configures the `SuiClientProvider` and `WalletProvider` to enable blockchain interactions.
*   **`src/App.tsx`**: Organizes the main view, switching between the welcome screen and the dashboard based on wallet connection status.

## Tech Stack

*   **Framework**: React 19 + Vite
*   **Styling**: Tailwind CSS 4
*   **Components**: Radix UI
*   **Sui Integration**: @mysten/dapp-kit, @mysten/sui
*   **State Management**: @tanstack/react-query

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd sui-workshop-fe-2
    ```

2.  **Install Dependencies**

    First, install the standard project dependencies:
    ```bash
    npm install
    ```

    **Important**: Run the following commands to install the specific required packages for Sui integration and state management:

    ```bash
    npm i @mysten/dapp-kit-react @mysten/sui
    npm install @tanstack/react-query
    ```

### Running the App

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

To create a production-ready build:

```bash
npm run build
```
