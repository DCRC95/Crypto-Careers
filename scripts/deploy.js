const hre = require("hardhat");

async function main() {
  console.log("Deploying ChainTalent contracts to Sepolia testnet...");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("");

  // Deploy TalentProfile contract
  console.log("Deploying TalentProfile contract...");
  const TalentProfile = await hre.ethers.getContractFactory("TalentProfile");
  const talentProfile = await TalentProfile.deploy();
  await talentProfile.waitForDeployment();
  const talentProfileAddress = await talentProfile.getAddress();
  console.log("TalentProfile deployed to:", talentProfileAddress);

  // Deploy BountyBoard contract
  console.log("Deploying BountyBoard contract...");
  const BountyBoard = await hre.ethers.getContractFactory("BountyBoard");
  const bountyBoard = await BountyBoard.deploy();
  await bountyBoard.waitForDeployment();
  const bountyBoardAddress = await bountyBoard.getAddress();
  console.log("BountyBoard deployed to:", bountyBoardAddress);

  console.log("");
  console.log("All contracts deployed successfully!");
  console.log("");
  console.log("Deployment Summary:");
  console.log("========================");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("TalentProfile:", talentProfileAddress);
  console.log("BountyBoard:", bountyBoardAddress);
  console.log("");
  console.log("Verify contracts on Etherscan:");
  console.log(`TalentProfile: https://sepolia.etherscan.io/address/${talentProfileAddress}`);
  console.log(`BountyBoard: https://sepolia.etherscan.io/address/${bountyBoardAddress}`);
  console.log("");
  console.log("Next steps:");
  console.log("1. Update your frontend with these contract addresses");
  console.log("2. Test the contracts with sample data");
  console.log("3. Deploy to mainnet when ready");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
