import { ethers } from "ethers"
import { type MetaMask } from "$lib"


const abi = [
  "function getAllFunds() view returns (address[] memory)",
  "function mint(address person, address fundAddress, uint256 amount, string memory documentHash)",
  "event Minted(address indexed person, address indexed fundAddress, uint256 amount, string documentHash)",
]

export type EventData = {
  event: string;
  args: Array<Record<string, any>>;
  timestamp: Date;
}

export class KindFund {
  public contract: ethers.Contract
  public contractWithSigner: ethers.BaseContract
  public signer : ethers.Signer
  public provider : ethers.Provider

  constructor(contractAddress: string, provider: ethers.Provider, signer: ethers.Signer) {
    this.contract = new ethers.Contract(contractAddress, abi, provider)
    this.contractWithSigner = this.contract.connect(signer)
    this.signer = signer
    this.provider = provider
  }

  static forSettings(address : string, account : MetaMask): KindFund {
    return new KindFund(address, account.provider, account.signer)
  }

  // Static method to initialize KindFund with a browser provider
  static async forAddress(contractAddress: string): Promise<KindFund> {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found. Install MetaMask or another wallet.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    return new KindFund(contractAddress, provider, signer)
  }
  
  async events(from : string = 'earliest') : Promise<EventData[]> {
    const filter = {
      address: await this.contract.getAddress(),
      fromBlock: from,
      toBlock: 'latest',
    }

    const iface = new ethers.Interface(abi)
    const logs = await this.provider.getLogs(filter)

    const payloads = Promise.all(logs.map(async  (log) => {
      const parsedLog = iface.parseLog(log)

      const block = await this.provider.getBlock(log.blockNumber)

      // Extract timestamp from the block
      const timestamp = block.timestamp

      // Convert the timestamp to a human-readable date
      const date = new Date(timestamp * 1000)

      const args = parsedLog?.args.toObject()
      const mappedArgs = Object.keys(args).reduce((acc, key) => {
        acc[key] = args[key].toString()
        return acc
      }, {});
      return {
        event: parsedLog.name,
        args: mappedArgs,
        timestamp : date
      }
    }))
    return payloads
  }

  async getAllFunds(): Promise<string[]> {
    return await this.contract.getAllFunds();
  }

  async mint(
    recipient: string,
    fund: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    return await this.contractWithSigner.mint(recipient, fund, amount, documentHash)
  }
}
