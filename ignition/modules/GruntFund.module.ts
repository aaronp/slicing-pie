import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
const { vars } = require("hardhat/config")


const GruntFundModule = buildModule("GruntFundModule", (m) => {

  console.log('getting name')
  const fundName = vars.get("NAME")
  console.log('got ', fundName)
  const fundSymbol = vars.get("SYMBOL")
  const owner = vars.get("OWNER", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

  // const fundName = m.getParameter("name", "Default Grunt Fund")
  // const fundSymbol = m.getParameter("symbol", "DGF")
  // const owner = m.getParameter("owner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

  const fund = m.contract("GruntFund", [fundName, fundSymbol, owner],
    {
        from : owner
        // from : '0x72A828e687d92b485C9e4827FDF21D94B10769D6'
      }
  );

  return { fund }
});

export default GruntFundModule;
