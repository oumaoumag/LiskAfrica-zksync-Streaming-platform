import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("zkTune Platform", function () {
  let zkTune: Contract;
  let songNFT: Contract;
  let owner: Signer;
  let artist: Signer;
  let user: Signer;
  let user2: Signer;

  const songTitle = "Test Song";
  const audioURI = "https://example.com/audio/test.mp3";
  const coverURI = "https://example.com/cover/test.jpg";
  const nftPrice = ethers.parseEther("0.001");

  beforeEach(async function () {
    [owner, artist, user, user2] = await ethers.getSigners();

    // Deploy zkTune contract
    const ZkTune = await ethers.getContractFactory("zkTune");
    zkTune = await ZkTune.deploy();
    await zkTune.waitForDeployment();
  });

  describe("Artist Registration", function () {
    it("Should register a new artist", async function () {
      await expect(zkTune.connect(artist).registerArtist("Test Artist", "https://profile.com"))
        .to.emit(zkTune, "ArtistRegistered")
        .withArgs(await artist.getAddress(), "Test Artist");

      const artistData = await zkTune.artists(await artist.getAddress());
      expect(artistData.name).to.equal("Test Artist");
      expect(artistData.profileURI).to.equal("https://profile.com");
    });

    it("Should not allow duplicate artist registration", async function () {
      await zkTune.connect(artist).registerArtist("Test Artist", "https://profile.com");
      
      await expect(zkTune.connect(artist).registerArtist("Another Name", "https://profile2.com"))
        .to.be.revertedWith("Artist already registered");
    });
  });

  describe("User Registration", function () {
    it("Should register a new user", async function () {
      await expect(zkTune.connect(user).registerUser("Test User", "https://userprofile.com"))
        .to.emit(zkTune, "UserRegistered")
        .withArgs(await user.getAddress(), "Test User");

      const userData = await zkTune.users(await user.getAddress());
      expect(userData.name).to.equal("Test User");
      expect(userData.profileURI).to.equal("https://userprofile.com");
    });

    it("Should not allow duplicate user registration", async function () {
      await zkTune.connect(user).registerUser("Test User", "https://userprofile.com");
      
      await expect(zkTune.connect(user).registerUser("Another User", "https://profile2.com"))
        .to.be.revertedWith("User already registered");
    });
  });

  describe("Song Management", function () {
    beforeEach(async function () {
      await zkTune.connect(artist).registerArtist("Test Artist", "https://profile.com");
    });

    it("Should add a new song", async function () {
      await expect(zkTune.connect(artist).addSong(songTitle, audioURI, coverURI, nftPrice))
        .to.emit(zkTune, "SongAdded");

      const songs = await zkTune.getAllSongs();
      expect(songs.length).to.equal(1);
      expect(songs[0].title).to.equal(songTitle);
      expect(songs[0].artist).to.equal(await artist.getAddress());
    });

    it("Should not allow non-artists to add songs", async function () {
      await expect(zkTune.connect(user).addSong(songTitle, audioURI, coverURI, nftPrice))
        .to.be.revertedWith("Artist not registered");
    });
  });

  describe("Song Streaming", function () {
    let songId: number;

    beforeEach(async function () {
      await zkTune.connect(artist).registerArtist("Test Artist", "https://profile.com");
      await zkTune.connect(user).registerUser("Test User", "https://userprofile.com");
      
      const tx = await zkTune.connect(artist).addSong(songTitle, audioURI, coverURI, nftPrice);
      const receipt = await tx.wait();
      
      // Get song ID from event
      const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === "SongAdded");
      songId = event ? event.args[0] : 1;
    });

    it("Should stream a song by minting NFT", async function () {
      await expect(zkTune.connect(user).streamSong(songId, { value: nftPrice }))
        .to.emit(zkTune, "SongStreamed")
        .withArgs(songId, await user.getAddress());

      // Check that user now has the NFT
      const hasNFT = await zkTune.userHasNFT(songId, await user.getAddress());
      expect(hasNFT).to.be.true;

      // Check stream count increased
      const song = await zkTune.songs(songId);
      expect(song.streamCount).to.equal(1);
    });

    it("Should return audio URI for existing NFT holders", async function () {
      // First stream
      await zkTune.connect(user).streamSong(songId, { value: nftPrice });
      
      // Second stream should not require payment
      const audioURIReturned = await zkTune.connect(user).streamSong.staticCall(songId);
      expect(audioURIReturned).to.equal(audioURI);
    });

    it("Should fail if insufficient payment", async function () {
      const insufficientAmount = ethers.parseEther("0.0001");
      await expect(zkTune.connect(user).streamSong(songId, { value: insufficientAmount }))
        .to.be.reverted;
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await zkTune.connect(artist).registerArtist("Test Artist", "https://profile.com");
      await zkTune.connect(user).registerUser("Test User", "https://userprofile.com");
      
      // Add multiple songs
      await zkTune.connect(artist).addSong("Song 1", audioURI, coverURI, nftPrice);
      await zkTune.connect(artist).addSong("Song 2", audioURI, coverURI, nftPrice);
    });

    it("Should get all songs", async function () {
      const songs = await zkTune.getAllSongs();
      expect(songs.length).to.equal(2);
      expect(songs[0].title).to.equal("Song 1");
      expect(songs[1].title).to.equal("Song 2");
    });

    it("Should get songs by artist", async function () {
      const artistSongs = await zkTune.getSongsByArtist(await artist.getAddress());
      expect(artistSongs.length).to.equal(2);
    });

    it("Should get user's streamed songs", async function () {
      // Stream both songs
      await zkTune.connect(user).streamSong(1, { value: nftPrice });
      await zkTune.connect(user).streamSong(2, { value: nftPrice });

      const userSongs = await zkTune.getSongsStreamedByUser(await user.getAddress());
      expect(userSongs.length).to.equal(2);
    });
  });

  describe("Platform Statistics", function () {
    it("Should track platform statistics correctly", async function () {
      // Register entities
      await zkTune.connect(artist).registerArtist("Artist 1", "https://profile1.com");
      await zkTune.connect(user).registerUser("User 1", "https://user1.com");
      await zkTune.connect(user2).registerUser("User 2", "https://user2.com");
      
      // Add songs
      await zkTune.connect(artist).addSong("Song 1", audioURI, coverURI, nftPrice);
      await zkTune.connect(artist).addSong("Song 2", audioURI, coverURI, nftPrice);

      // Check statistics
      expect(await zkTune.totalArtists()).to.equal(1);
      expect(await zkTune.totalUsers()).to.equal(2);
      expect(await zkTune.totalSongs()).to.equal(2);
    });
  });
});

