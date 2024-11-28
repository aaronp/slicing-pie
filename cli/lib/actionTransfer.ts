import { text } from "npm:@clack/prompts"
import { spin, readAmount, readHash } from "./util.ts"
import { GruntFund } from "./GruntFund.ts"
import { Web3Settings } from "./connect.ts";



export const forceTansfer = async (gruntFund : GruntFund, web3 : Web3Settings) => {
  const fromAddress = await text({
      message: 'From what address would you like to transfer tokens?',
      placeholder: '0x...',
      initialValue: '',
      validate(value) {
        // if (value.length === 0) return `The address is required!`
        if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
      },
    })
  const toAddress = await text({
      message: 'What address would you like to transfer tokens to?',
      placeholder: '0x...',
      initialValue: '',
      validate(value) {
        // if (value.length === 0) return `The address is required!`
        if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
      },
    })
    const amount = await readAmount()
    const hash = await readHash()
    await spin(`Transferring ${amount.toString()} to ${toAddress.toString()} from ${await web3.signer.getAddress()}`)(async () => {
      const result = await gruntFund.forceTransfer(String(fromAddress), toAddress.toString(), parseInt(amount.toString()), hash.toString())
      console.log('transfer result: ', JSON.stringify(result, null, 2))
    })
}


export const transfer = async (gruntFund : GruntFund, web3 : Web3Settings) => {
    const toAddress = await text({
        message: 'What address would you like to transfer tokens to?',
        placeholder: '0x...',
        initialValue: '',
        validate(value) {
          // if (value.length === 0) return `The address is required!`
          if (value.length > 0 && !value.startsWith('0x')) return `This doesn't look like an address`
        },
      })
      const amount = await readAmount()
      const hash = await readHash()
      await spin(`Transferring ${amount.toString()} to ${toAddress.toString()} from ${await web3.signer.getAddress()}`)(async () => {
        const result = await gruntFund.transfer(toAddress.toString(), parseInt(amount.toString()), hash.toString())
        console.log('transfer result: ', JSON.stringify(result, null, 2))
      })
}
