import { text } from "npm:@clack/prompts"
import { spin, readAmount, readHash } from "./util.ts"
import { GruntFund } from "./GruntFund.ts"

export const removeMinter = async (gruntFund : GruntFund) => {
  const addressInput = await text({
    message: 'What address would you like to remove as an admin?',
    placeholder: '0x...',
    initialValue: '',
    validate(value) {
      if (value.length === 0) return `The address is required`
      if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
    },
  })
  const address = String(addressInput)

  await spin(`Removing ${address} as a minter ...`)(async () => {
    const result = await gruntFund.removeMinter(String(address))
    console.log(JSON.stringify(result, null, 2))
  })
}
export const addMinter = async (gruntFund : GruntFund) => {
  const addressInput = await text({
    message: 'What address would you like to make an admin?',
    placeholder: '0x...',
    initialValue: '',
    validate(value) {
      if (value.length === 0) return `The address is required`
      if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
    },
  })
  const address = String(addressInput)

  await spin(`Making ${address} a minter ...`)(async () => {
    const result = await gruntFund.addMinter(String(address))
    console.log('addMinter result: ', JSON.stringify(result, null, 2))
  })
}

export const doMint = async (gruntFund : GruntFund) => {
    const toAddress = await text({
        message: 'What address would you like to allocate tokens to?',
        placeholder: '0x...',
        initialValue: '',
        validate(value) {
          // if (value.length === 0) return `The address is required!`
          if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
        },
      })
      const amount = await readAmount()
      const hash = await readHash()
      
      await spin(`Minting ${amount.toString()} for ${toAddress.toString()} ...`)(async () => {
        const result = await gruntFund.mint(toAddress.toString(), parseInt(amount.toString()), hash.toString())
        console.log('mint result: ', JSON.stringify(result, null, 2))
      })
}
