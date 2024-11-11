const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("GruntFund Contract", function () {
  let GruntFund, gruntFund, owner, admin1, admin2, nonAdmin;

  beforeEach(async () => {
      [owner, admin1, admin2, nonAdmin] = await ethers.getSigners();

      // Deploy the GruntFund contract with required approvals set to 2
      GruntFund = await ethers.getContractFactory("GruntFund");
      gruntFund = await GruntFund.deploy("GruntToken", "GRT", 2);
      await gruntFund.deployed();

      // Add an admin
      await gruntFund.connect(owner).addAdmin(admin1.address);
      await gruntFund.connect(owner).addAdmin(admin2.address);
  });

});

describe("GruntFund", function () {
  let token;
  let owner, admin1, admin2, admin3, recipient, nonAdmin;

  beforeEach(async function () {
    [owner, admin1, admin2, admin3, recipient, nonAdmin] = await ethers.getSigners();

    const GruntFund = await ethers.getContractFactory("GruntFund");
    token = await GruntFund.deploy("TestToken", "TTK", 2); // 2 required approvals

  });

  describe("getMintRequest", function () {
    beforeEach(async function () {
      // Add admins
      await token.connect(owner).addAdmin(admin1.address);
      await token.connect(owner).addAdmin(admin2.address);
      await token.connect(owner).addAdmin(admin3.address);
    });

    it("Should return the correct details for a mint request", async () => {
      // Create a mint request by admin1

      await token.connect(admin1).requestMint(nonAdmin.address, 100);

      // Get the mint request details
      const request = await token.getMintRequest(0);

      expect(request.to).to.equal(nonAdmin.address);
      expect(request.amount).to.equal(100);
      expect(request.approvals).to.equal(0);
      expect(request.executed).to.be.false;
    });

    it("Should update the mint request approvals correctly", async () => {
        // Create a mint request by admin1
        await token.connect(admin1).requestMint(nonAdmin.address, 100);

        // Admin1 approves the request
        await token.connect(admin1).approveMint(0);
        let request = await token.getMintRequest(0);

        // Check that the approval count is 1
        expect(request.approvals).to.equal(1);
        expect(request.executed).to.be.false;

        // Admin2 approves the request
        await token.connect(admin2).approveMint(0);
        request = await token.getMintRequest(0);

        // Check that the approval count is 2 and request is executed
        expect(request.approvals).to.equal(2);
        expect(request.executed).to.be.true;
    });

    it("Should reflect executed status after minting", async () => {
        // Create a mint request
        await token.connect(admin1).requestMint(nonAdmin.address, 50);

        // Both admins approve
        await token.connect(admin1).approveMint(0);
        await token.connect(admin2).approveMint(0);

        // Get the mint request details after execution
        const request = await token.getMintRequest(0);

        expect(request.executed).to.be.true;

        // Check if the tokens were minted correctly
        const balance = await token.balanceOf(nonAdmin.address);
        expect(balance).to.equal(50);
    });

    it("Should revert when trying to get a non-existent mint request", async () => {
        await expect(token.getMintRequest(999)).to.be.reverted;
    });
  });

  describe("Admin Management", function () {
    it("should allow the owner to add an admin", async function () {
      await token.connect(owner).addAdmin(admin1.address);
      expect(await token.isAdmin(admin1.address)).to.be.true;
    });
  });

  describe("Minting with Multi-Signature Approval & Balance Checks", function () {
    beforeEach(async function () {
      // Add admins
      await token.connect(owner).addAdmin(admin1.address);
      await token.connect(owner).addAdmin(admin2.address);
    });

    it("should return empty balances before any minting", async function () {
      const [holders, balances] = await token.getAllBalances();
      expect(holders.length).to.equal(0);
      expect(balances.length).to.equal(0);
    });

    it("should return correct balances after minting is requested but not approved", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);

      const [holders, balances] = await token.getAllBalances();
      expect(holders.length).to.equal(0); // No minting executed yet
      expect(balances.length).to.equal(0);
    });

    it("should update balances after mint is approved and executed", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);

      // Approve the minting by two admins
      await token.connect(admin1).approveMint(0);
      await token.connect(admin2).approveMint(0);

      const [holders, balances] = await token.getAllBalances();
      expect(holders.length).to.equal(1);
      expect(holders[0]).to.equal(recipient.address);
      expect(balances[0]).to.equal(100);
    });

    it("should correctly track balances when multiple mints are executed", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);
      await token.connect(admin1).requestMint(owner.address, 200);

      // Approve both minting requests
      await token.connect(admin1).approveMint(0);
      await token.connect(admin2).approveMint(0);
      await token.connect(admin1).approveMint(1);
      await token.connect(admin2).approveMint(1);

      const [holders, balances] = await token.getAllBalances();

      // Check that there are two holders now
      expect(holders.length).to.equal(2);
      expect(holders).to.include(recipient.address);
      expect(holders).to.include(owner.address);

      // Check their respective balances
      const recipientIndex = holders.indexOf(recipient.address);
      const ownerIndex = holders.indexOf(owner.address);
      expect(balances[recipientIndex]).to.equal(100);
      expect(balances[ownerIndex]).to.equal(200);
    });

    it("should not include addresses in balances list if minting is not executed", async function () {
      await token.connect(admin1).requestMint(recipient.address, 100);
      await token.connect(admin1).approveMint(0); // Only one approval, not enough to execute

      const [holders, balances] = await token.getAllBalances();
      expect(holders.length).to.equal(0);
      expect(balances.length).to.equal(0);
    });
  });
});
