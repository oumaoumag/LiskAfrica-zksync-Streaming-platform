import { deployContract, getWallet } from "./utils";
import * as ethers from "ethers";

export default async function () {
  console.log("Starting deployment process...");

  // Deploy zkTune contract
  const zkTuneContract = await deployContract("zkTune");
  const zkTuneAddress = await zkTuneContract.getAddress();
  console.log(`zkTune contract deployed at: ${zkTuneAddress}`);

  // Deploy GeneralPaymaster contract
  const paymasterContract = await deployContract("GeneralPaymaster");
  const paymasterAddress = await paymasterContract.getAddress();
  console.log(`GeneralPaymaster contract deployed at: ${paymasterAddress}`);

  // Fund the paymaster with some ETH
  const wallet = getWallet();
  const fundAmount = ethers.parseEther("0.1"); // Fund with 0.1 ETH
  
  console.log(`Funding paymaster with ${ethers.formatEther(fundAmount)} ETH...`);
  const fundTx = await wallet.sendTransaction({
    to: paymasterAddress,
    value: fundAmount
  });
  await fundTx.wait();
  console.log("Paymaster funded successfully!");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("Contract addresses:");
  console.log(`- zkTune: ${zkTuneAddress}`);
  console.log(`- GeneralPaymaster: ${paymasterAddress}`);
  
  return {
    zkTune: zkTuneAddress,
    paymaster: paymasterAddress
  };
}