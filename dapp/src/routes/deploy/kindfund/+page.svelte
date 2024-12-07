<script lang="ts">

import DeployKindFund from "$lib/DeployKindFund.svelte"
import { onMount } from "svelte"
import { connectToMetaMask, loadSettings, type MetaMask, type Settings } from "$lib"


let message = $state('')

let settings : Settings | null = $state(null)
let account : MetaMask | null = $state(null)

onMount(async () => {        
    settings = loadSettings()

    const connectResult = await connectToMetaMask()
    if (typeof connectResult === 'string') {
        message = `Error connecting: ${connectResult}`
    } else {
        account = connectResult as MetaMask
    }
})
</script>

{#if settings && account }
    <DeployKindFund {settings} {account} />
{:else}
    <p>...</p>
{/if}

