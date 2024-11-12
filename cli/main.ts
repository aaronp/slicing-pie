import pc from "npm:picocolors"
import { intro, outro, text, select, spinner } from "npm:@clack/prompts"

import "https://deno.land/std@0.200.0/dotenv/load.ts"
import { type Conn, type ChainType, connect, contractAddressEnv, gruntFundForAddress } from './connect.ts'

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {  
  intro(`👷👷👷 ${pc.bold(`Grunt Fund`)} 💰💰💰`)

  const chainChoice = await select({
    message: 'Select Chain:',
    options: [
      { value: 'hardhat', label: 'Local' },
      { value: 'infura', label: 'Infura' },
    ],
  });

  const c : Conn = await connect(chainChoice as ChainType)

  const defaultAddress = contractAddressEnv()
  const fundAddressInput = await text({
    message: 'Grunt Fund Address:',
    placeholder: '0xabc...',
    initialValue: defaultAddress,
    validate(value) {
      if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
    },
  })
  const fundAddress = fundAddressInput.toString().length == 0 ? defaultAddress : fundAddressInput.toString()
  const gruntFund = gruntFundForAddress(fundAddress, c)

  const operationChoice = await select({
    message: 'What would you like to do?',
    options: [
      { value: 'events', label: 'List Events' },
      { value: 'getAllBalances', label: 'Get All Balances' },
      { value: 'getBalance', label: 'Get Balance' },
      { value: 'mint', label: 'Mint' },
      { value: 'about', label: 'About' },
      { value: 'addresses', label: 'Show addresses' },
      { value: 'addMinter', label: 'Add a minter' },
    ],
  });

  const spin = <A>(msg: string) => async (thunk: () => Promise<A>): Promise<A> => {
    const s = spinner()
    s.start(msg)
    
    try {
      const value = await thunk()
      s.stop(msg)
      return value
    } catch(e) {
      s.stop(msg)
      // throw e
      console.error(e)
      Deno.exit(1)
    }
  }

  switch (operationChoice) {
    case 'mint': {
      const toAddress = await text({
        message: 'What address would you like to allocate tokens to?',
        placeholder: '0x...',
        initialValue: '',
        validate(value) {
          // if (value.length === 0) return `The address is required!`
          if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
        },
      })
      const amount = await text({
        message: 'How many?',
        placeholder: '1',
        initialValue: '',
        validate(value) {
          let ok = true
          try {
            const x = parseInt(value)
            ok = x > 0
          } catch (e) {
            ok = false
          }
          if (!ok) return `Invalid amount ${value}`
        },
      })
      const hash = await text({
        message: 'What is the document hash for the reference?',
        placeholder: 'hash...',
        initialValue: '',
        validate(value) {
          // if (value.length === 0) return `The address is required!`
          if (value.length === 0) return `Please enter the hash from a document`
        },
      })
      await spin(`Minting ${amount.toString()} for ${toAddress.toString()} ...`)(async () => {
        const result = await gruntFund.mint(toAddress.toString(), parseInt(amount.toString()), hash.toString())
        console.log('mint result: ', JSON.stringify(result, null, 2))
      })
      break
    }

    case 'events': {
      await spin(`Events:`)(async () => {
        const result = await gruntFund.events()
        console.log(JSON.stringify(result, null, 2))
      })
      break
    }

    case 'getAllBalances': {
      const addresses = await gruntFund.getAllAddresses()
      let totalBalance = 0
      let addressToBalance = {}
      for (const address of addresses) {
        const balance = await gruntFund.getBalance(address)
        const intBalance = parseInt(balance.toString())
        totalBalance += intBalance
        addressToBalance[address] = intBalance
      }


      console.log('Total Balance: ', totalBalance)
      for (const address in addressToBalance) {
        addressToBalance[address] = {
          value: addressToBalance[address],
          percentage: (addressToBalance[address] / totalBalance) * 100
        }
      }
      console.log(JSON.stringify({total : totalBalance, pie : addressToBalance}, null, 2))
      break
    }
    case 'getBalance': {
      const bAddress = await text({
        message: 'Which address?',
        placeholder: '0x...',
        initialValue: '',
        validate(value) {
          // if (value.length === 0) return `The address is required!`
          if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
        },
      })
      await spin(`Getting balance`)(async () => {
        const balance = await gruntFund.getBalance(bAddress.toString())
        const result = {
          balance : balance.toString()
        }
        console.log(JSON.stringify(result, null, 2))
      })
      break
    }
    case 'about': {
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
      break
    }
    case 'addMinter': {
      const defaultNewMinter = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      const addressInput = await text({
        message: 'What address would you like to make an admin?',
        placeholder: defaultNewMinter,
        initialValue: '',
        validate(value) {
          // if (value.length === 0) return `The address is required!`
          if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
        },
      })
      const address = addressInput && addressInput.toString().length > 0 ? String(addressInput) : defaultNewMinter

      console.log(`address:${address}`)
      await spin(`Making ${address} a minter ...`)(async () => {
        const result = await gruntFund.addMinter(String(address), c.signer)
        console.log('addMinter result: ', JSON.stringify(result, null, 2))
      })
      break
    }
    case 'addresses': {
      await spin(`Showing addresses ...`)(async () => {
        const result = await gruntFund.getAllAddresses()
        console.log(JSON.stringify(result, null, 2))
      })
      break
    }
    default: {
      outro('Invalid choice ' + operationChoice)
    }

    outro('Done!')
  }
  
}
