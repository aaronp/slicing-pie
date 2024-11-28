import { text } from "npm:@clack/prompts"
import { spin } from "./util.ts"
import { GruntFund } from "./GruntFund.ts"

export const addMinter = async (gruntFund : GruntFund) => {
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
}
