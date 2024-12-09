<script lang="ts">

    import { type MetaMask, idFromPath, connectToMetaMask } from "$lib"
    import { type Settings, loadSettings } from "$lib/settings"
    import Balances from "$lib/Balances.svelte"
    import { onMount } from "svelte"
    import { Notification } from "svelte-ux"
    import {mdiAlertOctagonOutline} from '@mdi/js'
	import { page } from '$app/stores'
  
    let pageName : string = $derived($page.url.pathname)
	let fundAddress = $derived(idFromPath(pageName, 0))

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
  
    {#if message.length > 0}
        <Notification
            title="Unknown fund"
            icon={mdiAlertOctagonOutline}
            description={message}
            color="danger"
            {message}
            closeIcon
        />
    {/if}

{#key fundAddress}
    {#if settings != null && account != null}
        <Balances {account} {settings} {fundAddress} />
    {/if}
{/key}