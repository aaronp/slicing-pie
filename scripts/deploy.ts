// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat'

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const GruntFund = await ethers.getContractFactory('GruntFund')
  const deployed = await GruntFund.deploy('Some Fund', 'ABC', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
  // await erc20.deployed();
  console.log('GruntFund deployed to:', await deployed.getAddress());

//   const ERC721 = await ethers.getContractFactory('ERC721WithData');
//   const erc721 = await ERC721.deploy('FFNFT', 'FFNFT', "");
//   // await erc721.deployed();
//   console.log('ERC-721 contract deployed to:', await erc721.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
