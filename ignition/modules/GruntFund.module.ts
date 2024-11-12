import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getAddress } from 'ethers'

const GruntFundModule = buildModule("GruntFundModule", (m) => {
  const fundName = m.getParameter("name", "Default Grunt Fund")
  const fundSymbol = m.getParameter("symbol", "DGF")
  const owner = m.getParameter("owner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

  const fund = m.contract("GruntFund", [fundName, fundSymbol, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
    {
        from : '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        // from : '0x72A828e687d92b485C9e4827FDF21D94B10769D6'
      }
  );

  // const lock = m.contract("GruntFund", [fundName, fundSymbol, requiredApprovals], {
  //   from : '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'
  // });
  return { fund }
});

export default GruntFundModule;
