import { ethers } from "ethers";
import * as hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Starting deployment to Lisk Sepolia...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  try {
    // Deploy zkTune contract
    console.log("\nDeploying zkTune contract...");
    const ZkTune = await hre.ethers.getContractFactory("zkTune");
    const zkTune = await ZkTune.deploy();
    await zkTune.waitForDeployment();
    const zkTuneAddress = await zkTune.getAddress();
    console.log("zkTune deployed to:", zkTuneAddress);

    // Deploy GeneralPaymaster contract
    console.log("\nDeploying GeneralPaymaster contract...");
    const GeneralPaymaster = await hre.ethers.getContractFactory("GeneralPaymaster");
    const paymaster = await GeneralPaymaster.deploy();
    await paymaster.waitForDeployment();
    const paymasterAddress = await paymaster.getAddress();
    console.log("GeneralPaymaster deployed to:", paymasterAddress);

    // Fund the paymaster
    const fundAmount = ethers.parseEther("0.1"); // Fund with 0.1 ETH
    console.log(`\nFunding paymaster with ${ethers.formatEther(fundAmount)} ETH...`);
    const fundTx = await deployer.sendTransaction({
      to: paymasterAddress,
      value: fundAmount
    });
    await fundTx.wait();
    console.log("Paymaster funded successfully!");

    // Verify deployment
    console.log("\nVerifying contracts on Lisk Sepolia Explorer...");
    try {
      await hre.run("verify:verify", {
        address: zkTuneAddress,
        constructorArguments: []
      });
      
      await hre.run("verify:verify", {
        address: paymasterAddress,
        constructorArguments: []
      });
      
      console.log("Contract verification successful!");
    } catch (error) {
      console.log("Verification failed:", error);
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\nContract addresses:");
    console.log(`zkTune: ${zkTuneAddress}`);
    console.log(`GeneralPaymaster: ${paymasterAddress}`);
    
    // Save deployment info
    const deploymentInfo = {
      network: "lisk-sepolia",
      chainId: 4202,
      contracts: {
        zkTune: zkTuneAddress,
        generalPaymaster: paymasterAddress
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });