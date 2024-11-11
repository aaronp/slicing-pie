import * as emoji from "npm:node-emoji"
import pc from "npm:picocolors"
import { intro, outro, text, confirm, select } from "npm:@clack/prompts"

import "https://deno.land/std@0.200.0/dotenv/load.ts"
import { ethers } from "https://esm.sh/ethers@6.7.1"

// Load the seed phrase from environment variables
const fromEnv = (key : string) => {
  const seed = Deno.env.get(key)
  if (!seed) {
    console.error(`Error: ${key} is not set in the environment variables (e.g. an .env file containing a ${key}).`)
    Deno.exit(1)
  }
  return seed
}
const seedPhrase = () => fromEnv("SEED_PHRASE")
const infuraKey = () => fromEnv("INFURA_API_KEY")


async function read() {

  // Create a wallet from the seed phrase
  const wallet = ethers.Wallet.fromPhrase(seedPhrase());

  // Connect to an Ethereum provider (using a public RPC endpoint)
  const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraKey()}`);

  const hdNode = ethers.HDNodeWallet.fromPhrase(seedPhrase());
  console.log("MetaMask Accounts:");

  for (let i = 0; i < 5; i++) {
    const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Account ${i + 1}: ${wallet.address}, Balance: ${ethers.formatEther(balance)} ETH`);
  }
}


export function multiply(a: number, b: number): number {
  return a * b
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  
  intro(emoji.emojify(`:sauropod: :heart: example for ${pc.italic(`you`)}`));

  const meaning = await text({
    message: 'What value would you like to multiply?',
    placeholder: 'Not sure',
    initialValue: '42',
    validate(value) {
      if (value.length === 0) return `Value is required!`
    },
  });

  const multiplier = await select({
    message: 'Multiply with:',
    options: [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three', hint: 'triples' },
    ],
  });

  const shouldContinue = await confirm({
    message: 'Do you want to add?',
  });

  if (shouldContinue) {
    outro(`Add ${String(meaning)} X ${multiplier} = ${multiply(parseFloat(meaning as string), parseFloat(multiplier as string))}`)
  } else {
    outro('Ok - nevermind')
  }
}
