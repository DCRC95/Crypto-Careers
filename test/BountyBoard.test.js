const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BountyBoard", function () {
  let bountyBoard;
  let owner;
  let company;
  let applicant;

  beforeEach(async function () {
    [owner, company, applicant] = await ethers.getSigners();
    
    const BountyBoard = await ethers.getContractFactory("BountyBoard");
    bountyBoard = await BountyBoard.deploy();
  });

  describe("Bounty Posting", function () {
    it("Should post a bounty successfully", async function () {
      const title = "Frontend Developer Needed";
      const description = "We need a React developer for a 3-month project";
      const requiredSkills = ["React", "TypeScript", "Tailwind"];
      const payment = ethers.parseEther("1.0");
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

      await bountyBoard.connect(company).postBounty(
        title,
        description,
        requiredSkills,
        payment,
        deadline,
        { value: payment }
      );

      const bounty = await bountyBoard.getBounty(0);
      expect(bounty.title).to.equal(title);
      expect(bounty.description).to.equal(description);
      expect(bounty.company).to.equal(company.address);
      expect(bounty.payment).to.equal(payment);
      expect(bounty.isActive).to.be.true;
    });

    it("Should not allow posting bounty without correct payment", async function () {
      const title = "Frontend Developer Needed";
      const description = "We need a React developer for a 3-month project";
      const requiredSkills = ["React", "TypeScript", "Tailwind"];
      const payment = ethers.parseEther("1.0");
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        bountyBoard.connect(company).postBounty(
          title,
          description,
          requiredSkills,
          payment,
          deadline,
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWith("Payment amount must match bounty value");
    });

    it("Should not allow posting bounty with past deadline", async function () {
      const title = "Frontend Developer Needed";
      const description = "We need a React developer for a 3-month project";
      const requiredSkills = ["React", "TypeScript", "Tailwind"];
      const payment = ethers.parseEther("1.0");
      const deadline = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago

      await expect(
        bountyBoard.connect(company).postBounty(
          title,
          description,
          requiredSkills,
          payment,
          deadline,
          { value: payment }
        )
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Bounty Applications", function () {
    let bountyId;
    let payment;
    let deadline;

    beforeEach(async function () {
      const title = "Frontend Developer Needed";
      const description = "We need a React developer for a 3-month project";
      const requiredSkills = ["React", "TypeScript", "Tailwind"];
      payment = ethers.parseEther("1.0");
      deadline = Math.floor(Date.now() / 1000) + 86400;

      await bountyBoard.connect(company).postBounty(
        title,
        description,
        requiredSkills,
        payment,
        deadline,
        { value: payment }
      );

      bountyId = 0;
    });

    it("Should allow applying for a bounty", async function () {
      const coverLetter = "I'm a skilled React developer with 3 years of experience";

      await bountyBoard.connect(applicant).applyForBounty(bountyId, coverLetter);

      const applications = await bountyBoard.getApplications(bountyId);
      expect(applications.length).to.equal(1);
      expect(applications[0].applicant).to.equal(applicant.address);
      expect(applications[0].coverLetter).to.equal(coverLetter);
      expect(applications[0].isAccepted).to.be.false;
    });

    it("Should not allow applying for inactive bounty", async function () {
      // Accept an application to make bounty inactive
      const coverLetter = "I'm a skilled React developer";
      await bountyBoard.connect(applicant).applyForBounty(bountyId, coverLetter);
      await bountyBoard.connect(company).acceptApplication(bountyId, 0);

      // Try to apply again
      await expect(
        bountyBoard.connect(owner).applyForBounty(bountyId, "Another application")
      ).to.be.revertedWith("Bounty is not active");
    });
  });

  describe("Bounty Completion", function () {
    let bountyId;
    let payment;
    let deadline;

    beforeEach(async function () {
      const title = "Frontend Developer Needed";
      const description = "We need a React developer for a 3-month project";
      const requiredSkills = ["React", "TypeScript", "Tailwind"];
      payment = ethers.parseEther("1.0");
      deadline = Math.floor(Date.now() / 1000) + 86400;

      await bountyBoard.connect(company).postBounty(
        title,
        description,
        requiredSkills,
        payment,
        deadline,
        { value: payment }
      );

      bountyId = 0;

      // Apply and accept application
      const coverLetter = "I'm a skilled React developer";
      await bountyBoard.connect(applicant).applyForBounty(bountyId, coverLetter);
      await bountyBoard.connect(company).acceptApplication(bountyId, 0);
    });

    it("Should complete bounty and transfer payment", async function () {
      const initialBalance = await ethers.provider.getBalance(applicant.address);

      await bountyBoard.connect(company).completeBounty(bountyId, 0);

      const finalBalance = await ethers.provider.getBalance(applicant.address);
      expect(finalBalance).to.equal(initialBalance + payment);

      const applications = await bountyBoard.getApplications(bountyId);
      expect(applications[0].isCompleted).to.be.true;
    });
  });
});
