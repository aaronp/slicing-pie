<script lang="ts">

  import { connectToMetaMask, type MetaMask } from "$lib"
  import { type Settings, loadSettings } from "$lib/settings"
  import { goto } from '$app/navigation'
  import Accounts from '../lib/Accounts.svelte'
  import { onMount } from "svelte"
  import { Button } from "svelte-ux"
  
  let settings : Settings | null = $state(null)
  let account : MetaMask | null = $state(null)
  let message = $state('')
  
    // Check if contractAddress exists in localStorage on component mount
    onMount(async () => {
      settings = loadSettings()
      
      // redirect if we've not set up t
      if (!settings?.kindContractAddress) {
        goto('/settings')
      } else {
        const connectResult = await connectToMetaMask()
        if (typeof connectResult === 'string') {
          message = `Error connecting: ${connectResult}`
        } else {
          account = connectResult as MetaMask
        }
      }
    })

    const reset = () => {
        localStorage.removeItem('contractAddress')
        window.location.reload()
    }
</script>

<h1>Grunt Fund</h1>
<div>{message}</div>


{#if typeof account !== 'string'}
    logged in as {(account as MetaMask)?.signerName} ({(account as MetaMask)?.signerAddress})
{/if}


<Accounts />

<p>Contract Address: {settings?.kindContractAddress}</p>
<Button variant="fill" color="primary" rounded onclick={reset} >Reset</Button>
