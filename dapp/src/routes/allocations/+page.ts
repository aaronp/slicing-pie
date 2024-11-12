import { ethers } from "ethers";

const abi = [
  "function requestMint(address to, uint256 amount) external",
  "event MintRequested(uint256 indexed requestId, address indexed to, uint256 amount)"
];


// Function to request minting
export async function _requestMint(contractAddress : string, to: string, amount: string) {
  try {
    // Check if MetaMask is available
    if (!window.ethereum) {
      console.error("MetaMask is not installed!")
      return { success: false, message: "MetaMask is not installed" }
    }

    // Connect to MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", []) // Request account access
    const signer = await provider.getSigner()

    // Create a contract instance with the connected signer
    const contract = new ethers.Contract(contractAddress, abi, signer)

    // Call the requestMint function
    console.log(`Calling Transaction with ${to} and ${amount}`)
    const tx = await contract.requestMint(to, amount)
    console.log(`Transaction sent: ${tx.hash}`)

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    // Check for the MintRequested event in the transaction receipt
    const event = receipt.logs
      .map(log => contract.interface.parseLog(log))
      .find(e => e.name === "MintRequested");

    if (event) {
      const [requestId, toAddress, mintAmount] = event.args;
      console.log(`Mint request created: ID=${requestId}, To=${toAddress}, Amount=${mintAmount}`);
      return { success: true, message: "Mint request successful", requestId };
    }

    return { success: true, message: "Transaction confirmed" };
  } catch (error) {
    alert("Error while requesting mint:" + error);
    return { success: false, message: (error as Error).message };
  }
}
