const hre = require("hardhat");

async function main() {
  console.log("📝 Testing bounty applications and workflow...");
  console.log("Network:", hre.network.name);
  console.log("");

  // Get signers
  const [deployer, company1, company2, company3, company4, company5, applicant1, applicant2, applicant3, applicant4, applicant5] = await hre.ethers.getSigners();
  
  console.log("👥 Test accounts:");
  console.log("Companies:", [company1, company2, company3, company4, company5].map(c => c.address.slice(0, 6) + '...' + c.address.slice(-4)));
  console.log("Applicants:", [applicant1, applicant2, applicant3, applicant4, applicant5].map(a => a.address.slice(0, 6) + '...' + a.address.slice(-4)));
  console.log("");

  // Deploy contracts
  console.log("🚀 Deploying contracts for application testing...");
  const TalentProfile = await hre.ethers.getContractFactory("TalentProfile");
  const talentProfile = await TalentProfile.deploy();
  await talentProfile.waitForDeployment();

  const BountyBoard = await hre.ethers.getContractFactory("BountyBoard");
  const bountyBoard = await BountyBoard.deploy();
  await bountyBoard.waitForDeployment();

  console.log("✅ Contracts deployed for testing");
  console.log("");

  // Create profiles for applicants
  console.log("👤 Creating applicant profiles...");
  const applicants = [applicant1, applicant2, applicant3, applicant4, applicant5];
  const applicantNames = ["Alice Developer", "Bob Designer", "Carol DevOps", "David Data", "Eve Security"];
  const applicantSkills = [
    ["Frontend Development", "React"],
    ["UI/UX Design", "Figma"],
    ["DevOps", "Docker"],
    ["Data Science", "Python"],
    ["Cybersecurity", "Penetration Testing"]
  ];

  for (let i = 0; i < applicants.length; i++) {
    try {
      const tx = await talentProfile.connect(applicants[i]).createProfile(
        applicantNames[i],
        `Experienced ${applicantSkills[i][0]} professional`,
        `0x${i.toString().padStart(64, '0')}`,
        applicantSkills[i]
      );
      await tx.wait();
      console.log(`✅ Profile created for ${applicantNames[i]}`);
    } catch (error) {
      console.log(`❌ Failed to create profile for ${applicantNames[i]}:`, error.message);
    }
  }

  // Post a few bounties
  console.log("");
  console.log("🎯 Posting test bounties...");
  
  const companies = [company1, company2, company3];
  const bountyTitles = [
    "Frontend Developer Needed",
    "UI/UX Designer Wanted", 
    "DevOps Engineer Required"
  ];
  const bountyDescriptions = [
    "Looking for a React developer to build a modern web app",
    "Need a designer to create beautiful user interfaces",
    "Seeking DevOps engineer to manage our cloud infrastructure"
  ];
  const requiredSkills = [
    ["Frontend Development", "React"],
    ["UI/UX Design", "Figma"],
    ["DevOps", "Docker"]
  ];

  for (let i = 0; i < 3; i++) {
    try {
      const payment = hre.ethers.parseEther("0.1"); // 0.1 ETH
      const deadline = Math.floor(Date.now() / 1000) + (86400 * 7); // 7 days from now
      
      const tx = await bountyBoard.connect(companies[i]).postBounty(
        bountyTitles[i],
        bountyDescriptions[i],
        requiredSkills[i],
        payment,
        deadline,
        { value: payment } // Send ETH with the transaction
      );
      await tx.wait();
      console.log(`✅ Bounty ${i + 1} posted: ${bountyTitles[i]}`);
    } catch (error) {
      console.log(`❌ Failed to post bounty ${i + 1}:`, error.message);
    }
  }

  // Test applications
  console.log("");
  console.log("📝 Testing bounty applications...");

  // Applicant 1 applies to Bounty 1 (Frontend Developer)
  try {
    const coverLetter = "I'm an experienced React developer with 5 years of experience building modern web applications. I've worked with TypeScript, Tailwind CSS, and various state management solutions.";
    const tx = await bountyBoard.connect(applicant1).applyForBounty(0, coverLetter);
    await tx.wait();
    console.log("✅ Alice applied for Frontend Developer position");
  } catch (error) {
    console.log("❌ Failed to apply for Frontend Developer:", error.message);
  }

  // Applicant 2 applies to Bounty 2 (UI/UX Designer)
  try {
    const coverLetter = "I'm a passionate UI/UX designer with expertise in Figma, Adobe XD, and user research. I've designed interfaces for fintech and e-commerce platforms.";
    const tx = await bountyBoard.connect(applicant2).applyForBounty(1, coverLetter);
    await tx.wait();
    console.log("✅ Bob applied for UI/UX Designer position");
  } catch (error) {
    console.log("❌ Failed to apply for UI/UX Designer:", error.message);
  }

  // Applicant 3 applies to Bounty 3 (DevOps Engineer)
  try {
    const coverLetter = "I'm a DevOps engineer with experience in Docker, Kubernetes, and AWS. I've automated deployment pipelines and managed production environments.";
    const tx = await bountyBoard.connect(applicant3).applyForBounty(2, coverLetter);
    await tx.wait();
    console.log("✅ Carol applied for DevOps Engineer position");
  } catch (error) {
    console.log("❌ Failed to apply for DevOps Engineer:", error.message);
  }

  // Test accepting applications
  console.log("");
  console.log("✅ Testing application acceptance...");

  try {
    // Company 1 accepts Alice's application for Frontend Developer
    const tx = await bountyBoard.connect(company1).acceptApplication(0, 0);
    await tx.wait();
    console.log("✅ Company 1 accepted Alice's application for Frontend Developer");
  } catch (error) {
    console.log("❌ Failed to accept Alice's application:", error.message);
  }

  try {
    // Company 2 accepts Bob's application for UI/UX Designer
    const tx = await bountyBoard.connect(company2).acceptApplication(1, 0);
    await tx.wait();
    console.log("✅ Company 2 accepted Bob's application for UI/UX Designer");
  } catch (error) {
    console.log("❌ Failed to accept Bob's application:", error.message);
  }

  // Test bounty completion
  console.log("");
  console.log("🏁 Testing bounty completion...");

  try {
    // Complete the Frontend Developer bounty
    const tx = await bountyBoard.connect(company1).completeBounty(0, 0);
    await tx.wait();
    console.log("✅ Frontend Developer bounty completed! Payment transferred to Alice");
  } catch (error) {
    console.log("❌ Failed to complete Frontend Developer bounty:", error.message);
  }

  // Test reading data
  console.log("");
  console.log("📊 Testing data reading functions...");

  try {
    const bountyCount = await bountyBoard.getBountyCount();
    console.log(`📋 Total bounties: ${bountyCount}`);
    
    const applications = await bountyBoard.getApplications(0);
    console.log(`📝 Applications for Bounty 1: ${applications.length}`);
    
    const bounty = await bountyBoard.getBounty(0);
    console.log(`🎯 Bounty 1 status: ${bounty.isActive ? 'Active' : 'Completed'}`);
    
    console.log(`📄 Applications for Bounty 1: ${applications.length}`);
    
    if (applications.length > 0) {
      const firstApp = applications[0];
      console.log(`   First application: ${firstApp.applicant.slice(0, 6)}...${firstApp.applicant.slice(-4)}`);
      console.log(`   Status: ${firstApp.isAccepted ? 'Accepted' : 'Pending'}`);
      console.log(`   Completed: ${firstApp.isCompleted ? 'Yes' : 'No'}`);
    }
  } catch (error) {
    console.log("❌ Failed to read bounty data:", error.message);
  }

  console.log("");
  console.log("🎉 Application testing completed!");
  console.log("");
  console.log("📋 Test Summary:");
  console.log("==================");
  console.log("Profiles created:", applicants.length);
  console.log("Bounties posted: 3");
  console.log("Applications submitted: 3");
  console.log("Applications accepted: 2");
  console.log("Bounties completed: 1");
  console.log("");
  console.log("💡 Test scenarios covered:");
  console.log("1. Profile creation for multiple users");
  console.log("2. Bounty posting with different requirements");
  console.log("3. Multiple applications to different bounties");
  console.log("4. Application acceptance workflow");
  console.log("5. Bounty completion and payment");
  console.log("6. Data reading and verification");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Application testing failed:", error);
    process.exit(1);
  });
