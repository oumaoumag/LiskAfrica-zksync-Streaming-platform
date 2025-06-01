import { Provider, Wallet, utils } from "zksync-ethers";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// This script demonstrates how to generate and verify proofs on zkSync
async function generateZkSyncProof() {
  console.log("🔐 zkSync Proof Generation Example\n");

  // Initialize provider and wallet
  const provider = new Provider("https://sepolia.era.zksync.dev");
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY!, provider);

  console.log("Wallet address:", wallet.address);

  try {
    // Get account info
    const accountInfo = await wallet.getAddress();
    console.log("\n📊 Account Information:");
    console.log("Address:", accountInfo);
    
    const balance = await wallet.getBalance();
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    // Example transaction for proof generation
    const zkTuneAddress = "YOUR_ZKTUNE_CONTRACT_ADDRESS"; // Replace with your deployed address
    const zkTuneABI = [
      "function registerUser(string memory _name, string memory _profileURI) external",
      "function totalUsers() external view returns (uint256)"
    ];

    const zkTuneContract = new ethers.Contract(zkTuneAddress, zkTuneABI, wallet);

    // Estimate gas for a transaction
    console.log("\n⛽ Estimating gas for transaction...");
    const gasEstimate = await zkTuneContract.registerUser.estimateGas(
      "Proof Test User",
      "https://example.com/proof-test"
    );
    console.log("Estimated gas:", gasEstimate.toString());

    // Get fee data
    const feeData = await provider.getFeeData();
    console.log("\n💰 Fee Data:");
    console.log("Gas price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
    console.log("Max fee per gas:", ethers.formatUnits(feeData.maxFeePerGas || 0, "gwei"), "gwei");
    console.log("Max priority fee:", ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, "gwei"), "gwei");

    // Create and send transaction
    console.log("\n📤 Sending transaction...");
    const tx = await zkTuneContract.registerUser(
      "Proof Test User",
      "https://example.com/proof-test"
    );
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");

    // Wait for transaction receipt
    const receipt = await tx.wait();
    console.log("\n✅ Transaction confirmed!");
    console.log("Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status === 1 ? "Success" : "Failed");

    // Get transaction details with proof
    console.log("\n🔍 Transaction Details:");
    const txDetails = await provider.getTransaction(tx.hash);
    console.log("From:", txDetails.from);
    console.log("To:", txDetails.to);
    console.log("Value:", ethers.formatEther(txDetails.value));
    console.log("Nonce:", txDetails.nonce);

    // Get block with transactions
    const block = await provider.getBlock(receipt.blockNumber, true);
    console.log("\n📦 Block Information:");
    console.log("Block hash:", block.hash);
    console.log("Parent hash:", block.parentHash);
    console.log("Timestamp:", new Date(block.timestamp * 1000).toISOString());
    console.log("Number of transactions:", block.transactions.length);

    // zkSync specific: Get L1 batch info
    const l1BatchNumber = await provider.getL1BatchNumber();
    console.log("\n🔗 L1 Batch Information:");
    console.log("Current L1 batch number:", l1BatchNumber);

    const l1BatchDetails = await provider.getL1BatchDetails(l1BatchNumber);
    console.log("L1 batch timestamp:", new Date(l1BatchDetails.timestamp * 1000).toISOString());
    console.log("L1 tx count:", l1BatchDetails.l1TxCount);
    console.log("L2 tx count:", l1BatchDetails.l2TxCount);

    // Get proof for the transaction
    console.log("\n🔐 Proof Generation:");
    console.log("Transaction included in L1 batch:", l1BatchNumber);
    console.log("Proof data available after L1 batch is committed to Ethereum");

    // Example of getting transaction proof (when available)
    try {
      const txProof = await provider.getTransactionReceipt(tx.hash);
      console.log("\n📜 Transaction Proof:");
      console.log("L1 batch number:", txProof.l1BatchNumber);
      console.log("L1 batch tx index:", txProof.l1BatchTxIndex);
      console.log("Logs bloom:", txProof.logsBloom);
    } catch (error) {
      console.log("Proof may not be available immediately after transaction");
    }

    // Get total users to verify state change
    const totalUsers = await zkTuneContract.totalUsers();
    console.log("\n📊 Contract State:");
    console.log("Total users after transaction:", totalUsers.toString());

    console.log("\n✨ zkSync proof example completed successfully!");
    console.log("\n💡 Note: Full merkle proofs are generated when the L1 batch is committed to Ethereum.");
    console.log("You can verify the transaction on the zkSync explorer:");
    console.log(`https://sepolia.explorer.zksync.io/tx/${tx.hash}`);

  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

// Run the example
generateZkSyncProof().catch(console.error);