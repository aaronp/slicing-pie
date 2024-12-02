<script lang="ts">
    import { type MetaMask, type Settings, loadSettings, connectToMetaMask } from "$lib"
    import SignedDocumentUpload from "$lib/SignedDocumentUpload.svelte"
    import { GruntFund } from "$lib/GruntFund"
	import { page } from '$app/stores'
    import { onMount } from "svelte"
    import VerifySignature from "$lib/VerifySignature.svelte";


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
          gruntFund = await GruntFund.forSettings(settings.kindContractAddress, account)
        }
    })
</script>

{message}
{#if account}
    <VerifySignature {account} />
{:else}
    <p>Account is not connected</p>
{/if}