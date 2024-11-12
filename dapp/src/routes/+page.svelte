<script lang="ts">

  import { type Result, type LabeledAddress, type Settings, idFromPath, loadSettings, accountFeed, connect, type MetaMask } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { goto } from '$app/navigation'
  import Accounts from '../lib/Accounts.svelte'
  import { page } from '$app/stores'
  import { onMount } from "svelte"
  import { Notification, TextField, SelectField, MenuItem, Field, Button, cls } from "svelte-ux"
  import {mdiAlertOctagonOutline} from '@mdi/js'

  let pageName : string = $derived($page.url.pathname)
  let id = $derived(idFromPath(pageName))

  let grunts : LabeledAddress[] = $state([])
  let funds : LabeledAddress[] = $state([])
  let message = $state('')
  let settings : Settings | null = $state(null)
  let account : Result<MetaMask> = $state("not connected")
  let isConnected = $state(false)
  
    // Check if contractAddress exists in localStorage on component mount
    onMount(() => {
      settings = loadSettings()
      
      // redirect if we've not set up t
      if (!settings?.kindContractAddress) {
        goto('/settings')
      } else {

        accountFeed.subscribe((a) => {
            if (typeof a === 'string') {
              isConnected = false
            } else {
              isConnected = true
            }
            account = a
        })
      }
    })

    const onConnectAccount = async () => {
      try {
        await connect()
      } catch (e) {
        message = `${e}`
      }
    }
  
    const reset = () => {
        localStorage.removeItem('contractAddress')
        window.location.reload()
    }
</script>

<h1>Grunt Fund</h1>
<div>{message}</div>

{#if (typeof account === 'string') }
    not logged in
    <Button onclick={onConnectAccount} >Connect Metamask Account</Button>
{/if}

{#if typeof account !== 'string'}
    logged in as {(account as MetaMask).signerName} ({(account as MetaMask).signerAddress})
{/if}


<Accounts />

<p>Contract Address: {settings?.kindContractAddress}</p>
<Button variant="fill" color="primary" rounded onclick={reset} >Reset</Button>
