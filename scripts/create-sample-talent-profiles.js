const { ethers } = require("hardhat");

async function main() {
  console.log("Creating sample talent profiles for ChainTalent on Sepolia...");
  
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
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance on Sepolia. Please fund your account with some test ETH.");
    console.error("You can get test ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  // Get the deployed TalentProfile contract
  const TalentProfile = await ethers.getContractFactory("TalentProfile");
  const talentProfile = TalentProfile.attach("0x6f1e23dcda6e8697A825CAF957bBaa273AE9fcbF");

  console.log("TalentProfile contract address:", talentProfile.target);

  // Sample talent profile data
  const talentData = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      telegram: "@alice_dev",
      bio: "Senior Solidity developer with 5+ years experience in DeFi protocols. Passionate about smart contract security and gas optimization.",
      resumeHash: "QmHash123456789abcdef",
      skills: ["Solidity", "DeFi", "Smart Contracts", "Security", "Hardhat"]
    },
    {
      name: "Bob Chen",
      email: "bob.chen@tech.com",
      telegram: "@bob_frontend",
      bio: "Full-stack developer specializing in React and Web3 integration. Built multiple dApps with 100k+ users.",
      resumeHash: "QmHash234567890bcdef",
      skills: ["React", "TypeScript", "Web3.js", "Node.js", "CSS"]
    },
    {
      name: "Carol Rodriguez",
      email: "carol.rodriguez@blockchain.com",
      telegram: "@carol_analyst",
      bio: "Blockchain data analyst with expertise in on-chain metrics and DeFi protocol analysis. PhD in Computer Science.",
      resumeHash: "QmHash345678901cdef",
      skills: ["Python", "Data Analysis", "SQL", "Blockchain", "Machine Learning"]
    },
    {
      name: "David Kim",
      email: "david.kim@mobile.com",
      telegram: "@david_mobile",
      bio: "Mobile app developer with focus on cross-platform solutions. Experienced in React Native and Flutter.",
      resumeHash: "QmHash456789012def",
      skills: ["React Native", "Flutter", "Mobile Development", "JavaScript", "Firebase"]
    },
    {
      name: "Emma Wilson",
      email: "emma.wilson@security.com",
      telegram: "@emma_security",
      bio: "Smart contract auditor and security researcher. Found critical vulnerabilities in major DeFi protocols.",
      resumeHash: "QmHash567890123ef",
      skills: ["Smart Contract Auditing", "Security", "Solidity", "Penetration Testing", "DeFi"]
    },
    {
      name: "Frank Miller",
      email: "frank.miller@backend.com",
      telegram: "@frank_backend",
      bio: "Backend developer with expertise in scalable systems and blockchain infrastructure. Built APIs serving millions of requests.",
      resumeHash: "QmHash678901234f",
      skills: ["Go", "Python", "PostgreSQL", "Redis", "Docker"]
    },
    {
      name: "Grace Lee",
      email: "grace.lee@ui.com",
      telegram: "@grace_designer",
      bio: "UI/UX designer specializing in DeFi applications. Created intuitive interfaces for complex financial products.",
      resumeHash: "QmHash789012345",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research", "Design Systems"]
    },
    {
      name: "Henry Brown",
      email: "henry.brown@testing.com",
      telegram: "@henry_tester",
      bio: "QA engineer with focus on blockchain testing. Experienced in automated testing frameworks and smart contract testing.",
      resumeHash: "QmHash890123456",
      skills: ["Jest", "Hardhat", "Testing", "Automation", "Smart Contracts"]
    },
    {
      name: "Ivy Davis",
      email: "ivy.davis@research.com",
      telegram: "@ivy_researcher",
      bio: "Blockchain researcher with publications in top conferences. Focus on consensus mechanisms and scalability solutions.",
      resumeHash: "QmHash901234567",
      skills: ["Research", "Consensus Algorithms", "Scalability", "Academic Writing", "Cryptography"]
    },
    {
      name: "Jack Taylor",
      email: "jack.taylor@devops.com",
      telegram: "@jack_devops",
      bio: "DevOps engineer specializing in blockchain infrastructure. Deployed and maintained nodes across multiple networks.",
      resumeHash: "QmHash012345678",
      skills: ["DevOps", "Docker", "Kubernetes", "AWS", "Node Management"]
    },
    {
      name: "Kate Anderson",
      email: "kate.anderson@frontend.com",
      telegram: "@kate_react",
      bio: "Frontend developer with expertise in modern React patterns. Built responsive dashboards for financial applications.",
      resumeHash: "QmHash123456789",
      skills: ["React", "Next.js", "Tailwind CSS", "State Management", "Performance"]
    },
    {
      name: "Liam O'Connor",
      email: "liam.oconnor@backend.com",
      telegram: "@liam_java",
      bio: "Backend developer with Java expertise. Built microservices architecture for high-traffic applications.",
      resumeHash: "QmHash234567890",
      skills: ["Java", "Spring Boot", "Microservices", "Kafka", "MongoDB"]
    },
    {
      name: "Maya Patel",
      email: "maya.patel@data.com",
      telegram: "@maya_data",
      bio: "Data scientist with focus on blockchain analytics. Developed models for predicting market trends and user behavior.",
      resumeHash: "QmHash345678901",
      skills: ["Python", "TensorFlow", "Data Science", "Blockchain Analytics", "Statistics"]
    },
    {
      name: "Noah Thompson",
      email: "noah.thompson@fullstack.com",
      telegram: "@noah_fullstack",
      bio: "Full-stack developer with 8+ years experience. Built complete dApps from smart contracts to frontend.",
      resumeHash: "QmHash456789012",
      skills: ["Full-Stack", "Solidity", "React", "Node.js", "Database Design"]
    },
    {
      name: "Olivia Garcia",
      email: "olivia.garcia@design.com",
      telegram: "@olivia_creative",
      bio: "Creative director and UI designer. Led design teams for major DeFi platforms and NFT marketplaces.",
      resumeHash: "QmHash567890123",
      skills: ["Creative Direction", "UI Design", "Team Leadership", "Branding", "User Experience"]
    },
    {
      name: "Paul Martinez",
      email: "paul.martinez@architect.com",
      telegram: "@paul_architect",
      bio: "Software architect with focus on blockchain systems. Designed scalable architectures for enterprise applications.",
      resumeHash: "QmHash678901234",
      skills: ["Software Architecture", "System Design", "Blockchain", "Scalability", "Enterprise"]
    },
    {
      name: "Quinn Robinson",
      email: "quinn.robinson@product.com",
      telegram: "@quinn_product",
      bio: "Product manager with technical background. Successfully launched multiple DeFi products with millions in TVL.",
      resumeHash: "QmHash789012345",
      skills: ["Product Management", "DeFi", "User Research", "Analytics", "Agile"]
    },
    {
      name: "Ruby White",
      email: "ruby.white@marketing.com",
      telegram: "@ruby_marketing",
      bio: "Marketing specialist for blockchain projects. Grew community from 0 to 100k+ members across multiple platforms.",
      resumeHash: "QmHash890123456",
      skills: ["Marketing", "Community Management", "Social Media", "Growth Hacking", "Blockchain"]
    },
    {
      name: "Sam Johnson",
      email: "sam.johnson@support.com",
      telegram: "@sam_support",
      bio: "Technical support specialist with deep knowledge of blockchain technology. Helped thousands of users with technical issues.",
      resumeHash: "QmHash901234567",
      skills: ["Technical Support", "Customer Service", "Blockchain", "Documentation", "Problem Solving"]
    }
  ];

  console.log("\n⚠️  IMPORTANT: This script will create profiles using your account.");
  console.log("   Each profile will be associated with your address as the creator.");
  console.log("   Make sure you have enough Sepolia ETH for gas fees.");
  console.log("\nCreating talent profiles...");
  console.log("=====================");

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < talentData.length; i++) {
    const talent = talentData[i];
    
    console.log(`\n${i + 1}. Creating profile for: ${talent.name}`);
    console.log(`   Email: ${talent.email}`);
    console.log(`   Skills: ${talent.skills.join(", ")}`);

    try {
      const tx = await talentProfile.createProfile(
        talent.name,
        talent.email,
        talent.telegram,
        talent.bio,
        talent.resumeHash,
        talent.skills
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Profile created successfully! (Block: ${receipt.blockNumber})`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      successCount++;

      // Add a small delay between transactions to avoid rate limiting
      if (i < talentData.length - 1) {
        console.log(`   Waiting 2 seconds before next transaction...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`   ❌ Failed to create profile: ${error.message}`);
      failCount++;
      
      // If it's a gas-related error, we might want to stop
      if (error.message.includes("insufficient funds") || error.message.includes("gas")) {
        console.error(`   ⚠️  Gas/balance issue detected. Stopping profile creation.`);
        break;
      }
    }
  }

  console.log("\n=====================");
  console.log("Sample talent profiles creation completed!");
  console.log(`✅ Successfully created: ${successCount} profiles`);
  console.log(`❌ Failed to create: ${failCount} profiles`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Created ${successCount} talent profiles on Sepolia!`);
    console.log(`   You can view them on Sepolia Etherscan: https://sepolia.etherscan.io/address/${talentProfile.target}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error creating talent profiles:", error);
    process.exit(1);
  });
