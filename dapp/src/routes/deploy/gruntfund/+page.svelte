<script lang="ts">

import DeployGruntFund from "$lib/DeployGruntFund.svelte"
import { onMount } from "svelte"
import { connectToMetaMask, type MetaMask } from "$lib"
import { loadSettings, type Settings } from "$lib/settings"

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
    <DeployGruntFund {settings} {account} />
{:else}
    <p>...</p>
{/if}

