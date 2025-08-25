const { ethers } = require("hardhat");

async function main() {
  console.log("Posting 15 bounties for ChainTalent on Sepolia...");
  
  // Check if we have the required environment variables
  if (!process.env.SEPOLIA_URL || !process.env.PRIVATE_KEY) {
    console.error("❌ Missing required environment variables:");
    console.error("   - SEPOLIA_URL: Your Sepolia RPC endpoint");
    console.error("   - PRIVATE_KEY: Your wallet private key");
    console.error("\nPlease check your .env file and ensure these are set.");
    process.exit(1);
  }

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Check balance on Sepolia
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.1")) {
    console.error("❌ Insufficient balance on Sepolia. Please fund your account with at least 0.1 ETH.");
    console.error("You can get test ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  // Get the deployed BountyBoard contract (using the correct address from subgraph)
  const BountyBoard = await ethers.getContractFactory("BountyBoard");
  const bountyBoard = BountyBoard.attach("0xBDb394D66FfAB12000336b4Bb174105C50Df702e");

  console.log("BountyBoard contract address:", bountyBoard.target);

  // 15 diverse bounty data
  const bounties = [
    {
      title: "DeFi Protocol Security Audit",
      description: "Conduct a comprehensive security audit of our DeFi lending protocol. Focus on smart contract vulnerabilities, reentrancy attacks, and economic exploits. Must provide detailed report with recommendations.",
      requiredSkills: ["Solidity", "Security", "DeFi", "Auditing", "Penetration Testing"],
      payment: ethers.parseEther("0.001"), // 0.001 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60)) // 14 days
    },
    {
      title: "React dApp Dashboard",
      description: "Build a modern dashboard for our DeFi platform using React and TypeScript. Include portfolio overview, transaction history, and real-time price feeds. Must be responsive and mobile-friendly.",
      requiredSkills: ["React", "TypeScript", "Web3.js", "CSS", "Responsive Design"],
      payment: ethers.parseEther("0.0008"), // 0.0008 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60)) // 10 days
    },
    {
      title: "Smart Contract Gas Optimization",
      description: "Analyze and optimize our smart contracts for gas efficiency. Identify expensive operations and suggest improvements. Must reduce gas costs by at least 20% while maintaining functionality.",
      requiredSkills: ["Solidity", "Gas Optimization", "Ethereum", "Assembly", "Profiling"],
      payment: ethers.parseEther("0.0006"), // 0.0006 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)) // 7 days
    },
    {
      title: "Blockchain Data Analytics Platform",
      description: "Create a data analytics platform that processes on-chain data from our protocol. Include dashboards for TVL, user growth, and transaction volume. Use Python and SQL for backend processing.",
      requiredSkills: ["Python", "SQL", "Data Analysis", "Blockchain", "Dashboard Creation"],
      payment: ethers.parseEther("0.0007"), // 0.0007 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (12 * 24 * 60 * 60)) // 12 days
    },
    {
      title: "Mobile Wallet Integration",
      description: "Integrate our smart contracts with a React Native mobile app. Implement wallet connection, transaction signing, and push notifications. Must support both iOS and Android platforms.",
      requiredSkills: ["React Native", "Mobile Development", "Web3", "Wallet Integration", "Push Notifications"],
      payment: ethers.parseEther("0.0009"), // 0.0009 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60)) // 15 days
    },
    {
      title: "Smart Contract Testing Suite",
      description: "Develop comprehensive testing suite for our smart contracts using Hardhat and Foundry. Include unit tests, integration tests, and fuzzing tests. Must achieve 95%+ code coverage.",
      requiredSkills: ["Hardhat", "Foundry", "Testing", "Solidity", "Code Coverage"],
      payment: ethers.parseEther("0.0005"), // 0.0005 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (8 * 24 * 60 * 60)) // 8 days
    },
    {
      title: "UI/UX Design System",
      description: "Create a comprehensive design system for our DeFi platform. Include component library, style guide, and design tokens. Must be consistent with modern DeFi design trends and accessible.",
      requiredSkills: ["UI/UX Design", "Figma", "Design Systems", "Accessibility", "Component Libraries"],
      payment: ethers.parseEther("0.0006"), // 0.0006 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (9 * 24 * 60 * 60)) // 9 days
    },
    {
      title: "Backend API Development",
      description: "Build a robust backend API for our platform using Node.js and Express. Include user authentication, data validation, and rate limiting. Must be scalable and secure.",
      requiredSkills: ["Node.js", "Express", "API Development", "Authentication", "Security"],
      payment: ethers.parseEther("0.0007"), // 0.0007 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (11 * 24 * 60 * 60)) // 11 days
    },
    {
      title: "Smart Contract Documentation",
      description: "Write comprehensive technical documentation for our smart contracts. Include API reference, deployment guides, and integration examples. Must be developer-friendly and up-to-date.",
      requiredSkills: ["Technical Writing", "Solidity", "Documentation", "API Reference", "Markdown"],
      payment: ethers.parseEther("0.0004"), // 0.0004 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (6 * 24 * 60 * 60)) // 6 days
    },
    {
      title: "Performance Optimization",
      description: "Optimize our frontend application for performance and user experience. Implement lazy loading, code splitting, and caching strategies. Must improve Core Web Vitals scores.",
      requiredSkills: ["Performance", "React", "Web Vitals", "Optimization", "Caching"],
      payment: ethers.parseEther("0.0005"), // 0.0005 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)) // 7 days
    },
    {
      title: "Cross-Chain Bridge Integration",
      description: "Integrate our protocol with multiple blockchain networks using cross-chain bridges. Support Ethereum, Polygon, and Arbitrum. Must ensure security and user experience consistency.",
      requiredSkills: ["Cross-Chain", "Bridge Integration", "Multi-Chain", "Security", "User Experience"],
      payment: ethers.parseEther("0.0012"), // 0.0012 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (18 * 24 * 60 * 60)) // 18 days
    },
    {
      title: "Community Management Tools",
      description: "Develop tools for managing our DAO community. Include proposal creation, voting mechanisms, and governance dashboards. Must integrate with existing smart contracts.",
      requiredSkills: ["DAO", "Governance", "Community Tools", "Voting Systems", "Dashboard Development"],
      payment: ethers.parseEther("0.0008"), // 0.0008 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (13 * 24 * 60 * 60)) // 13 days
    },
    {
      title: "Smart Contract Upgrade System",
      description: "Implement a secure upgrade system for our smart contracts using proxy patterns. Include upgrade mechanisms, access control, and rollback capabilities. Must be gas-efficient and secure.",
      requiredSkills: ["Proxy Patterns", "Upgradeable Contracts", "Access Control", "Security", "Gas Optimization"],
      payment: ethers.parseEther("0.001"), // 0.001 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (16 * 24 * 60 * 60)) // 16 days
    },
    {
      title: "Analytics and Reporting",
      description: "Create comprehensive analytics and reporting tools for our platform. Include user behavior tracking, performance metrics, and automated reports. Must provide actionable insights.",
      requiredSkills: ["Analytics", "Data Visualization", "Reporting", "User Tracking", "Insights"],
      payment: ethers.parseEther("0.0006"), // 0.0006 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60)) // 10 days
    },
    {
      title: "Security Monitoring System",
      description: "Build a real-time security monitoring system for our smart contracts. Include anomaly detection, alert systems, and incident response tools. Must integrate with existing infrastructure.",
      requiredSkills: ["Security Monitoring", "Anomaly Detection", "Alert Systems", "Incident Response", "Integration"],
      payment: ethers.parseEther("0.0009"), // 0.0009 ETH
      deadline: BigInt(Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60)) // 14 days
    }
  ];

  console.log("\n⚠️  IMPORTANT: This script will create 15 bounties using your account.");
  const totalRequired = bounties.reduce((sum, b) => sum + BigInt(b.payment), BigInt(0));
  console.log(`   Total ETH required: ${ethers.formatEther(totalRequired)} ETH`);
  console.log("   Make sure you have enough Sepolia ETH for bounty payments and gas fees.");
  console.log("\nCreating bounties...");
  console.log("=====================");

  let successCount = 0;
  let failCount = 0;
  let totalSpent = ethers.parseEther("0");

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
      console.log(`   Waiting for confirmation...`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Bounty created successfully! (Block: ${receipt.blockNumber})`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      successCount++;
      totalSpent = totalSpent + bounty.payment;

      // Get the bounty ID
      const bountyCount = await bountyBoard.getBountyCount();
      console.log(`   Bounty ID: ${bountyCount - 1}`);

      // Add a small delay between transactions to avoid rate limiting
      if (i < bounties.length - 1) {
        console.log(`   Waiting 3 seconds before next transaction...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ Failed to create bounty: ${error.message}`);
      failCount++;
      
      // If it's a gas-related error, we might want to stop
      if (error.message.includes("insufficient funds") || error.message.includes("gas")) {
        console.error(`   ⚠️  Gas/balance issue detected. Stopping bounty creation.`);
        break;
      }
    }
  }

  console.log("\n=====================");
  console.log("Bounty creation completed!");
  console.log(`✅ Successfully created: ${successCount} bounties`);
  console.log(`❌ Failed to create: ${failCount} bounties`);
  console.log(`💰 Total ETH spent on bounties: ${ethers.formatEther(totalSpent)} ETH`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Created ${successCount} bounties on Sepolia!`);
    console.log(`   You can view them on Sepolia Etherscan: https://sepolia.etherscan.io/address/${bountyBoard.target}`);
    
    // Display final bounty count
    try {
      const finalBountyCount = await bountyBoard.getBountyCount();
      console.log(`   Total bounties on the board: ${finalBountyCount}`);
    } catch (error) {
      console.log(`   Could not retrieve final bounty count: ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error creating bounties:", error);
    process.exit(1);
  });
