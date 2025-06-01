# LiskAfrica zkSync Streaming Platform

A decentralized music streaming platform built on zkSync, Lisk, and Optimism networks. This platform enables artists to upload songs as NFTs, receive royalties, and allows users to stream music by purchasing NFTs.

## 🎵 Overview

The platform consists of three main smart contracts:

### 1. **SongNFT Contract**
The core NFT contract that represents individual songs on the platform.

**Key Features:**
- Mints unique NFTs for each song purchase
- Implements a 30% royalty mechanism on each mint
- Stores song metadata (audio URI, cover image, artist info)
- Provides access control through NFT ownership
- Allows artists to withdraw accumulated royalties

**Functions:**
- `mintNFT(address _to)`: Mints a new NFT to the specified address
- `payRoyalties()`: Allows withdrawal of accumulated royalties to the artist
- `getInfo(address user)`: Returns comprehensive NFT information for NFT holders

### 2. **zkTune Contract**
The main platform contract that manages artists, users, and songs.

**Key Features:**
- Artist and user registration system
- Song catalog management
- Deploys individual SongNFT contracts for each song
- Tracks streaming history and statistics
- Provides comprehensive query functions

**Functions:**
- `registerArtist(string _name, string _profileURI)`: Register as an artist
- `registerUser(string _name, string _profileURI)`: Register as a user
- `addSong(string _title, string _audioURI, string _coverURI, uint256 _nftPrice)`: Add a new song (artists only)
- `streamSong(uint256 _songId)`: Stream a song by purchasing its NFT
- `getAllSongs()`: Get all songs on the platform
- `getSongsByArtist(address _artist)`: Get all songs by a specific artist
- `getSongsStreamedByUser(address _user)`: Get user's streaming history

### 3. **GeneralPaymaster Contract**
Implements zkSync's account abstraction for gasless transactions.

**Key Features:**
- Pays transaction fees on behalf of users
- Implements zkSync paymaster interface
- Owner-controlled fund management

## 🚀 Deployment

### Prerequisites
- Node.js v16+ and npm
- A wallet with testnet ETH on your target network
- Private key for deployment

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

### Compilation

Compile the smart contracts:
```bash
npm run compile
```

### Deployment

#### Deploy to zkSync Sepolia:
```bash
npm run deploy
```

#### Deploy to Lisk Sepolia:
```bash
npx hardhat run deploy/deploy-lisk.ts --network liskSepolia
```

#### Deploy to Optimism Sepolia:
```bash
npx hardhat run deploy/deploy-lisk.ts --network optimismSepolia
```

## 🔧 Contract Architecture

### Data Structures

**Artist Struct:**
```solidity
struct Artist {
    string name;
    string profileURI;
}
```

**User Struct:**
```solidity
struct User {
    string name;
    string profileURI;
}
```

**Song Struct:**
```solidity
struct Song {
    uint256 id;
    address artist;
    string title;
    string audioURI;
    string coverURI;
    uint256 streamCount;
    address songNFTAddress;
}
```

### Key Mappings
- `artists`: Maps artist addresses to their profiles
- `users`: Maps user addresses to their profiles
- `songs`: Maps song IDs to song data
- `userHasNFT`: Tracks NFT ownership for streaming access
- `artistSongs`: Maps artists to their song collections
- `userStreams`: Maps users to their streaming history

## 🎯 Usage Flow

1. **Artist Registration**: Artists register on the platform with their profile information
2. **Song Upload**: Artists add songs with metadata and set NFT prices
3. **User Registration**: Users create profiles to access the platform
4. **Song Streaming**: Users purchase song NFTs to gain streaming access
5. **Royalty Collection**: Artists can withdraw accumulated royalties from their songs

## 🔐 Security Features

- **Access Control**: Only registered artists can add songs
- **NFT-based Access**: Streaming requires NFT ownership
- **Royalty Protection**: 30% of NFT sales automatically allocated to artists
- **Safe Math**: Uses OpenZeppelin's SafeMath for arithmetic operations
- **Ownership Modifiers**: Critical functions protected by ownership checks

## 📊 Platform Statistics

The platform tracks:
- Total number of songs
- Total number of artists
- Total number of users
- Individual song stream counts
- User streaming history

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🔍 Verification

After deployment, verify your contracts on the block explorer:

```bash
npx hardhat verify --network liskSepolia YOUR_CONTRACT_ADDRESS
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

Built with ❤️ for the Lisk Africa Bootcamp