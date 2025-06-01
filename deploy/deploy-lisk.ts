import { ethers } from "ethers";
import * as hre from "hardhat";
import dotenv from "dotenv";

// Load environment variables 
dotenv.config();

async function main() {
    console.log("Starting deployment to Lisk Sepolia...");

  // Get the deployer account (first account from Hardhat’s signer list)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check the deployer’s balance to ensure sufficient funds for deployment
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  try {
    // Deploy the zkTune contract
    console.log("\nDeploying zkTune contract...");
    const ZkTune = await hre.ethers.getContractFactory("zkTune"); 
    const zkTune = await ZkTune.deploy(); 
    await zkTune.waitForDeployment(); 
    const zkTuneAddress = await zkTune.getAddress(); // Retrieve the deployed contract address
    console.log("zkTune deployed to:", zkTuneAddress);

     // Verify the zkTune contract on the Lisk Sepolia explorer
    console.log("\nVerifying zkTune contract on Lisk Sepolia Explorer...");
    try {
      await hre.run("verify:verify", {
        address: zkTuneAddress,
        constructorArguments: [] // No constructor arguments are passed to zkTune
      });
      console.log("zkTune contract verification successful!");
    } catch (error) {
      console.log("Verification failed:", error);
    }

    // Log completion and contract details
    console.log("\n🎉 Deployment completed successfully!");
    console.log("\nContract addresses:");
    console.log(`zkTune: ${zkTuneAddress}`);

  // Save and display deployment information for future reference
    const deploymentInfo = {
      network: "lisk-sepolia", 
      chainId: 4202, 
      contracts: {
        zkTune: zkTuneAddress // Only zkTune is deployed
      },
      deployer: deployer.address, 
      timestamp: new Date().toISOString() 
    };

    console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));
    
    return deploymentInfo;

  } catch (error) {
  
    console.error("\n❌ Deployment failed:", error);
    process.exit(1); 
  }
}

// Execute the main function and handle process exit
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1); 
  });