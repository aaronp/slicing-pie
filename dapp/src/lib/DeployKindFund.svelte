<script lang="ts">
    import SelectOrCreate from "./SelectOrCreate.svelte";

    import { onMount } from "svelte";

    import { GruntFund } from "./GruntFund"
    import Permissions from "./Permissions.svelte"

    import { ethers } from "ethers";
    import contractData from "../../../artifacts/contracts/KindFund.sol/KindFund.json"

    import { type MetaMask } from "$lib"
    import { loadSettings, saveSettings, type Settings, toMenuOptions } from "$lib/settings"
    import { Toggle, Dialog, Button, TextField, Notification, type MenuOption } from "svelte-ux"

    type Props = {
        settings : Settings,
        account : MetaMask
    }

    let { account, settings} : Props = $props()

    const abi = contractData.abi
    const bytecode = contractData.bytecode

    let backingGruntFundAddress = $state("")
    let owner = $state("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
    let gruntFundAddressToPermission = $state("")
    let message = $state("")
    let saving = $state(false)
    let newContractAddress = $state("")

    const onDeploy = async () => {
      const address = await deployContract(backingGruntFundAddress, owner)

      // permission the underlying fund to allow the Kind contact to mint
      const underlying = await GruntFund.forAddress(gruntFundAddressToPermission)
      // const isAllowedBefore = await underlying.isAllowedMinter(address)

      // console.log(`isAllowed=${isAllowedBefore} for ${address}`)

      const resonse = await underlying.addMinter(address)
      console.log(`addMinter=${JSON.stringify(resonse, null, 2)}`)

      const isAllowedAfter = await underlying.isAllowedMinter(address)

      console.log(`isAllowed after=${isAllowedAfter} for ${address}`)

    }

    
    const onPermissionForMint = async () => {
        if (!newContractAddress) {
            throw new Error("Bug: the newContractAddress is not set")
        }
         
        const gruntFund = await GruntFund.forAddress(gruntFundAddressToPermission)
        const response = await gruntFund.addMinter(newContractAddress)
        message = `Permission returned ${JSON.stringify(response, null, 2)}`
    }
    
    // Function to deploy the contract
    async function deployContract(_underlyingAddress: string, _owner: string) {
        saving = true
        try {
            const factory = new ethers.ContractFactory(abi, bytecode, account.signer)

            console.log("Deploying contract...")
            const contract = await factory.deploy(_underlyingAddress, _owner)
            console.log("Deploy got ...", contract)

            newContractAddress = await contract.getAddress()
            message = `Contract deployed successfully at address: ${newContractAddress}`
            gruntFundAddressToPermission = newContractAddress

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

<div>
  <Permissions {account} {settings} />
</div>

{#if message}
    <Notification title={message} />
{/if}

<Toggle let:on={open} let:toggle let:toggleOff>
    <Button disabled={newContractAddress.length == 0} variant="fill" color="primary" class="m-2" onclick={toggle} >Add Permission to Mint</Button>
    <Dialog classes={{
      dialog: "w-full bg-blue-500",
    }} {open} on:close={toggleOff}>
      <div slot="title">Are you sure?</div>
      <div class="px-6 py-3">
        <TextField class="m-2 w-1/2" label="Fund Address:" bind:value={gruntFundAddressToPermission} />
      </div>
      <div slot="actions">
        <Button
          onclick={async () => await onPermissionForMint()}
          variant="fill"
          color="danger"
        >
          Permission
        </Button>
        <Button>Cancel</Button>
      </div>
    </Dialog>
  </Toggle>