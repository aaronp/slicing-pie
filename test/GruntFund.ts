const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GruntFund", function () {
  let token;
  let owner, admin1, admin2, admin3, recipient;

  beforeEach(async function () {
    [owner, admin1, admin2, admin3, recipient] = await ethers.getSigners();

    const GruntFund = await ethers.getContractFactory("GruntFund");
    token = await GruntFund.deploy("TestToken", "TTK", 2); // 2 required approvals
    // await token.deployTransaction();
  });

  describe("Admin Management", function () {
    it("should allow the owner to add an admin", async function () {
      await token.connect(owner).addAdmin(admin1.address);
      expect(await token.isAdmin(admin1.address)).to.be.true;
    });

    it("should allow the owner to remove an admin", async function () {
      await token.connect(owner).addAdmin(admin1.address);
      await token.connect(owner).removeAdmin(admin1.address);
      expect(await token.isAdmin(admin1.address)).to.be.false;
    });

    it("should prevent non-owner from adding or removing admins", async function () {
      await expect(token.connect(admin1).addAdmin(admin2.address)).to.be.revertedWith("Only owner can execute this");
      await token.connect(owner).addAdmin(admin1.address);
      await expect(token.connect(admin1).removeAdmin(admin2.address)).to.be.revertedWith("Only owner can execute this");
    });
  });

  describe("Minting with Multi-Signature Approval", function () {
    beforeEach(async function () {
      // Add admins
      await token.connect(owner).addAdmin(admin1.address);
      await token.connect(owner).addAdmin(admin2.address);
      await token.connect(owner).addAdmin(admin3.address);
    });

    it("should allow an admin to request a mint", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);
      const mintRequest = await token.getMintRequest(0);
      expect(mintRequest.to).to.equal(recipient.address);
      expect(mintRequest.amount).to.equal(100);
      expect(mintRequest.approvals).to.equal(0);
      expect(mintRequest.executed).to.be.false;
    });

    it("should allow multiple admins to approve a mint request", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);

      await token.connect(admin1).approveMint(0);
      await token.connect(admin2).approveMint(0);

      const mintRequest = await token.getMintRequest(0);
      expect(mintRequest.approvals).to.equal(2);
    });

    it("should execute mint once required approvals are met", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);

      await token.connect(admin1).approveMint(0);
      await token.connect(admin2).approveMint(0);

      expect(await token.balanceOf(recipient.address)).to.equal(100);
      
      const mintRequest = await token.getMintRequest(0);
      expect(mintRequest.executed).to.be.true;
    });

    it("should not execute mint if approvals are below the required threshold", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);

      await token.connect(admin1).approveMint(0); // only 1 approval
      
      const mintRequest = await token.getMintRequest(0);
      expect(mintRequest.executed).to.be.false;
      expect(await token.balanceOf(recipient.address)).to.equal(0);
    });

    it("should prevent an admin from approving a mint request more than once", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);

      await token.connect(admin1).approveMint(0);
      await expect(token.connect(admin1).approveMint(0)).to.be.revertedWith("Admin already approved");
    });

    it("should prevent non-admin from requesting or approving a mint", async function () {
      await expect(token.connect(recipient).requestMint(recipient.address, 100)).to.be.revertedWith("Only admin can execute this");
      await token.connect(admin1).requestMint(recipient.address, 100);
      await expect(token.connect(recipient).approveMint(0)).to.be.revertedWith("Only admin can execute this");
    });
  });

  describe("Event Emissions", function () {
    beforeEach(async function () {
      await token.connect(owner).addAdmin(admin1.address);
      await token.connect(owner).addAdmin(admin2.address);
    });

    it("should emit an event when an admin is added", async function () {
      await expect(token.connect(owner).addAdmin(admin3.address))
        .to.emit(token, "AdminAdded")
        .withArgs(admin3.address);
    });

    it("should emit an event when an admin is removed", async function () {
      await expect(token.connect(owner).removeAdmin(admin1.address))
        .to.emit(token, "AdminRemoved")
        .withArgs(admin1.address);
    });

    it("should emit events for mint request and approval", async function () {
      await expect(token.connect(admin1).requestMint(recipient.address, 100))
        .to.emit(token, "MintRequested")
        .withArgs(0, recipient.address, 100);

      await expect(token.connect(admin1).approveMint(0))
        .to.emit(token, "MintApproved")
        .withArgs(0, admin1.address);
    });

    it("should emit an event when a mint is executed", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);
      await token.connect(admin1).approveMint(0);
      await expect(token.connect(admin2).approveMint(0))
        .to.emit(token, "MintExecuted")
        .withArgs(0, recipient.address, 100);
    });
  });
});
