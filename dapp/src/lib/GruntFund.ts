import { ethers } from "ethers"
import { type MetaMask } from "$lib"
import { KindFund } from "./KindFund"
import { persistPendingTransaction } from "./pendingTransactions"


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
  "function getAllAddresses() external view returns (address[] memory)",
  "event MinterAdded(address indexed minter)",
  "event MinterRemoved(address indexed minter)",
  "event Allocated(address indexed recipient, uint256 amount, string documentHash)",
  "event Transfer(address indexed from, address indexed to, uint256 amount, string documentHash)"
]
export type EventData = {
  event: string;
  args: Array<Record<string, any>>;
  timestamp: Date;
}

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

  static forSettings(address : string, account : MetaMask): GruntFund {
    return new GruntFund(address, account.provider, account.signer)
  }

  // Static method to initialize GruntFund with a browser provider
  static async forAddress(contractAddress: string): Promise<GruntFund> {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found. Install MetaMask or another wallet.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    return new GruntFund(contractAddress, provider, signer)
  }

  /**
   * 
   * @param kindAddress the address of the kind holding group contract
   * @param recipient the grunt recipient
   * @param amount the amount to mint
   * @param documentHash a document hash
   * @returns 
   */
  async mintForKindFund(kindAddress : string, recipient : string, amount : ethers.BigNumberish, documentHash : string) {
    const kind = new KindFund(kindAddress, this.provider, this.signer)
    const thisAddress = await this.contract.getAddress()
    return await this.wrapASync(`mintForKindFund(${kindAddress}, ${recipient}, ${amount}, ${documentHash})`, async () => kind.mint(recipient, thisAddress, amount, documentHash))
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

  async isAllowedMinter(address: string): Promise<boolean> {
    return await this.contract.allowedMinters(address)
  }

  async getAllAddresses(): Promise<string[]> {
    return await this.contract.getAllAddresses()
  }

  private async wrapASync<A> (fn : string, closure: () => Promise<A>): Promise<A> {
    try {
      console.log(`>>> Calling ${fn}`)
      const response = await closure()
      console.log(`>>> ${fn} returned ${typeof response}: \n${JSON.stringify(response, null, 2)}\n\n`)
      
      if (typeof response === 'object' && 'hash' in response) {
        const txnHash = response.hash
        if (txnHash) {
          try {
            persistPendingTransaction(txnHash, fn, response as Record<string, any>)
          } catch(e) {
            console.error(`error persisting pending transaction ${txnHash}: ${e}`)
          }
        }
      } else {
        console.log(`not saving pending response as ${typeof response} and ${'hash' in response} don't pass`)
      }
      return response
    } catch (error) {
      console.error("An error occurred:", error)
      throw error
    }
  }

  // Write methods
  async addMinter(minterAddress: string): Promise<ethers.ContractTransaction> {
    return await this.wrapASync(`addMinter(${minterAddress})`, async () => this.contractWithSigner.addMinter(minterAddress))
  }

  async removeMinter(minterAddress: string): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer)
    return await this.wrapASync(`removeMinter(${minterAddress})`, async () => this.contractWithSigner.removeMinter(minterAddress))
  }

  async mint(
    recipient: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer)
    return await this.wrapASync(`mint(${recipient}, ${amount}, ${documentHash})`, async () => this.contractWithSigner.mint(recipient, amount, documentHash))
  }

  async transfer(
    to: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(this.signer)
    return await this.wrapASync(`transfer(${to}, ${amount}, ${documentHash})`, async () => this.contractWithSigner.transfer(to, amount, documentHash))
  }
}
