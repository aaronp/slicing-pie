<script lang="ts">

    import { onMount } from "svelte"

    import Permissions from "./Permissions.svelte"
    import SelectOrCreate from "./SelectOrCreate.svelte"

    import { ethers } from "ethers";
    import contractData from "../../../artifacts/contracts/KindFund.sol/KindFund.json"

    import { type MetaMask } from "$lib"
    import { loadSettings, saveSettings, type Settings, toMenuOptions } from "$lib/settings"
    import { Button, Notification, type MenuOption } from "svelte-ux"

    type Props = {
        settings : Settings,
        account : MetaMask
    }

    let { account, settings} : Props = $props()

    const abi = contractData.abi
    const bytecode = contractData.bytecode

    let backingGruntFundAddress = $state("")
    let owner = $state('')
    let message = $state("")
    let saving = $state(false)
    let newContractAddress = $state("")

    const onDeploy = async () => {
      const address = await deployContract(backingGruntFundAddress, owner)
      console.log(`deployed ${address}`)
      
    }

    
    // Function to deploy the contract
    async function deployContract(_underlyingAddress: string, _owner: string) {
        saving = true
        try {
            const factory = new ethers.ContractFactory(abi, bytecode, account.signer)

            console.log("Deploying contract...")
            const contract = await factory.deploy(_underlyingAddress, _owner)
            console.log(`Deploy got ... ${JSON.stringify(contract, null, 2)}`)

            newContractAddress = await contract.getAddress()
            message = `Contract deployed successfully at address: ${newContractAddress}`
            console.log(message)

            // update settings
            if (settings) {
              settings.kindContractAddress = newContractAddress
              saveSettings(settings)
            }
        } catch (error) {
            message = `Deployment failed: ${error}`
        }
        saving = false
        return newContractAddress
    }

    let fundOptions : MenuOption[] = $derived(settings ? toMenuOptions((settings as Settings).funds) : [])
    let gruntOptions : MenuOption[] = $derived(settings ? toMenuOptions((settings as Settings).grunts) : [])

    onMount(() => {
      settings = loadSettings()
      newContractAddress = settings.kindContractAddress
    })
</script>
{#key settings}
  <div class="m-2 w-1/2">
    <SelectOrCreate label="Grunt Fund" options={fundOptions} bind:value={backingGruntFundAddress} />
  </div>

  <div class="m-2 w-1/2">
    <SelectOrCreate label="Contracta Owner Address" options={gruntOptions} bind:value={owner} />
  </div>
{/key}

<!-- <TextField class="m-2 w-1/2" label="Kind Address:" bind:value={newContractAddress} /> -->
<Button disabled={saving} variant="fill" color="primary" class="m-2" onclick={() => onDeploy()} >Deploy</Button>

{#if message}
    <Notification title={message} />
{/if}

<div>
  <Permissions {account} {settings} />
</div>
