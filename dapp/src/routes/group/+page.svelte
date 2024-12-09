<script lang="ts">

import { type MetaMask, connectToMetaMask } from "$lib"
import { type Settings, loadSettings, toLabels } from "$lib/settings"
import { GruntFund } from "$lib/GruntFund"
import Logs from "$lib/Logs.svelte"
import { onMount } from "svelte"
    import { KindFund } from "$lib/KindFund";


let message = $state('')

let settings : Settings | null = $state(null)
let account : MetaMask | null = $state(null)
let kindFund : KindFund | null = $state(null)
let kindFunds : string[] = $state([])
let gruntAliasByAddress = $state(new Map<string, string>())
let fundAliasByAddress = $state(new Map<string, string>())

onMount(async () => {        
    settings = loadSettings()

    const connectResult = await connectToMetaMask()
    if (typeof connectResult === 'string') {
        message = `Error connecting: ${connectResult}`
    } else {
        account = connectResult as MetaMask
    }

    toLabels(settings.grunts).forEach(next => {
        gruntAliasByAddress.set(next.address, next.label)
    })

    toLabels(settings.funds).forEach(next => {
        fundAliasByAddress.set(next.address, next.label)
    })


    kindFund = await KindFund.forAddress(settings.kindContractAddress)
    kindFunds = await kindFund.getAllFunds()
})
</script>

{kindFunds.length} fund(s) in the group:
{#each kindFunds as address}
    <p>{toLabels(settings?.funds ?? {}).find(e => e.address == address)?.label ?? address}</p>
{/each}

{#if kindFund}
    <Logs contract={kindFund} {gruntAliasByAddress} {fundAliasByAddress}  />
{:else}
    <p>Loading...</p>
{/if}