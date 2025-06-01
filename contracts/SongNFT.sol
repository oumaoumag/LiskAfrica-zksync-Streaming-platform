// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// An extension of the ERC721 standard to manage token URIs.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Provides basic access control mechanisms, allowing only the owner to execute certain functions.
import "@openzeppelin/contracts/access/Ownable.sol";
// Provides safe mathematical operations to prevent overflow and underflow errors.
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// SongNFT contract declaration
contract SongNFT is ERC721URIStorage, Ownable {
    // Importing SafeMath library
    using SafeMath for uint256;

    // Tracks the current token ID
    uint256 private _currentTokenId;
    // Price of the NFT
    uint256 public nftPrice;
    // Address of the artist
    address public artist;
    // URI of the audio file
    string public audioURI;
    // Accumulated royalties
    uint256 public royaltyBalance;
    // URI of the cover image
    string public coverURI;

    // Defining the struct NFTInfo to store comprehensive information of the NFT
    struct NFTInfo {
        uint256 nftPrice;           // Price of the NFT
        address artist;             // Address of the artist
        string audioURI;            // URI of the audio file
        string coverURI;            // URI of the cover image
        uint256 royaltyBalance;     // Balance of royalties
        uint256 currentTokenId;     // Current token ID
    } 

    // Declaring a constant representing the royalty percentage (30%) on NFT minting
    uint256 public constant ROYALTY_PERCENTAGE = 30;

    // Triggered when a new NFT is minted
    event NFTMinted(uint256 indexed tokenId, address indexed buyer, uint256 price);
    // Triggered when royalties are collected
    event RoyaltyCollected(uint256 indexed tokenId, uint256 amount);
    // Triggered when royalties are paid out to the artist
    event RoyaltyPaid(address indexed artist, uint256 amount);

    // The modifier restricts function access to users who own at least one NFT
    modifier onlyMintedUser(address user) {
        require(balanceOf(user) > 0, "Don't own the NFT");
        _;
    }

    // The constructor will initialize the state variables using the input parameters
    constructor(string memory _name, string memory _symbol, uint256 _nftPrice,
    string memory _audioURI, address _artist, string memory _coverURI) ERC721(_name, _symbol) {
        nftPrice = _nftPrice;
        audioURI = _audioURI;
        artist = _artist;
        coverURI = _coverURI;
        _currentTokenId = 0;
    }

    // Mint the new NFT
    function mintNFT(address _to) external payable returns (uint256) {
        require(msg.value >= nftPrice, "Insufficient payment");
        
        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;

        uint256 royaltyAmount = msg.value.mul(ROYALTY_PERCENTAGE).div(100);
        royaltyBalance = royaltyBalance.add(royaltyAmount);

        _safeMint(_to, newTokenId);
        _setTokenURI(newTokenId, audioURI);

        emit RoyaltyCollected(newTokenId, royaltyAmount);
        emit NFTMinted(newTokenId, _to, msg.value);

        return newTokenId;
    }

    // payRoyalties function pays out the accumulated royalties to the artist
    function payRoyalties() external {
        uint256 amount = royaltyBalance;
        royaltyBalance = 0;

        (bool success, ) = payable(artist).call{value: amount}("");
        require(success, "Royalty payout failed");

        emit RoyaltyPaid(artist, amount);
    }

    // Retrieves comprehensive information about the NFT
    function getInfo(address user) external view onlyMintedUser(user) returns (NFTInfo memory) {
        return NFTInfo({
            nftPrice: nftPrice,
            artist: artist,
            audioURI: audioURI,
            coverURI: coverURI,
            royaltyBalance: royaltyBalance,
            currentTokenId: _currentTokenId
        });
    }
}