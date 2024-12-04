<script lang="ts">

    import { type MetaMask, type Settings, idFromPath, loadSettings, connectToMetaMask } from "$lib"
    import Balances from "$lib/Balances.svelte"
    import { GruntFund } from "$lib/GruntFund"
    import { onMount } from "svelte"
    import { Notification } from "svelte-ux"
    import {mdiAlertOctagonOutline} from '@mdi/js'
	import { page } from '$app/stores'
  
    let pageName : string = $derived($page.url.pathname)
	let id = $derived(idFromPath(pageName, 0))

    let message = $state('')
    
    let settings : Settings | null = $state(null)
    let account : MetaMask | null = $state(null)
    let gruntFund : GruntFund | null = $state(null)

    onMount(async () => {        
        settings = loadSettings()
   
        const connectResult = await connectToMetaMask()
        if (typeof connectResult === 'string') {
          message = `Error connecting: ${connectResult}`
        } else {
          account = connectResult as MetaMask
          gruntFund = await GruntFund.forSettings(id, account)
        }
    })
  </script>
  
{#key id}
  
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

    {#if settings != null && gruntFund != null && account != null}
        <Balances {account} {settings} {gruntFund} fundAddress={id} />
    {/if}
{/key}