<script lang="ts">
    import { type MetaMask, connectToMetaMask, idFromPath } from "$lib"
    import { type Settings, loadSettings, toLabels } from "$lib/settings"
    import { GruntFund } from "$lib/GruntFund"
    import { onMount } from "svelte"
    import Logs from "$lib/Logs.svelte"
	  import { page } from '$app/stores'
    import { Button } from 'svelte-ux'
    import { goto } from "$app/navigation"
  
    let pageName : string = $derived($page.url.pathname)
	  let id = $derived(idFromPath(pageName, 1))

    let message : string = $state('')

    let settings : Settings | null = $state(null)
    let account : MetaMask | null = $state(null)
    let gruntFund : GruntFund | null = $state(null)

    let gruntAliasByAddress = $state(new Map<string, string>())
    let fundAliasByAddress = $state(new Map<string, string>())

    onMount(async () => {        
        settings = loadSettings()
   
        const connectResult = await connectToMetaMask()
        if (typeof connectResult === 'string') {
          message = `Error connecting: ${connectResult}`
        } else {
          account = connectResult as MetaMask
          gruntFund = await GruntFund.forSettings(id, account)
        }

        toLabels(settings.grunts).forEach(next => {
          gruntAliasByAddress.set(next.address, next.label)
        })

        toLabels(settings.funds).forEach(next => {
          fundAliasByAddress.set(next.address, next.label)
        })

    })

</script>

{#if gruntFund}
  <Logs contract={gruntFund} {gruntAliasByAddress} {fundAliasByAddress} />
{/if}

<Button variant="outline" color="secondary" onclick={() => goto(`${$page.url.pathname.split('/').slice(0, -1).join('/')}`)}>Back</Button>