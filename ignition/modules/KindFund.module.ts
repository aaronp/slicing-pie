import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
const { vars } = require("hardhat/config")

const INFURA_API_KEY = vars.get("INFURA_API_KEY")

const KindFundModule = buildModule("KindFundModule", (m) => {
  const underlyingAddress = m.getParameter("fund", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
  const owner = m.getParameter("owner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

  const fund = m.contract("KindFund", [underlyingAddress, owner],
    {
        from : '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    }
  );

  return { fund };
});

export default KindFundModule;
