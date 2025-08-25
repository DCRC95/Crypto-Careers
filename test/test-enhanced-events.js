const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Enhanced Events Test", function () {
  let bountyBoard, talentProfile;
  let owner, company, applicant;

  beforeEach(async function () {
    [owner, company, applicant] = await ethers.getSigners();
    
    const BountyBoard = await ethers.getContractFactory("BountyBoard");
    bountyBoard = await BountyBoard.deploy();
    
    const TalentProfile = await ethers.getContractFactory("TalentProfile");
    talentProfile = await TalentProfile.deploy();
  });

  describe("TalentProfile Enhanced Events", function () {
    it("Should emit ProfileCreated with full data", async function () {
      const name = "Rhys";
      const bio = "Full-stack developer with blockchain experience";
      const resumeHash = "QmHash123";
      const skills = ["Solidity", "React", "TypeScript"];
      
      const tx = await talentProfile.createProfile(name, bio, resumeHash, skills);
      const receipt = await tx.wait();
      
      // Check event was emitted with correct data
      const event = receipt.logs.find(log => 
        bountyBoard.interface.parseLog(log)?.name === "ProfileCreated" ||
        talentProfile.interface.parseLog(log)?.name === "ProfileCreated"
      );
      
      expect(event).to.not.be.undefined;
      const parsedEvent = talentProfile.interface.parseLog(event);
      expect(parsedEvent.args.user).to.equal(owner.address);
      expect(parsedEvent.args.name).to.equal(name);
      expect(parsedEvent.args.bio).to.equal(bio);
      expect(parsedEvent.args.resumeHash).to.equal(resumeHash);
      expect(parsedEvent.args.skills).to.deep.equal(skills);
    });

    it("Should emit ProfileUpdated with full data", async function () {
      // First create a profile
      await talentProfile.createProfile("Rhys", "Old bio", "OldHash", ["OldSkill"]);
      
      const newName = "Rhys Updated";
      const newBio = "Updated bio with more experience";
      const newResumeHash = "QmNewHash456";
      const newSkills = ["Solidity", "React", "TypeScript", "GraphQL"];
      
      const tx = await talentProfile.updateProfile(newName, newBio, newResumeHash, newSkills);
      const receipt = await tx.wait();
      
      // Check event was emitted with correct data
      const event = receipt.logs.find(log => 
        talentProfile.interface.parseLog(log)?.name === "ProfileUpdated"
      );
      
      expect(event).to.not.be.undefined;
      const parsedEvent = talentProfile.interface.parseLog(event);
      expect(parsedEvent.args.user).to.equal(owner.address);
      expect(parsedEvent.args.name).to.equal(newName);
      expect(parsedEvent.args.bio).to.equal(newBio);
      expect(parsedEvent.args.resumeHash).to.equal(newResumeHash);
      expect(parsedEvent.args.skills).to.deep.equal(newSkills);
    });
  });

  describe("BountyBoard Enhanced Events", function () {
    it("Should emit BountyPosted with full data", async function () {
      const title = "Smart Contract Developer";
      const description = "Build DeFi protocols and smart contracts";
      const requiredSkills = ["Solidity", "DeFi", "Security"];
      const payment = ethers.parseEther("1.0");
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      
      const tx = await bountyBoard.connect(company).postBounty(title, description, requiredSkills, payment, deadline, { value: payment });
      const receipt = await tx.wait();
      
      // Check event was emitted with correct data
      const event = receipt.logs.find(log => 
        bountyBoard.interface.parseLog(log)?.name === "BountyPosted"
      );
      
      expect(event).to.not.be.undefined;
      const parsedEvent = bountyBoard.interface.parseLog(event);
      expect(parsedEvent.args.bountyId).to.equal(0);
      expect(parsedEvent.args.company).to.equal(company.address);
      expect(parsedEvent.args.title).to.equal(title);
      expect(parsedEvent.args.description).to.equal(description);
      expect(parsedEvent.args.requiredSkills).to.deep.equal(requiredSkills);
      expect(parsedEvent.args.payment).to.equal(payment);
      expect(parsedEvent.args.deadline).to.equal(deadline);
    });

    it("Should emit ApplicationSubmitted with cover letter", async function () {
      // First post a bounty
      const payment = ethers.parseEther("1.0");
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await bountyBoard.connect(company).postBounty("Test Bounty", "Test Description", ["Skill1"], payment, deadline, { value: payment });
      
      const coverLetter = "I'm excited to work on this project and have relevant experience.";
      
      const tx = await bountyBoard.connect(applicant).applyForBounty(0, coverLetter);
      const receipt = await tx.wait();
      
      // Check event was emitted with correct data
      const event = receipt.logs.find(log => 
        bountyBoard.interface.parseLog(log)?.name === "ApplicationSubmitted"
      );
      
      expect(event).to.not.be.undefined;
      const parsedEvent = bountyBoard.interface.parseLog(event);
      expect(parsedEvent.args.bountyId).to.equal(0);
      expect(parsedEvent.args.applicant).to.equal(applicant.address);
      expect(parsedEvent.args.coverLetter).to.equal(coverLetter);
    });

    it("Should emit ApplicationAccepted with timestamp", async function () {
      // Setup: post bounty and apply
      const payment = ethers.parseEther("1.0");
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await bountyBoard.connect(company).postBounty("Test Bounty", "Test Description", ["Skill1"], payment, deadline, { value: payment });
      await bountyBoard.connect(applicant).applyForBounty(0, "Cover letter");
      
      const tx = await bountyBoard.connect(company).acceptApplication(0, 0);
      const receipt = await tx.wait();
      
      // Check event was emitted with correct data
      const event = receipt.logs.find(log => 
        bountyBoard.interface.parseLog(log)?.name === "ApplicationAccepted"
      );
      
      expect(event).to.not.be.undefined;
      const parsedEvent = bountyBoard.interface.parseLog(event);
      expect(parsedEvent.args.bountyId).to.equal(0);
      expect(parsedEvent.args.applicant).to.equal(applicant.address);
    });

    it("Should emit BountyCompleted with timestamp", async function () {
      // Setup: post bounty, apply, and accept
      const payment = ethers.parseEther("1.0");
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await bountyBoard.connect(company).postBounty("Test Bounty", "Test Description", ["Skill1"], payment, deadline, { value: payment });
      await bountyBoard.connect(applicant).applyForBounty(0, "Cover letter");
      await bountyBoard.connect(company).acceptApplication(0, 0);
      
      const tx = await bountyBoard.connect(company).completeBounty(0, 0);
      const receipt = await tx.wait();
      
      // Check event was emitted with correct data
      const event = receipt.logs.find(log => 
        bountyBoard.interface.parseLog(log)?.name === "BountyCompleted"
      );
      
      expect(event).to.not.be.undefined;
      const parsedEvent = bountyBoard.interface.parseLog(event);
      expect(parsedEvent.args.bountyId).to.equal(0);
      expect(parsedEvent.args.applicant).to.equal(applicant.address);
    });
  });
});
