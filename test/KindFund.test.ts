import { ethers } from "hardhat"
import { expect } from "chai"
import { KindFund, GruntFund } from "../typechain-types"
import { ContractTransaction, ContractTransactionResponse } from "ethers"

describe("KindFund Contract", function () {
  let owner: any
  let otherUser: any
  let kindFund: KindFund
  let holdingKindFund: GruntFund
  let holdingKindFundAddress :string
  let gruntFund2: GruntFund
  let gruntFund2Address :string

  let AddressZero = ethers.ZeroAddress

  // let kindFundAddress : string

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners()

    // Deploy a GruntFund contract
    const GruntFund = await ethers.getContractFactory("GruntFund")
    holdingKindFund = await GruntFund.deploy("GruntFund1", "GF1", owner.address)

    holdingKindFundAddress = await holdingKindFund.getAddress()
    console.log(`deployed to ${holdingKindFundAddress}`)

    gruntFund2 = await GruntFund.deploy("GruntFund2", "GF2", owner.address)
    gruntFund2Address = await gruntFund2.getAddress()
    // const deployTxn2 = gruntFund2.deploymentTransaction()
    // console.log(`deployed 2: ${JSON.stringify(deployTxn1, null, 2)}`)

    // Deploy the KindFund contract with holdingKindFund as the primary fund
    const KindFund = await ethers.getContractFactory("KindFund")
    kindFund = await KindFund.deploy(holdingKindFundAddress, owner.address)

    // await kindFund.deployed()
    const kindFundAddress = await kindFund.getAddress()
    // console.log(`deployed kindFund to ${kindFundAddress}`)

    // our grunt funds need to allow the Kind contract to mind
    await holdingKindFund.addMinter(kindFundAddress)
    await gruntFund2.addMinter(kindFundAddress)
  })

  it("should mint tokens correctly in happy path", async function () {
    const amount = 100
    const documentHash = "doc123"

    console.log(`DEBUG: ${JSON.stringify({
      gruntFund2Address,
      holdingKindFundAddress

    }, null, 2)}`)
    // Call mint function
    await expect(
      kindFund.mint(otherUser.address, gruntFund2Address, amount, documentHash)
    )
      .to.emit(kindFund, "Minted")
      .withArgs(otherUser.address, gruntFund2Address, amount, documentHash)


    // Check Grunt Fund's allFunds list
    const allAddressesInGruntFund = await gruntFund2.getAllAddresses()
    expect(allAddressesInGruntFund).to.deep.equal([holdingKindFundAddress])


    // Check balances in GruntFund
    expect(await gruntFund2.balancesByAddress(holdingKindFundAddress)).to.equal(amount)
    expect(await holdingKindFund.balancesByAddress(otherUser.address)).to.equal(amount)

    // Check KindFund's allFunds list
    const allFunds = await kindFund.getAllFunds()
    expect(allFunds).to.deep.equal([gruntFund2Address])
  })

  it("should add new GruntFund addresses and mint tokens", async function () {
    const amount = 200
    const documentHash = "doc456"

    // Call mint with a different GruntFund
    await expect(
      kindFund.mint(otherUser.address, gruntFund2Address, amount, documentHash)
    )
      .to.emit(kindFund, "Minted")
      .withArgs(otherUser.address, gruntFund2Address, amount, documentHash)

    // Check balances in GruntFund
    expect(await gruntFund2.balancesByAddress(holdingKindFundAddress)).to.equal(amount)
    expect(await holdingKindFund.balancesByAddress(otherUser.address)).to.equal(amount)

    // Check KindFund's allFunds list
    const allFunds = await kindFund.getAllFunds()
    expect(allFunds).to.include(gruntFund2Address)
    expect(allFunds).to.not.include(holdingKindFundAddress)
  })

  it("should fail when non-owner calls mint", async function () {
    const amount = 50
    const documentHash = "docFail"

    // Try to call mint as a non-owner
    await expect(
      kindFund.connect(otherUser).mint(otherUser.address, holdingKindFundAddress, amount, documentHash)
    ).to.be.revertedWith("Caller is not the owner")
  })

  it("should reject attempts to treat the kind fund as an underlying fund", async function () {
    // Try mint with zero recipient address
    await expect(
      kindFund.mint(otherUser.address, holdingKindFundAddress, 100, "docError")
    ).to.be.revertedWith("Trying to treat the kind fund (group) as an underlying fund. Use the kind fund directly to book equity if that's what is intended")
  })

  it("should revert if recipient or fund address is zero", async function () {
    const amount = 100
    const documentHash = "docError"

    // Try mint with zero recipient address
    await expect(
      kindFund.mint(AddressZero, gruntFund2Address, amount, documentHash)
    ).to.be.revertedWith("Recipient address cannot be zero")

    // Try mint with zero fund address
    await expect(
      kindFund.mint(otherUser.address, AddressZero, amount, documentHash)
    ).to.be.revertedWith("Fund address cannot be zero")
  })

  it("should revert if amount is zero", async function () {
    const documentHash = "docZero"

    // Try mint with zero amount
    await expect(
      kindFund.mint(otherUser.address, gruntFund2Address, 0, documentHash)
    ).to.be.revertedWith("Mint amount must be greater than zero")
  })

  it("should handle repeated mints for the same GruntFund", async function () {
    const amount1 = 100
    const amount2 = 50
    const documentHash1 = "docRepeat1"
    const documentHash2 = "docRepeat2"

    // Mint once
    await kindFund.mint(otherUser.address, gruntFund2Address, amount1, documentHash1)

    // Mint again to the same fund
    await expect(
      kindFund.mint(otherUser.address, gruntFund2Address, amount2, documentHash2)
    )
      .to.emit(kindFund, "Minted")
      .withArgs(otherUser.address, gruntFund2Address, amount2, documentHash2)

    // Check balances
    expect(await gruntFund2.balancesByAddress(holdingKindFundAddress)).to.equal(amount1 + amount2)
    expect(await holdingKindFund.balancesByAddress(otherUser.address)).to.equal(amount1 + amount2)

    // Ensure no duplicate entries in allFunds
    const allFunds = await kindFund.getAllFunds()
    expect(allFunds).to.have.lengthOf(1)
    expect(allFunds).to.include(gruntFund2Address)
  })
})
