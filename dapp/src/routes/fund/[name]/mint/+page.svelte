<script lang="ts">
    import { type MetaMask, type Settings, loadSettings, connectToMetaMask, idFromPath } from "$lib"
    import { GruntFund } from "$lib/GruntFund"
	import { page } from '$app/stores'
    import { onMount } from "svelte"
    import { Button } from 'svelte-ux'
    import { goto } from "$app/navigation"
    import VerifySignature from "$lib/VerifySignature.svelte"
    import Mint from "$lib/Mint.svelte"

    let pageName : string = $derived($page.url.pathname)
	let id = $derived(idFromPath(pageName, 1))

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

<div class="m-2"><Button variant="outline" color="secondary" onclick={() => goto(`${$page.url.pathname.split('/').slice(0, -1).join('/')}`)}>Back</Button></div>
<div class="text-center">
    {message}
    <p class="text-secondary text-bold text-xl m-8">Verify the signed documents:</p>
    {#if account}
        <VerifySignature {account} />

        <Mint {settings} {gruntFund} fundAddress={id} />
    {:else}
        <p>Account is not connected</p>
    {/if}
</div>