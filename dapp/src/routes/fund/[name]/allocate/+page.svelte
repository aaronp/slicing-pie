<script lang="ts">
    import { type MetaMask, connectToMetaMask, idFromPath } from "$lib"
    import SignedDocumentUpload from "$lib/SignedDocumentUpload.svelte"
	import { page } from '$app/stores'
    import { onMount } from "svelte"
    import { Button } from 'svelte-ux'
    import { goto } from "$app/navigation"

    let pageName : string = $derived($page.url.pathname)
	let fundAddress = $derived(idFromPath(pageName, 1))

    let message = $state('')

    let account : MetaMask | null = $state(null)

    onMount(async () => {
   
        const connectResult = await connectToMetaMask()
        if (typeof connectResult === 'string') {
          message = `Error connecting: ${connectResult}`
        } else {
          account = connectResult as MetaMask
        }
    })
</script>

<div >
    {message}
    <!-- <p class="text-secondary text-bold text-xl m-8">Upload the document (timesheet, fund transfer, etc):</p> -->
    {#if account}
        <SignedDocumentUpload {account} {fundAddress} />
    {:else}
        <p>Account is not connected</p>
    {/if}
</div>

<div class="mt-12"><Button variant="outline" color="secondary" onclick={() => goto(`${$page.url.pathname.split('/').slice(0, -1).join('/')}`)}>Back</Button></div>