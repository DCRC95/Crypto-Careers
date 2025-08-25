const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TalentProfile", function () {
  let talentProfile;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const TalentProfile = await ethers.getContractFactory("TalentProfile");
    talentProfile = await TalentProfile.deploy();
  });

  describe("Profile Creation", function () {
    it("Should create a profile successfully", async function () {
      const name = "John Doe";
      const bio = "Full-stack developer";
      const resumeHash = "QmHash123";
      const skills = ["JavaScript", "React", "Solidity"];

      await talentProfile.connect(addr1).createProfile(name, bio, resumeHash, skills);

      const profile = await talentProfile.getProfile(addr1.address);
      expect(profile.name).to.equal(name);
      expect(profile.bio).to.equal(bio);
      expect(profile.resumeHash).to.equal(resumeHash);
      expect(profile.skills).to.deep.equal(skills);
      expect(await talentProfile.profileExists(addr1.address)).to.be.true;
    });

    it("Should not allow creating duplicate profiles", async function () {
      const name = "John Doe";
      const bio = "Full-stack developer";
      const resumeHash = "QmHash123";
      const skills = ["JavaScript", "React", "Solidity"];

      await talentProfile.connect(addr1).createProfile(name, bio, resumeHash, skills);

      await expect(
        talentProfile.connect(addr1).createProfile(name, bio, resumeHash, skills)
      ).to.be.revertedWith("Profile already exists");
    });

    it("Should not allow empty names", async function () {
      const name = "";
      const bio = "Full-stack developer";
      const resumeHash = "QmHash123";
      const skills = ["JavaScript", "React", "Solidity"];

      await expect(
        talentProfile.connect(addr1).createProfile(name, bio, resumeHash, skills)
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Profile Updates", function () {
    beforeEach(async function () {
      const name = "John Doe";
      const bio = "Full-stack developer";
      const resumeHash = "QmHash123";
      const skills = ["JavaScript", "React", "Solidity"];

      await talentProfile.connect(addr1).createProfile(name, bio, resumeHash, skills);
    });

    it("Should update profile successfully", async function () {
      const newName = "John Smith";
      const newBio = "Senior developer";
      const newResumeHash = "QmHash456";
      const newSkills = ["TypeScript", "Next.js", "Hardhat"];

      await talentProfile.connect(addr1).updateProfile(newName, newBio, newResumeHash, newSkills);

      const profile = await talentProfile.getProfile(addr1.address);
      expect(profile.name).to.equal(newName);
      expect(profile.bio).to.equal(newBio);
      expect(profile.resumeHash).to.equal(newResumeHash);
      expect(profile.skills).to.deep.equal(newSkills);
    });

    it("Should not allow updating non-existent profiles", async function () {
      const name = "Jane Doe";
      const bio = "Designer";
      const resumeHash = "QmHash789";
      const skills = ["Figma", "Adobe"];

      await expect(
        talentProfile.connect(addr2).updateProfile(name, bio, resumeHash, skills)
      ).to.be.revertedWith("Profile does not exist");
    });
  });
});
