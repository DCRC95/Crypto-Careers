const { ethers } = require("hardhat");

async function main() {
  console.log("Creating sample bounties for ChainTalent...");
  
  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Get the deployed BountyBoard contract
  const BountyBoard = await ethers.getContractFactory("BountyBoard");
  const bountyBoard = BountyBoard.attach("0x608Ce99c6662101eA0E04fd4e9991F74978A7106");

  console.log("BountyBoard contract address:", bountyBoard.target);

  // Sample bounty data
  const bounties = [
    {
      title: "Smart Contract Bug Fix",
      description: "Fix a critical bug in our DeFi protocol's reward calculation. The issue causes incorrect token distribution during staking operations.",
      requiredSkills: ["Solidity", "DeFi", "Testing", "Security"],
      payment: ethers.parseEther("0.000001"), // 0.000001 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)) // 7 days from now
    },
    {
      title: "Frontend UI Component",
      description: "Create a responsive dashboard component for displaying user portfolio statistics. Should include charts and real-time data updates.",
      requiredSkills: ["React", "TypeScript", "Chart.js", "CSS"],
      payment: ethers.parseEther("0.0000005"), // 0.0000005 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60)) // 5 days from now
    },
    {
      title: "Blockchain Data Analysis",
      description: "Analyze transaction patterns on our platform and create a report identifying potential optimization opportunities.",
      requiredSkills: ["Python", "Data Analysis", "Blockchain", "SQL"],
      payment: ethers.parseEther("0.0000008"), // 0.0000008 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60)) // 10 days from now
    },
    {
      title: "Mobile App Integration",
      description: "Integrate our smart contract with a React Native mobile app. Need wallet connection and transaction signing capabilities.",
      requiredSkills: ["React Native", "Web3", "Mobile Development", "JavaScript"],
      payment: ethers.parseEther("0.0000003"), // 0.0000003 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60)) // 14 days from now
    },
    {
      title: "Documentation Update",
      description: "Update our technical documentation to include the new features and provide code examples for developers.",
      requiredSkills: ["Technical Writing", "Markdown", "API Documentation", "Git"],
      payment: ethers.parseEther("0.0000002"), // 0.0000002 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60)) // 3 days from now
    }
  ];

  console.log("\nCreating bounties...");
  console.log("=====================");

  for (let i = 0; i < bounties.length; i++) {
    const bounty = bounties[i];
    console.log(`\n${i + 1}. Creating bounty: "${bounty.title}"`);
    console.log(`   Payment: ${ethers.formatEther(bounty.payment)} ETH`);
    console.log(`   Skills: ${bounty.requiredSkills.join(", ")}`);
    console.log(`   Deadline: ${new Date(Number(bounty.deadline) * 1000).toLocaleDateString()}`);

    try {
      const tx = await bountyBoard.postBounty(
        bounty.title,
        bounty.description,
        bounty.requiredSkills,
        bounty.payment,
        bounty.deadline,
        { value: bounty.payment }
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Bounty created successfully! (Block: ${receipt.blockNumber})`);
      
      // Get the bounty ID
      const bountyCount = await bountyBoard.getBountyCount();
      console.log(`   Bounty ID: ${bountyCount - 1}`);

    } catch (error) {
      console.error(`   ❌ Failed to create bounty: ${error.message}`);
    }
  }

  console.log("\n=====================");
  console.log("Sample bounties creation completed!");
  
  // Display final bounty count
  const finalBountyCount = await bountyBoard.getBountyCount();
  console.log(`Total bounties on the board: ${finalBountyCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error creating bounties:", error);
    process.exit(1);
  });
