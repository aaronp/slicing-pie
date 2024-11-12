import { expect } from "chai"
import { ethers } from "hardhat"

describe("GruntFund Contract", function () {
  let GruntFund: any
  let gruntFund: any
  let owner: any, minter: any, addr1: any, addr2: any

  beforeEach(async () => {
    [owner, minter, addr1, addr2] = await ethers.getSigners()
    const GruntFundFactory = await ethers.getContractFactory("GruntFund")
    gruntFund = await GruntFundFactory.deploy("GruntToken", "GT")
  })

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await gruntFund.name()).to.equal("GruntToken")
      expect(await gruntFund.symbol()).to.equal("GT")
    })

    it("Should set the deployer as the owner and initial minter", async function () {
      expect(await gruntFund.owner()).to.equal(owner.address)
      expect(await gruntFund.allowedMinters(owner.address)).to.be.true
    })
  })

  describe("Minter Management", function () {
    it("Owner can add a new minter and emit an event", async function () {
      await expect(gruntFund.addMinter(minter.address))
        .to.emit(gruntFund, "MinterAdded")
        .withArgs(minter.address)
      expect(await gruntFund.allowedMinters(minter.address)).to.be.true
    })

    it("Non-minters cannot add a new minter", async function () {
      await expect(gruntFund.connect(addr1).addMinter(addr1.address)).to.be.revertedWith("Caller is not an allowed minter")
    })

    it("Owner can remove a minter and emit an event", async function () {
      await gruntFund.addMinter(minter.address)
      await expect(gruntFund.removeMinter(minter.address))
        .to.emit(gruntFund, "MinterRemoved")
        .withArgs(minter.address)
      expect(await gruntFund.allowedMinters(minter.address)).to.be.false
    })

    it("Non-owners cannot remove a minter", async function () {
      await expect(gruntFund.connect(minter).removeMinter(owner.address)).to.be.revertedWith("Caller is not the owner")
    })
  })

  describe("Minting", function () {
    it("Allowed minters can mint tokens and emit an event", async function () {
      await gruntFund.addMinter(minter.address)
      await expect(gruntFund.connect(minter).mint(addr1.address, 1000, "hash1"))
        .to.emit(gruntFund, "Allocated")
        .withArgs(addr1.address, 1000, "hash1")

      expect(await gruntFund.balancesByAddress(addr1.address)).to.equal(1000)
      expect(await gruntFund.balancesByAddress(minter.address)).to.equal(0)
      expect(await gruntFund.balancesByAddress(owner.address)).to.equal(0)
    })

    it("Non-minters cannot mint tokens", async function () {
      await expect(gruntFund.connect(addr1).mint(addr1.address, 1000, "hash1")).to.be.revertedWith("Caller is not an allowed minter")
    })

    it("Addresses are added to the address list on minting", async function () {
      await gruntFund.mint(addr1.address, 1000, "hash1")
      expect(await gruntFund.getAllAddresses()).to.include(addr1.address)
    })
  })

  describe("Transfers", function () {
    beforeEach(async function () {
      await gruntFund.mint(owner.address, 2000, "hash2")
    })

    it("Owner can transfer tokens and emit an event", async function () {
      await expect(gruntFund.transfer(addr1.address, 500, "hash3"))
        .to.emit(gruntFund, "Transfer")
        .withArgs(owner.address, addr1.address, 500, "hash3")

      expect(await gruntFund.balancesByAddress(owner.address)).to.equal(1500)
      expect(await gruntFund.balancesByAddress(addr1.address)).to.equal(500)
      expect(await gruntFund.balancesByAddress(addr2.address)).to.equal(0)
    })

    it("Insufficient balance should revert", async function () {
      await expect(gruntFund.transfer(addr1.address, 3000, "hash4")).to.be.revertedWith("Insufficient balance")
    })

    it("Unauthorized transfers should revert", async function () {
      await expect(gruntFund.connect(addr1).transfer(addr2.address, 500, "hash5")).to.be.revertedWith("Unauthorized transfer")
    })

    it("Transfer should add new address to address list", async function () {
      await gruntFund.transfer(addr1.address, 500, "hash6")
      expect(await gruntFund.getAllAddresses()).to.include(addr1.address)
    })
  })

  describe("Forced Transfers", function () {
    beforeEach(async function () {
      await gruntFund.mint(addr1.address, 1000, "hash7")
    })

    it("Owner can force transfer tokens and emit an event", async function () {
      await expect(gruntFund.forceTransfer(addr1.address, addr2.address, 500))
        .to.emit(gruntFund, "ForcedTransfer")
        .withArgs(addr1.address, addr2.address, 500)

      expect(await gruntFund.balancesByAddress(addr1.address)).to.equal(500)
      expect(await gruntFund.balancesByAddress(addr2.address)).to.equal(500)
      expect(await gruntFund.balancesByAddress(owner.address)).to.equal(0)
    })

    it("Non-owners cannot force transfer tokens", async function () {
      await expect(gruntFund.connect(addr1).forceTransfer(addr1.address, addr2.address, 500)).to.be.revertedWith("Caller is not the owner")
    })

    it("Forced transfer with insufficient balance should revert", async function () {
      await expect(gruntFund.forceTransfer(addr1.address, addr2.address, 2000)).to.be.revertedWith("Insufficient balance")
    })
  })

  describe("Edge Cases", function () {
    it("Adding duplicate addresses should not duplicate entries", async function () {
      await gruntFund.mint(addr1.address, 1000, "hash8")
      await gruntFund.mint(addr1.address, 500, "hash9")
      const addresses = await gruntFund.getAllAddresses()
      expect(addresses.filter((addr: string) => addr === addr1.address).length).to.equal(1)
    })

    it("Removing a minter does not affect existing balances", async function () {
      await gruntFund.addMinter(minter.address)
      await gruntFund.connect(minter).mint(addr1.address, 1000, "hash10")
      await gruntFund.removeMinter(minter.address)
      expect(await gruntFund.balancesByAddress(addr1.address)).to.equal(1000)
    })
  })
})
