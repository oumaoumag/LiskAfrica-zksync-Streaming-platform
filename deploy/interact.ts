import { getWallet, getProvider } from "./utils";
import * as ethers from "ethers";
import { Contract } from "zksync-ethers";

// Import contract ABIs
import zkTuneArtifact from "../artifacts-zk/contracts/zkTune.sol/zkTune.json";
import songNFTArtifact from "../artifacts-zk/contracts/SongNFT.sol/SongNFT.json";

// Replace with your deployed contract addresses
const ZKTUNE_ADDRESS = "YOUR_ZKTUNE_CONTRACT_ADDRESS";

export default async function () {
  console.log("Starting interaction with zkTune platform...\n");

  const wallet = getWallet();
  const provider = getProvider();

  // Connect to zkTune contract
  const zkTune = new Contract(ZKTUNE_ADDRESS, zkTuneArtifact.abi, wallet);

  try {
    // 1. Register as an artist
    console.log("1. Registering as an artist...");
    const registerArtistTx = await zkTune.registerArtist(
      "Test Artist",
      "https://example.com/artist-profile"
    );
    await registerArtistTx.wait();
    console.log("✅ Artist registered successfully!");

    // 2. Add a song
    console.log("\n2. Adding a new song...");
    const nftPrice = ethers.parseEther("0.001"); // 0.001 ETH
    const addSongTx = await zkTune.addSong(
      "My First Song",
      "https://example.com/audio/song1.mp3",
      "https://example.com/covers/song1.jpg",
      nftPrice
    );
    const addSongReceipt = await addSongTx.wait();
    console.log("✅ Song added successfully!");

    // Get the song ID from events
    const songAddedEvent = addSongReceipt.logs.find(
      (log: any) => log.fragment && log.fragment.name === "SongAdded"
    );
    const songId = songAddedEvent ? songAddedEvent.args[0] : 1;
    console.log(`Song ID: ${songId}`);

    // 3. Get all songs
    console.log("\n3. Fetching all songs...");
    const allSongs = await zkTune.getAllSongs();
    console.log(`Total songs: ${allSongs.length}`);
    allSongs.forEach((song: any, index: number) => {
      console.log(`\nSong ${index + 1}:`);
      console.log(`- ID: ${song.id}`);
      console.log(`- Title: ${song.title}`);
      console.log(`- Artist: ${song.artist}`);
      console.log(`- Stream Count: ${song.streamCount}`);
    });

    // 4. Register as a user (using a different wallet)
    console.log("\n4. Registering as a user...");
    const registerUserTx = await zkTune.registerUser(
      "Test User",
      "https://example.com/user-profile"
    );
    await registerUserTx.wait();
    console.log("✅ User registered successfully!");

    // 5. Stream a song (mint NFT)
    console.log("\n5. Streaming a song (minting NFT)...");
    const streamTx = await zkTune.streamSong(songId, { value: nftPrice });
    const streamReceipt = await streamTx.wait();
    console.log("✅ Song streamed successfully! NFT minted.");

    // 6. Get artist's songs
    console.log("\n6. Fetching artist's songs...");
    const artistSongs = await zkTune.getSongsByArtist(wallet.address);
    console.log(`Artist has ${artistSongs.length} songs`);

    // 7. Get user's streamed songs
    console.log("\n7. Fetching user's streamed songs...");
    const userStreamedSongs = await zkTune.getSongsStreamedByUser(wallet.address);
    console.log(`User has streamed ${userStreamedSongs.length} songs`);

    // 8. Get platform statistics
    console.log("\n8. Platform Statistics:");
    const totalSongs = await zkTune.totalSongs();
    const totalArtists = await zkTune.totalArtists();
    const totalUsers = await zkTune.totalUsers();
    
    console.log(`- Total Songs: ${totalSongs}`);
    console.log(`- Total Artists: ${totalArtists}`);
    console.log(`- Total Users: ${totalUsers}`);

    console.log("\n✅ All interactions completed successfully!");

  } catch (error) {
    console.error("Error during interaction:", error);
  }
}