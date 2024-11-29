import { ethers } from "https://esm.sh/ethers@6.7.1"



const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "function balancesByAddress(address) view returns (uint256)",
  "function addresses(uint256) view returns (address)",
  "function allowedMinters(address) view returns (bool)",
  "function addMinter(address) external",
  "function removeMinter(address) external",
  "function mint(address, uint256, string) external",
  "function transfer(address, uint256, string) external",
  "function forceTransfer(address, address, uint256, string) external",
  "function getAllAddresses() external view returns (address[] memory)",
  "event MinterAdded(address indexed minter)",
  "event MinterRemoved(address indexed minter)",
  "event Allocated(address indexed recipient, uint256 amount, string documentHash)",
  "event Transfer(address indexed from, address indexed to, uint256 amount, string documentHash)",
  "event ForcedTransfer(address indexed from, address indexed to, uint256 amount, string documentHash)"
]


export class GruntFund {
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

  
  // Read-only methods
  async getName(): Promise<string> {
    return await this.contract.name()
  }

  async getSymbol(): Promise<string> {
    return await this.contract.symbol()
  }

  async getOwner(): Promise<string> {
    return await this.contract.owner()
  }

  async getBalance(address: string): Promise<ethers.BigNumberish> {
    return await this.contract.balancesByAddress(address)
  }

  async getAddresses(index: number): Promise<string> {
    return await this.contract.addresses(index)
  }

  async events() {
    const filter = {
      address: await this.contract.getAddress(),
      fromBlock: 0,
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

  async isAllowedMinter(address: string): Promise<boolean> {
    return await this.contract.allowedMinters(address)
  }

  async getAllAddresses(): Promise<string[]> {
    const addresses = await this.contract.getAllAddresses()
    return addresses
  }

  // Write methods
  async addMinter(minterAddress: string): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer)
    return await this.contractWithSigner.addMinter(minterAddress)
  }

  async removeMinter(minterAddress: string): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer)
    return await this.contractWithSigner.removeMinter(minterAddress)
  }

  async mint(
    recipient: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer)
    return await this.contractWithSigner.mint(recipient, amount, documentHash)
  }

  async transfer(
    to: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(this.signer)
    return await this.contractWithSigner.transfer(to, amount, documentHash)
  }

  async forceTransfer(
    from: string,
    to: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer)
    return await this.contractWithSigner.forceTransfer(from, to, amount, documentHash)
  }
}
