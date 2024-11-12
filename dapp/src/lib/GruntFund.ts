import { ethers } from "ethers"
import { type Settings as AppSettings, type MetaMask } from "$lib"

export class GruntFund {
  public contract: ethers.Contract;
  public contractWithSigner: ethers.BaseContract;
  public signer : ethers.Signer;
  public provider : ethers.Provider;
  constructor(contractAddress: string, provider: ethers.Provider, signer: ethers.Signer) {


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
      "function forceTransfer(address, address, uint256) external",
      "function getAllAddresses() public view returns (address[])"
    ];

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

  
  // Read-only methods
  async getName(): Promise<string> {
    return await this.contract.name();
  }

  async getSymbol(): Promise<string> {
    return await this.contract.symbol();
  }

  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }

  async getBalance(address: string): Promise<ethers.BigNumberish> {
    return await this.contract.balancesByAddress(address);
  }

  async getAddresses(index: number): Promise<string> {
    return await this.contract.addresses(index);
  }

  async isAllowedMinter(address: string): Promise<boolean> {
    return await this.contract.allowedMinters(address);
  }

  async getAllAddresses(): Promise<string[]> {
    return await this.contract.getAllAddresses();
  }

  // Write methods
  async addMinter(minterAddress: string, signer: ethers.Signer): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.contract.connect(signer);
    return await contractWithSigner.addMinter(minterAddress);
  }

  async removeMinter(minterAddress: string): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.contract.connect(signer);
    return await contractWithSigner.removeMinter(minterAddress);
  }

  async mint(
    recipient: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer);
    return await this.contractWithSigner.mint(recipient, amount, documentHash);
  }

  async transfer(
    to: string,
    amount: ethers.BigNumberish,
    documentHash: string
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = this.contract.connect(signer);
    return await contractWithSigner.transfer(to, amount, documentHash);
  }

  async forceTransfer(
    from: string,
    to: string,
    amount: ethers.BigNumberish
  ): Promise<ethers.ContractTransaction> {
    // const contractWithSigner = this.contract.connect(signer);
    return await this.contractWithSigner.forceTransfer(from, to, amount);
  }
}
