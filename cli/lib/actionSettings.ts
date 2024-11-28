import { select, text } from "npm:@clack/prompts"
import { spin } from "./util.ts"
import { GruntFund } from "./GruntFund.ts"
import { type Web3Settings, type EnvSettings, gruntFundForAddress, saveSettings } from './connect.ts'

export const listAddresses = async (gruntFund : GruntFund) => {
  await spin(`Showing addresses ...`)(async () => {
    const result : string[] = await gruntFund.getAllAddresses()

    const mapped = await Promise.all(result.map(async (a) => {
      const isMinter = await gruntFund.isAllowedMinter(a)
      return {
        address : a,
        isMinter : isMinter
      }
    }))

    console.log(JSON.stringify(mapped, null, 2))
  })
}

// try to load our grunt fund from env variables, otherwise redirect to settings
export const loadGruntFund = (settings : EnvSettings, c : Web3Settings) => {

  const fundAddress = settings.gruntFundContractAddress
  return gruntFundForAddress(fundAddress, c)
}

export const updateSettings = async (oldSettings : EnvSettings) => {
   
  const newSettings = { ... oldSettings}

    const keys = Object.keys(newSettings.providers)
    const options = keys.map((k) => {
      return { value: k, label: k }
    })
    const chainChoice = await select({
        message: 'Select Chain:',
        options: [...options, 
          { value: 'other', label: 'Other' },
        ],
      });

    if (chainChoice === 'other') {
      // add a new entry
      const name = await text({
        message: 'Chain Name:',
        placeholder: 'beacon',
        initialValue: ''
      })
      const url = await text({
        message: 'URL:',
        placeholder: 'https://...',
        initialValue: ''
      })

      newSettings.providerKey = String(name)
      newSettings.providers[newSettings.providerKey] = String(url)
    } else {
      newSettings.providerKey = String(chainChoice)
    }

      // add a new entry
    const newPrivateKey = await text({
      message: 'Private Key: (or enter to leave unchanged)',
      placeholder: '0x...',
      initialValue: ''
    })
    if (newPrivateKey && String(newPrivateKey).length > 0) {
      newSettings.privateKey = String(newPrivateKey)
    }

    const fundAddress = await text({
      message: 'Grunt Fund Address:',
      placeholder: newSettings.gruntFundContractAddress,
      initialValue: '',
      validate(value) {
        if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
      },
    })
    if (fundAddress && String(fundAddress).length > 0) {
      newSettings.gruntFundContractAddress = String(fundAddress)
    }

    saveSettings(newSettings)
    return newSettings
}

export const about = async (gruntFund : GruntFund, c : Web3Settings) => {
  await spin(`About`)(async () => {
    const owner = await gruntFund.getOwner()
    const symbol = await gruntFund.getSymbol()
    const name = await gruntFund.getName()
    const walletAddress = await c.wallet.getAddress()
    const signerAddress = await c.signer.getAddress()
    const result = {
      owner, symbol, name, walletAddress, signerAddress
    }
    console.log(JSON.stringify(result, null, 2))
  })
}