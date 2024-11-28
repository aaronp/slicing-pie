import { outro, select } from "npm:@clack/prompts"
import "https://deno.land/std@0.200.0/dotenv/load.ts"
import { about, updateSettings, listAddresses } from "./actionSettings.ts"
import { doMint, addMinter, removeMinter } from "./actionMint.ts"
import { transfer, forceTansfer } from "./actionTransfer.ts"
import { listEvents } from "./actionEvents.ts"
import { GruntFund } from "./GruntFund.ts"
import { getBalances, getSingleBalance } from "./actionBalances.ts"
import { loadSettings, Web3Settings } from "./connect.ts";

export const userMenuPrompt = async (gruntFund : GruntFund, web3Settings : Web3Settings) => {
  const operationChoice = await select({
    message: 'What would you like to do?',
    options: [
      { value: 'settings', label: 'Settings' },
      { value: 'events', label: 'List Events' },
      { value: 'getAllBalances', label: 'Get All Balances' },
      { value: 'getBalance', label: 'Get Balance' },
      { value: 'mint', label: 'Mint Tokens' },
      { value: 'transfer', label: 'Transfer Tokens' },
      { value: 'forceTransfer', label: 'Force Transfer Tokens' },
      { value: 'addMinter', label: 'Add a minter' },
      { value: 'removeMinter', label: 'Remove a minter' },
      { value: 'about', label: 'About' },
      { value: 'addresses', label: 'Show addresses' },
      { value: 'quit', label: 'Quit' },
    ],
  });

  switch (operationChoice) {
    case 'quit': {
      outro('Bye!')
      return false
    }
    case 'settings': {
      const settings = loadSettings()
      await updateSettings(settings)
      break
    }
    case 'mint': {
      await doMint(gruntFund)
      break
    }
    case 'events': {
      await listEvents(gruntFund)
      break
    }
    case 'transfer': {
      await transfer(gruntFund, web3Settings)
      break
    }
    case 'forceTransfer': {
      await forceTansfer(gruntFund, web3Settings)
      break
    }
    case 'getAllBalances': {
      await getBalances(gruntFund)
      break
    }
    case 'getBalance': {
      await getSingleBalance(gruntFund)
      break
    }
    case 'about': {
      await about(gruntFund, web3Settings)
      break
    }
    case 'addMinter': {
      await addMinter(gruntFund)
      break
    }
    case 'removeMinter': {
      await removeMinter(gruntFund)
      break
    }
    case 'addresses': {
      await listAddresses(gruntFund)
      break
    }
    default: {
      console.error('Invalid choice ' + operationChoice)

      await userMenuPrompt(gruntFund, web3Settings)
    }
  }
  return true
}
