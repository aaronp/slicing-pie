const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GruntFund", function () {
  let token;
  let owner, admin1, admin2, admin3, recipient;

  beforeEach(async function () {
    [owner, admin1, admin2, admin3, recipient] = await ethers.getSigners();

    const GruntFund = await ethers.getContractFactory("GruntFund");
    token = await GruntFund.deploy("TestToken", "TTK", 2); // 2 required approvals
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
