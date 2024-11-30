<script lang="ts">

    import { type LabeledAddress, type MetaMask, type Settings, idFromPath, loadSettings, splitMapping, connectToMetaMask } from "$lib"
    import Fund from "$lib/Fund.svelte"
    import Balances from "$lib/Balances.svelte"
    import { GruntFund } from "$lib/GruntFund"
	import { page } from '$app/stores'
    import { onMount } from "svelte"
    import { Notification } from "svelte-ux"
    import {mdiAlertOctagonOutline} from '@mdi/js'
  
    let pageName : string = $derived($page.url.pathname)
	let id = $derived(idFromPath(pageName))

    let grunts : LabeledAddress[] = $state([])
    let funds : LabeledAddress[] = $state([])
    let settings : Settings | null = $state(null)

    let gruntFund : GruntFund | null = $state(null)

    let message = $state('')
    let account : MetaMask | null = $state(null)


    onMount(async () => {        
        settings = loadSettings()
        grunts = splitMapping(settings.grunts)
        funds = splitMapping(settings.funds)
   
        const connectResult = await connectToMetaMask()
        if (typeof connectResult === 'string') {
          message = `Error connecting: ${connectResult}`
        } else {
          account = connectResult as MetaMask
          gruntFund = await GruntFund.forSettings(settings.kindContractAddress, account)
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
    {:else if settings != null && gruntFund != null }
        <Fund {settings} {gruntFund} fundAddress={id} />
    {/if}

    {#if settings != null && gruntFund != null && account != null}
        <Balances {account} {settings} {gruntFund} fundAddress={id} />
    {/if}
{/key}