import { spin } from "./util.ts"
import { text } from "npm:@clack/prompts"
import { GruntFund } from "./GruntFund.ts"

export const getSingleBalance = async (gruntFund : GruntFund) => {
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
}

export const getBalances = async (gruntFund : GruntFund) => {
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
}