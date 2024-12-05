<script lang="ts">

import Deploy from "$lib/Deploy.svelte"
import { GruntFund } from "$lib/GruntFund"
import { onMount } from "svelte"
import { Notification } from "svelte-ux"
import {mdiAlertOctagonOutline} from '@mdi/js'
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
    <Deploy {settings} {account} />
{/if}

