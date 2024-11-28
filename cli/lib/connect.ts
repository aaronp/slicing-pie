import "https://deno.land/std@0.200.0/dotenv/load.ts"
import { ethers } from "https://esm.sh/ethers@6.7.1"
import { GruntFund } from "./GruntFund.ts"

export type ChainType = 'infura' | 'hardhat'

type ProviderMap = Record<string, string>

export type EnvSettings = {
  privateKey : string,
  providers: ProviderMap,
  gruntFundContractAddress : string,
  providerKey : string
}

// the web3 APIs
export type Web3Settings = {
  provider : ethers.JsonRpcProvider
  wallet : ethers.Wallet,
  signer: ethers.Signer
}

const EnvFileKey = "ENV_FILE"

export const loadSettings = () : EnvSettings => {
  const fileName = Deno.env.get(EnvFileKey)
  return loadSettingsFromFile(fileName ? fileName : ".env")
}

export const saveSettings = (s : EnvSettings) => {
  const fileName = Deno.env.get(EnvFileKey)
  return saveSettingsForFile(fileName ? fileName : ".env", s)
}

export const loadSettingsFromFile = (fileName : string) : EnvSettings => {
  try {
    const fileContents = Deno.readTextFileSync(fileName)
    return JSON.parse(fileContents) as EnvSettings
  } catch (e) {
    console.error(`Error loading ${fileName}: ${e}`)

    const defaults : EnvSettings = {
      privateKey: '',
      providers: {
        infura : 'https://mainnet.infura.io/v3/0b029fc5eea84b9babe57d1142e7570f',
        local : 'http://localhost:8545'
      },
      gruntFundContractAddress: '',
      providerKey: 'local'
    }
    return defaults
  }
}
export const saveSettingsForFile = (fileName : string, s : EnvSettings) => {
  Deno.writeFileSync(fileName, new TextEncoder().encode(JSON.stringify(s, null, 2)))
}

export const gruntFundForAddress = (address : string, c : Web3Settings) : GruntFund => {
  return new GruntFund(address, c.provider, c.signer)
}

export const connect = async (settings :EnvSettings) : Promise<Web3Settings> => {
  const url = settings.providers[settings.providerKey]
  const provider : ethers.JsonRpcProvider = new ethers.JsonRpcProvider(url)
  const wallet = new ethers.Wallet(settings.privateKey, provider)
  const signer = await provider.getSigner()
  return {
    provider,
    wallet,
    signer
  }
}