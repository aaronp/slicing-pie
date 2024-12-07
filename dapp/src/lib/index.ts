import { ethers, JsonRpcApiProvider, JsonRpcSigner } from 'ethers'

export type Balance = {
  label : string,
  address :string
  amount :number
}

export type Result<A> = A | string

export type MetaMask = {
  connectedAccounts : string[]
  provider : JsonRpcApiProvider
  signer : JsonRpcSigner
  signerAddress : string
  signerName : string | null
}

 // Function to fetch accounts from MetaMask
 export async function connectToMetaMask() : Promise<Result<MetaMask>> {
  if (typeof window.ethereum !== 'undefined') {
      try {
          // Request MetaMask accounts
          await window.ethereum.request({ method: 'eth_requestAccounts' })

          // Create an ethers provider
          const options = {
            cacheTimeout: -1,
          }
          const provider = new ethers.BrowserProvider(window.ethereum, null, options)

          // Get the list of accounts
          const accountList = await provider.listAccounts()
          
          const signer = await provider.getSigner()
          
          let signerAddress : string | null = ''
          try {
            signerAddress = await signer.getAddress()
          } catch (e) {
            signerAddress = `Error getting signer address ${e}`
          }


          let signerName : string | null = null
          try {
            signerName = await provider.lookupAddress(signerAddress)
          } catch (e) {
            console.error(`Error getting signer name ${e}`)
          }

          const mm : MetaMask = {
            connectedAccounts : accountList.map(account => account.address),
            provider,
            signer,
            signerAddress,
            signerName
          }

          return mm
      } catch (error) {
          return `Error fetching accounts: ${error.message}`
      }
  } else {
      return 'MetaMask is not installed. Please install it to continue.'
  }
}

export const idFromPath = (pathname: string, pathIndexFromEnd : number) => {
  const parts = pathname.split('/').filter((p) => p.length > 0)
  if (parts.length < 2) {
    return ''
  } else {
    const id = parts[parts.length - 1 - pathIndexFromEnd] ?? ''
    return id
  }
}