describe("SongNFT Contract", function () {
  let songNFT: Contract;
  let artist: Signer;
  let user: Signer;
  
  const nftPrice = ethers.parseEther("0.001");

  beforeEach(async function () {
    [artist, user] = await ethers.getSigners();

    const SongNFT = await ethers.getContractFactory("SongNFT");
    songNFT = await SongNFT.deploy(
      "Test Song",
      "TST",
      nftPrice,
      "https://audio.com/song.mp3",
      await artist.getAddress(),
      "https://cover.com/image.jpg"
    );
    await songNFT.waitForDeployment();
  });

  describe("NFT Minting", function () {
    it("Should mint NFT with correct payment", async function () {
      await expect(songNFT.connect(user).mintNFT(await user.getAddress(), { value: nftPrice }))
        .to.emit(songNFT, "NFTMinted");

      expect(await songNFT.balanceOf(await user.getAddress())).to.equal(1);
    });

    it("Should collect royalties", async function () {
      await songNFT.connect(user).mintNFT(await user.getAddress(), { value: nftPrice });
      
      const royaltyBalance = await songNFT.royaltyBalance();
      const expectedRoyalty = nftPrice * 30n / 100n;
      expect(royaltyBalance).to.equal(expectedRoyalty);
    });

    it("Should fail with insufficient payment", async function () {
      const insufficientAmount = ethers.parseEther("0.0001");
      await expect(songNFT.connect(user).mintNFT(await user.getAddress(), { value: insufficientAmount }))
        .to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Royalty Management", function () {
    it("Should pay royalties to artist", async function () {
      // Mint NFT to generate royalties
      await songNFT.connect(user).mintNFT(await user.getAddress(), { value: nftPrice });
      
      const royaltyBalance = await songNFT.royaltyBalance();
      const artistBalanceBefore = await ethers.provider.getBalance(await artist.getAddress());
      
      await expect(songNFT.payRoyalties())
        .to.emit(songNFT, "RoyaltyPaid")
        .withArgs(await artist.getAddress(), royaltyBalance);
      
      const artistBalanceAfter = await ethers.provider.getBalance(await artist.getAddress());
      expect(artistBalanceAfter).to.be.gt(artistBalanceBefore);
      expect(await songNFT.royaltyBalance()).to.equal(0);
    });
  });

  describe("NFT Info", function () {
    it("Should return NFT info for holders", async function () {
      await songNFT.connect(user).mintNFT(await user.getAddress(), { value: nftPrice });
      
      const info = await songNFT.connect(user).getInfo(await user.getAddress());
      expect(info.nftPrice).to.equal(nftPrice);
      expect(info.artist).to.equal(await artist.getAddress());
      expect(info.audioURI).to.equal("https://audio.com/song.mp3");
      expect(info.coverURI).to.equal("https://cover.com/image.jpg");
    });

    it("Should not return info for non-holders", async function () {
      await expect(songNFT.connect(user).getInfo(await user.getAddress()))
        .to.be.revertedWith("Don't own the NFT");
    });
  });
});