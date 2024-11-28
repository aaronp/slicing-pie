import pc from "npm:picocolors"
import { intro } from "npm:@clack/prompts"
import { userMenuPrompt } from "./lib/menu.ts"
import { loadGruntFund, updateSettings } from "./lib/actionSettings.ts"
import { loadSettings, Web3Settings } from "./lib/connect.ts"
import { GruntFund } from "./lib/GruntFund.ts"
import { connect } from "./lib/connect.ts"

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {  
  intro(`👷👷👷 ${pc.bold(`Grunt Fund`)} 💰💰💰`)

  let gruntFund : GruntFund | null = null
  let web3Settings : Web3Settings | null = null

  while(gruntFund == null || web3Settings == null) {
    const settings = loadSettings()

    try {
      web3Settings = await connect(settings)
      gruntFund = await loadGruntFund(settings, web3Settings)
      // test it
      await gruntFund.getOwner()
    } catch (e) {
      console.error(`oops - check settings ${e}`)
      await updateSettings(settings)
      Deno.exit(1)
    }
  }

  let loop = await userMenuPrompt(gruntFund, web3Settings)

  while(loop) {
    // the user may have updated the settings
    const settings = loadSettings()
    web3Settings = await connect(settings)
    const f = await loadGruntFund(loadSettings(), web3Settings)
    loop = await userMenuPrompt(f, web3Settings)
  }

  Deno.exit(0)
}


