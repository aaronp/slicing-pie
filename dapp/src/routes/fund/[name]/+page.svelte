<script lang="ts">

    import { type Result, type MetaMask, type LabeledAddress, type Settings, idFromPath, loadSettings, splitMapping, accountFeed, connect } from "$lib"
    import Fund from "$lib/Fund.svelte"
    import Pie from "$lib/Pie.svelte"
    import { GruntFund } from "$lib/GruntFund"
	import { page } from '$app/stores'
    import { onMount } from "svelte"
    import { Notification, TextField, SelectField, MenuItem, Field, Button, cls } from "svelte-ux"
    import {mdiAlertOctagonOutline} from '@mdi/js'
  
    let pageName : string = $derived($page.url.pathname)
	let id = $derived(idFromPath(pageName))

    let grunts : LabeledAddress[] = $state([])
    let funds : LabeledAddress[] = $state([])
    let settings : Settings | null = $state(null)

    let gruntFund : GruntFund | null = $state(null)

    let message = $state('')

    let account : Result<MetaMask> = $state("not connected")


    onMount(async () => {
        await connect()

        settings = loadSettings()
        grunts = splitMapping(settings.grunts)
        funds = splitMapping(settings.funds)

        gruntFund = await GruntFund.forAddress(settings.kindContractAddress)

        accountFeed.subscribe((a) => {
            if (typeof a === 'string') {
                message = a;
            }
            account = a
        })
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

    {#if settings != null && gruntFund != null }
            <Pie {settings} {gruntFund} fundAddress={id} />
    {/if}
{/key}