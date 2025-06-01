# LiskAfrica zkSync Streaming Platform

A decentralized music streaming platform built on zkSync, Lisk, and Optimism networks. This platform enables artists to upload songs as NFTs, receive royalties, and allows users to stream music by purchasing NFTs.

## 🎵 Overview

The platform consists of three main smart contracts:

### 1. **SongNFT Contract**

The core NFT contract that represents individual songs on the platform.

**Purpose & Functioning**:

* **Minting**: When a user wants to stream a song, they call `mintNFT(address _to)` on the SongNFT contract it deploys. This mints a unique NFT to the user’s address, granting them access to the audio file.
* **Royalties**: On each mint, 30% of the payment is automatically allocated to the contract’s `royaltyBalance` via the `ROYALTY_PERCENTAGE` constant. Artists can withdraw their accumulated royalties by calling `payRoyalties()`, which transfers the balance to the artist’s address.
* **Metadata Storage**: Song metadata (audio URI, cover image URI, NFT price, and artist address) is initialized in the constructor and stored in state variables.
* **Access Control**: Only NFT holders can call `getInfo(address user)` to retrieve the NFT details, enforced by the `onlyMintedUser` modifier.

**Key Functions**:

* `mintNFT(address _to) payable returns (uint256)`: Mints an NFT to the buyer if payment ≥ `nftPrice`. Emits `NFTMinted` and `RoyaltyCollected` events.
* `payRoyalties()`: Transfers the accumulated `royaltyBalance` to the artist and resets the balance. Emits `RoyaltyPaid`.
* `getInfo(address user) view returns (NFTInfo)`: Returns comprehensive NFT details for holders.

### 2. **zkTune Contract**

The main platform contract that orchestrates artist/user registration, song catalog management, and streaming logic.

**Purpose & Functioning**:

* **Registration**: Allows artists and users to register via `registerArtist()` and `registerUser()`. Registration stores name and profile URI, increments platform statistics, and emits events.
* **Song Management**: Artists call `addSong(...)` to deploy a new SongNFT contract for each song. The function records song metadata (title, URIs, price, timestamp) in a `Song` struct and tracks it in mappings and arrays.
* **Streaming**: When a user streams via `streamSong(uint256 _songId) payable`, the contract checks if they already own the NFT. If not, it forwards the payment to `songNFT.mintNFT`, marks ownership in `userHasNFT`, increments the song’s `streamCount`, records history, and emits `SongStreamed`. Always returns the `audioURI` for playback.
* **Queries**: Provides view functions—`getAllSongs()`, `getAllArtists()`, `getSongsByArtist()`, and `getSongsStreamedByUser()`—returning arrays of structs for client consumption.

**Key Functions**:

* `registerArtist(string _name, string _profileURI)`: Registers new artists. Emits `ArtistRegistered`.
* `registerUser(string _name, string _profileURI)`: Registers new users. Emits `UserRegistered`.
* `addSong(string _title, string _audioURI, string _coverURI, uint256 _nftPrice)`: Deploys a SongNFT, records song data, and emits `SongAdded`.
* `streamSong(uint256 _songId) payable returns (string memory)`: Handles minting and streaming logic, emits `SongStreamed`, and returns the audio URI.

### 3. **GeneralPaymaster Contract**

Implements zkSync’s account abstraction to sponsor gas fees for users, enabling gasless transactions.

**Purpose & Functioning**:

* **Validation & Payment**: The bootloader calls `validateAndPayForPaymasterTransaction(...)` with the transaction details. If the transaction uses the general paymaster flow, it calculates the fee (`gasLimit * maxFeePerGas`) and transfers ETH from the paymaster’s balance to the bootloader, enabling the user to transact without paying gas directly.
* **Funds Management**: The contract owner can deposit ETH and withdraw unspent funds via `withdraw(address _to)`.
* **Security**: Restricted to calls from the zkSync bootloader (`onlyBootloader` modifier), guarding against unauthorized fee payments.

**Key Functions**:

* `validateAndPayForPaymasterTransaction(...) external payable onlyBootloader returns (bytes4, bytes memory)`: Validates the input selector and pays the fee.
* `postTransaction(...) external payable override onlyBootloader`: Placeholder for any post-transaction logic (empty here).
* `withdraw(address payable _to) external onlyOwner`: Allows the owner to withdraw contract balance.

## 🚀 Deployment

### Prerequisites

* Node.js v16+ and npm
* A wallet with testnet ETH on your target network
* Private key set in `.env` as `WALLET_PRIVATE_KEY`

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Bratipah/LiskAfrica-zksync-Streaming-platform.git
cd LiskAfrica-zksync-Streaming-platform
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
cp .env.example .env
```

4. Add your private key to `.env`:

```
WALLET_PRIVATE_KEY=your_private_key_here
```

## 🔧 Usage Flow

1. **Artist Registration**: Call `registerArtist(name, profileURI)` on `zkTune`.
2. **Song Upload**: Call `addSong(title, audioURI, coverURI, nftPrice)` as a registered artist.
3. **User Registration**: Call `registerUser(name, profileURI)` on `zkTune`.
4. **Song Streaming**: Call `streamSong(songId)` with ETH payment to mint the NFT and receive the audio URI.
5. **Royalty Withdrawal**: Call `payRoyalties()` on the specific SongNFT contract as an artist.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
