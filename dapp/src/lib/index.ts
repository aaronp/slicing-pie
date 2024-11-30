import { ethers, JsonRpcApiProvider, JsonRpcSigner } from 'ethers'

export type Balance = {
  label : string,
  address :string
  amount :number
}


export type ArcCoords = {
  sectionAngle : number,
  startAngle : number,
  endAngle : number,
  
  x1 : number,
  y1 : number,
  x2 : number,
  y2 : number
}


// our application settings, saved to persistent (perhaps local) storage
export type Settings = {

  // grunts in a <name>:<address> format
  grunts : string,

  // funds in a <name>:<address> format
  funds : string,

  // the kind group address
  kindContractAddress : string
}

export type Result<A> = A | string

export type MetaMask = {
  connectedAccounts : string[]
  provider : JsonRpcApiProvider
  signer : JsonRpcSigner
  signerAddress : string
  signerName : string | null
}

import { writable } from 'svelte/store';


// Optionally, provide functions to update or reset the store
// export const setFoo = (value: string) => foo.set(value);
// export const resetFoo = () => foo.set(null);


 // Function to fetch accounts from MetaMask
 export async function connectToMetaMask() : Promise<Result<MetaMask>> {
  if (typeof window.ethereum !== 'undefined') {
      try {
          console.log('Connecting to MetaMask')
          // Request MetaMask accounts
          await window.ethereum.request({ method: 'eth_requestAccounts' })

          // Create an ethers provider
          console.log('Getting provider')
          const provider = new ethers.BrowserProvider(window.ethereum)

          // Get the list of accounts
          console.log('listing accounts')
          const accountList = await provider.listAccounts()
          
          console.log('getting signer')
          const signer = await provider.getSigner()
          console.log('getting signer address')
          let signerAddress : string | null = ''
          try {
            signerAddress = await signer.getAddress()
          } catch (e) {
            signerAddress = `Error getting signer address ${e}`
          }


          let signerName : string | null = null
          console.log('getting signer name')
          try {
            signerName = await provider.lookupAddress(signerAddress)
          } catch (e) {
            console.error(`Error getting signer name ${e}`)
          }

          console.log('creating mm details')
          const mm : MetaMask = {
            connectedAccounts : accountList.map(account => account.address),
            provider,
            signer,
            signerAddress,
            signerName
          }

          console.log(`got ${JSON.stringify(mm, null, 2)}`)
          return mm
      } catch (error) {
          return `Error fetching accounts: ${error.message}`
      }
  } else {
      return 'MetaMask is not installed. Please install it to continue.'
  }
}

export type LabeledAddress = {
    label : string
    address : string
}

// takes a text block and sparates the lines into key:value pairs
export const splitMapping = (content : string) : LabeledAddress[] => {
    return content.split('\n')
        .map(line => line.trim())
        .filter(line => line.includes(':'))
        .map(line => {
            const [label, address] = line.split(':').map(part => part.trim());
            return { label, address }
        })
}

const defaultSettings = () : Settings => {
    return {
      grunts : '',
      funds : '',
      kindContractAddress : ''
    }
  }

  // let address : string = $state('');
export const loadSettings = () : Settings => {
    const str = localStorage.getItem('grunt-settings')
    if (!str) {
        saveSettings(defaultSettings())
        return loadSettings()
    } else {
        return JSON.parse(str) as Settings
    }
}

export const saveSettings = (s : Settings) => localStorage.setItem('grunt-settings', JSON.stringify(s))


export const idFromPath = (pathname: string) => {
    const parts = pathname.split('/').filter((p) => p.length > 0)
    if (parts.length < 2) {
      return ''
    } else {
      const id = parts[parts.length - 1] ?? ''
      return id
    }
  }

export const degToRad = (degrees : number) => (degrees * Math.PI) / 180

export const arcForIndex = (centerX : number, centerY : number, numSections :number, index :number, r : number) : ArcCoords => {
    const sectionAngle = degToRad(360 / numSections)
    const startAngle = index * sectionAngle
    const endAngle = (index + 1) * sectionAngle

    const x1 = centerX + r * Math.cos(startAngle)
    const y1 = centerY + r * Math.sin(startAngle)
    const x2 = centerX + r * Math.cos(endAngle)
    const y2 = centerY + r * Math.sin(endAngle)
    return {
      sectionAngle, startAngle, endAngle,
      x1, y1, x2, y2
    }
  }