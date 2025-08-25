const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing ChainTalent contracts with comprehensive data...");
  console.log("Network:", hre.network.name);
  console.log("");

  // Get signers (we'll use multiple accounts for testing)
  const [deployer, company1, company2, company3, company4, company5, ...otherSigners] = await hre.ethers.getSigners();
  
  console.log("👥 Test accounts:");
  console.log("Deployer:", deployer.address);
  console.log("Company 1:", company1.address);
  console.log("Company 2:", company2.address);
  console.log("Company 3:", company3.address);
  console.log("Company 4:", company4.address);
  console.log("Company 5:", company5.address);
  console.log("");

  // Deploy contracts
  console.log("🚀 Deploying contracts for testing...");
  const TalentProfile = await hre.ethers.getContractFactory("TalentProfile");
  const talentProfile = await TalentProfile.deploy();
  await talentProfile.waitForDeployment();
  const talentProfileAddress = await talentProfile.getAddress();

  const BountyBoard = await hre.ethers.getContractFactory("BountyBoard");
  const bountyBoard = await BountyBoard.deploy();
  await bountyBoard.waitForDeployment();
  const bountyBoardAddress = await bountyBoard.getAddress();

  console.log("✅ TalentProfile deployed to:", talentProfileAddress);
  console.log("✅ BountyBoard deployed to:", bountyBoardAddress);
  console.log("");

  // Test data for different types of jobs
  const jobCategories = [
    "Blockchain Development",
    "Cloud Infrastructure", 
    "Cybersecurity",
    "Frontend Development",
    "Backend Development",
    "DevOps",
    "Data Science",
    "Machine Learning",
    "Mobile Development",
    "UI/UX Design"
  ];

  const techStacks = [
    "Solidity, Hardhat, React",
    "AWS, Terraform, Kubernetes",
    "Penetration Testing, SIEM, Firewall",
    "React, TypeScript, Tailwind CSS",
    "Node.js, Express, PostgreSQL",
    "Docker, Jenkins, GitLab CI",
    "Python, Pandas, Scikit-learn",
    "TensorFlow, PyTorch, OpenCV",
    "React Native, Flutter, Swift",
    "Figma, Adobe XD, Sketch"
  ];

  const companies = [
    { name: "TechCorp Ireland", signer: company1 },
    { name: "Blockchain Solutions Ltd", signer: company2 },
    { name: "CloudTech Dublin", signer: company3 },
    { name: "SecureNet Systems", signer: company4 },
    { name: "DataFlow Analytics", signer: company5 }
  ];

  const locations = [
    "Dublin",
    "Cork", 
    "Galway",
    "Limerick",
    "Waterford",
    "Remote",
    "Hybrid"
  ];

  console.log("📝 Testing TalentProfile functionality...");
  
  // Test profile creation for different users
  const testUsers = [deployer, company1, company2, company3, company4, company5];
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    const profileData = {
      name: `Test User ${i + 1}`,
      bio: `Experienced professional in ${jobCategories[i % jobCategories.length]} with expertise in ${techStacks[i % techStacks.length]}`,
      resumeHash: `0x${i.toString().padStart(64, '0')}`,
      skills: [`${jobCategories[i % jobCategories.length]}`, `${techStacks[i % techStacks.length].split(', ')[0]}`]
    };

    try {
      const tx = await talentProfile.connect(user).createProfile(
        profileData.name,
        profileData.bio,
        profileData.resumeHash,
        profileData.skills
      );
      await tx.wait();
      console.log(`✅ Profile created for ${user.address.slice(0, 6)}...${user.address.slice(-4)}`);
    } catch (error) {
      console.log(`❌ Failed to create profile for ${user.address}:`, error.message);
    }
  }

  console.log("");
  console.log("🎯 Testing BountyBoard functionality...");

  // Create 30 different job postings
  const bountyData = [];
  let bountyId = 0;

  for (let i = 0; i < 30; i++) {
    const company = companies[i % companies.length];
    const category = jobCategories[i % jobCategories.length];
    const tech = techStacks[i % techStacks.length];
    const location = locations[i % locations.length];
    
    // Generate unique payment amounts (0.01 to 0.5 ETH)
    const payment = hre.ethers.parseEther((0.01 + (i * 0.02)).toFixed(2));
    
    // Generate deadline (1-30 days from now)
    const deadline = Math.floor(Date.now() / 1000) + (86400 * (1 + (i % 30)));

    const bounty = {
      id: bountyId++,
      company: company.signer.address,
      title: `${category} Specialist - ${company.name}`,
      description: `We are looking for a skilled ${category} professional to join our team. Experience with ${tech} is required. This is a ${location === 'Remote' ? 'remote' : location === 'Hybrid' ? 'hybrid' : 'on-site'} position.`,
      requiredSkills: [category, tech.split(', ')[0]],
      payment: payment,
      deadline: deadline,
      isActive: true
    };

    bountyData.push(bounty);

    try {
      // Send the payment amount with the transaction
      const tx = await bountyBoard.connect(company.signer).postBounty(
        bounty.title,
        bounty.description,
        bounty.requiredSkills,
        bounty.payment,
        bounty.deadline,
        { value: bounty.payment } // Send ETH with the transaction
      );
      await tx.wait();
      
      console.log(`✅ Bounty ${bounty.id + 1} posted: ${bounty.title}`);
      console.log(`   Company: ${company.name}`);
      console.log(`   Payment: ${hre.ethers.formatEther(bounty.payment)} ETH`);
      console.log(`   Deadline: ${new Date(bounty.deadline * 1000).toLocaleDateString()}`);
      console.log(`   Location: ${location}`);
      console.log("");
    } catch (error) {
      console.log(`❌ Failed to post bounty ${bounty.id + 1}:`, error.message);
    }
  }

  console.log("🧪 Testing contract read functions...");

  // Test reading profiles - count profiles by checking hasProfile mapping
  try {
    let profileCount = 0;
    for (let i = 0; i < testUsers.length; i++) {
      const hasProfile = await talentProfile.profileExists(testUsers[i].address);
      if (hasProfile) profileCount++;
    }
    console.log(`📊 Total profiles created: ${profileCount}`);
  } catch (error) {
    console.log("❌ Failed to read profile count:", error.message);
  }

  // Test reading bounties
  try {
    const bountyCount = await bountyBoard.getBountyCount();
    console.log(`📊 Total bounties posted: ${bountyCount}`);
  } catch (error) {
    console.log("❌ Failed to read bounty count:", error.message);
  }

  // Test reading a specific bounty
  try {
    const firstBounty = await bountyBoard.getBounty(0);
    console.log(`📋 First bounty details:`);
    console.log(`   Title: ${firstBounty.title}`);
    console.log(`   Company: ${firstBounty.company}`);
    console.log(`   Payment: ${hre.ethers.formatEther(firstBounty.payment)} ETH`);
    console.log(`   Active: ${firstBounty.isActive}`);
  } catch (error) {
    console.log("❌ Failed to read first bounty:", error.message);
  }

  console.log("");
  console.log("🎉 Contract testing completed!");
  console.log("");
  console.log("📋 Test Summary:");
  console.log("==================");
  console.log("Profiles created:", testUsers.length);
  console.log("Bounties posted:", bountyData.length);
  console.log("Contract addresses:");
  console.log("  TalentProfile:", talentProfileAddress);
  console.log("  BountyBoard:", bountyBoardAddress);
  console.log("");
  console.log("💡 Next steps:");
  console.log("1. Deploy to Sepolia testnet");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Test frontend integration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });
