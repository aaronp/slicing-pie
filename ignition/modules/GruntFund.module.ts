import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GruntFundModule = buildModule("GruntFundModule", (m) => {
  const fundName = m.getParameter("name", "Default Grunt Fund");
  const fundSymbol = m.getParameter("symbol", "DGF");
  const requiredApprovals = m.getParameter("approvals", "2");

  const fund = m.contract("GruntFund", [fundName, fundSymbol, requiredApprovals]);

  // const lock = m.contract("GruntFund", [fundName, fundSymbol, requiredApprovals], {
  //   from : '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'
  // });
  return { fund };
});

export default GruntFundModule;
