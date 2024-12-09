<script lang="ts">

import { type MetaMask, idFromPath, connectToMetaMask } from "$lib"
import { type Settings, loadSettings, toLabels } from "$lib/settings"
import { GruntFund } from "$lib/GruntFund"
import Logs from "$lib/Logs.svelte"
import { onMount } from "svelte"
import { page } from '$app/stores'

let pageName : string = $derived($page.url.pathname)
let fundAddress = $derived(idFromPath(pageName, 0))

let message = $state('')

let settings : Settings | null = $state(null)
let account : MetaMask | null = $state(null)
let gruntFund : GruntFund | null = $state(null)
let gruntLabelByAddress = $state(new Map<string, string>())

onMount(async () => {        
    settings = loadSettings()

    const connectResult = await connectToMetaMask()
    if (typeof connectResult === 'string') {
        message = `Error connecting: ${connectResult}`
    } else {
        account = connectResult as MetaMask
    }
    const grunts =  toLabels(settings.grunts)
    grunts.forEach(grunt => {
        gruntLabelByAddress.set(grunt.address, grunt.label)
    })
    gruntFund = await GruntFund.forAddress(settings.kindContractAddress)
})
</script>

{#if gruntFund}
    <Logs {gruntFund} gruntAliasByAddress={gruntLabelByAddress} />
{:else}
    <p>Loading...</p>
{/if}