import { HardhatRuntimeEnvironment } from 'hardhat/types';
// import { ModuleBuilder } from '@hardhat/ignition';

export default async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;
  const { deploy } = deployments;

  const GruntFundDeployment = await deploy('GruntFund', {
    args: ['GruntToken', 'GT', 2], // Change these arguments as needed
    from: (await ethers.getSigners())[0].address,
    log: true,
  });

  console.log(`GruntFund deployed at: ${GruntFundDeployment.address}`);
}
