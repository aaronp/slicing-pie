import "https://deno.land/std@0.200.0/dotenv/load.ts"
import { ethers } from "https://esm.sh/ethers@6.7.1"
import { GruntFund } from "./GruntFund.ts"

// Load the seed phrase from environment variables
const fromEnv = (key : string) => {
    const seed = Deno.env.get(key)
    if (!seed) {
      console.error(`Error: ${key} is not set in the environment variables (e.g. an .env file containing a ${key}).`)
      Deno.exit(1)
    }
    return seed
  }
  // const seedPhrase = () => fromEnv("SEED_PHRASE")
  const privateKeyFromEnv = () => fromEnv("PRIVATE_KEY")
  const infuraKey = () => fromEnv("INFURA_API_KEY")
  export const contractAddressEnv = () => fromEnv("CONTRACT_ADDRESS")
  
  const infuraProvider = () => new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraKey()}`)
  const hardhatProvider = () => new ethers.JsonRpcProvider("http://localhost:8545")
  
  export type Conn = {
    provider : ethers.JsonRpcProvider
    wallet : ethers.Wallet,
    signer: ethers.Signer
  }


  export const gruntFundForAddress = (address : string, c : Conn) : GruntFund => {
    return new GruntFund(address, c.provider, c.signer)
  }
  

  export type ChainType = 'infura' | 'hardhat'

  export const connect = async (to : ChainType) : Promise<Conn> => {
    let provider : ethers.JsonRpcProvider | null = null
    if (to === 'infura') {
      provider = infuraProvider()
    } else if (to === 'hardhat') {
      provider = hardhatProvider()
    } else {
        throw new Error(`I didn't understand ${to}`)
    }

    const wallet = new ethers.Wallet(privateKeyFromEnv(), provider)
    const signer = await provider.getSigner()

    return {
      provider,
      wallet,
      signer
    }
  }