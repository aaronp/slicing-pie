<script lang="ts">
    import { type MetaMask, type Settings, loadSettings, connectToMetaMask, idFromPath } from "$lib"
    import { GruntFund } from "$lib/GruntFund"
	import { page } from '$app/stores'
    import { onMount } from "svelte"
    import { goto } from "$app/navigation"
    import ZipExtractor from "$lib/ZipExtractor.svelte";

    let pageName : string = $derived($page.url.pathname)
	let fundAddress = $derived(idFromPath(pageName, 1))

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
          gruntFund = await GruntFund.forSettings(fundAddress, account)
        }
    })

    const onBack = () => goto(`${$page.url.pathname.split('/').slice(0, -1).join('/')}` )
    
</script>


{message}
{#if account && settings && gruntFund}

    <ZipExtractor {settings} {account} {fundAddress} {gruntFund} {onBack}/>

{:else}
    <p>Account is not connected</p>
{/if}
