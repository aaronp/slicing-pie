<script lang="ts">

    import { ethers } from "ethers"
    import contractData from "../../../artifacts/contracts/GruntFund.sol/GruntFund.json"

    import { type MetaMask } from "$lib"
    import { addGruntFund, loadSettings, type Settings, toMenuOptions } from "$lib/settings"
    import { Button, TextField, Notification, type MenuOption } from "svelte-ux"
    import SelectOrCreate from "./SelectOrCreate.svelte";

    type Props = {
        settings : Settings,
        account : MetaMask
    }

    let { account, settings } : Props = $props()

    const abi = contractData.abi
    const bytecode = contractData.bytecode

    let gruntOptions : MenuOption[] = $derived(settings ? toMenuOptions((settings as Settings).grunts) : [])
    let saving = $state(false)
    let message = $state('')
    let name = $state("foo")
    let symbol = $state("bar")
    let owner = $state("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")

    const onDeploy = () => {
        deployContract(name, symbol, owner)
    }
    // Function to deploy the contract
    async function deployContract(_name: string, _symbol: string, _owner: string) {

        saving = true
        try {
            const factory = new ethers.ContractFactory(abi, bytecode, account.signer)

            console.log("Deploying contract...")
            // TODO - add to pending transactinos
            const contract = await factory.deploy(_name, _symbol, _owner)
            console.log("Deploy got ...", contract)

            const a = await contract.getAddress()

            message = `Contact deployed to ${a}`
            addGruntFund(loadSettings(), {
                label : name,
                address : a
            })
        } catch (error) {
            saving = false
            console.error("Deployment failed:", error)
        }
        saving = false
    }
</script>


<TextField class="m-2 w-1/2" label="Fund Name:" bind:value={name} />
<TextField class="m-2 w-1/2" label="Symbol:" bind:value={symbol} />
<!-- <TextField class="m-2 w-1/2" label="Owner Address:" bind:value={owner} /> -->

<div class="m-2 w-1/2">
    <SelectOrCreate label="Contracta Owner" options={gruntOptions} bind:value={owner} />
  </div>
<Button disabled={saving} variant="fill" color="primary" class="m-2" onclick={() => onDeploy()} >Deploy</Button>

{#if message}
    <Notification title={message} />
{/if}
