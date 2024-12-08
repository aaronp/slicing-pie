<script lang="ts">

    import { onMount } from "svelte";

    import { GruntFund } from "./GruntFund"

    import { type MetaMask } from "$lib"
    import { loadSettings, saveSettings, type Settings, toMenuOptions } from "$lib/settings"
    import { Toggle, Dialog, Button, TextField, Notification, type MenuOption } from "svelte-ux"

    type Props = {
        settings : Settings,
        account : MetaMask
    }

    let { account, settings } : Props = $props()

    let fundOptions : MenuOption[] = $derived(settings ? toMenuOptions((settings as Settings).funds) : [])

    let gruntOptions : MenuOption[] = $derived(settings ? toMenuOptions((settings as Settings).grunts) : [])

    let message = $state("")

    type Owners = {
      byAddress : Map<string, boolean>
    }
    let ownersByFundAddress : Map<string, Owners> = $state(new Map<string, Owners>())
    
    const addAsMinter = async (fundAddress : string, gruntAddress : string) => {
      let gruntFund = new GruntFund(fundAddress, account.provider, account.signer)
      const response = await gruntFund.addMinter(gruntAddress)
      message = `result: ${JSON.stringify(response, null, 2)}`

    }
    const isAllowedMinter = (fundAddress : string, gruntAddress : string) => {
      const owner = ownersByFundAddress.get(fundAddress)
      if (owner) {
        return owner.byAddress.get(gruntAddress) ?? false
      }
      return false
    }

    onMount(async () => {
      settings = loadSettings()

      Object.entries(settings.funds).map(async ([fundLabel, fundAddress]) => {
        let owners = new Map<string, boolean>()

        let gruntFund = new GruntFund(fundAddress, account.provider, account.signer)
        Object.entries(settings.grunts).map(async ([gruntLabel, gruntAddress]) => {
          

          // TODO - add these checks to a list
          const ok = await gruntFund.isAllowedMinter(gruntAddress)
          console.log(`checking ${fundLabel} (${fundAddress}) isAllowedMinter for ${gruntLabel} (${gruntAddress}) is ${ok}`)
          owners.set(gruntAddress, ok)
        })

        if (settings.kindContractAddress) {
          const ok = await gruntFund.isAllowedMinter(settings.kindContractAddress)
          owners.set(settings.kindContractAddress, ok)
        }
        
        ownersByFundAddress.set(fundAddress, { byAddress : owners })
      })
      
    })
</script>


<pre>
  {JSON.stringify(ownersByFundAddress, null, 2)}
</pre>

{#each fundOptions as fund } 
<div class="m-2">
  <h3 class="text-primary text-bold font-xl">{fund.label}</h3>
  {#each gruntOptions as grunt } 
  <h4 class="m-2">{grunt.label}</h4>
  <p class="m-2">{grunt.value}</p>
  {@const isMinter = isAllowedMinter(fund.value, grunt.value)}
  <p class="m-2">Can Mint? {isMinter}</p>
  {#if !isMinter}
    <Button variant="fill" onclick={() => addAsMinter(fund.address, grunt.value)}>Permission As Minter</Button>
  {/if}
  {/each}


  <h4 class="m-2">Kind Fund</h4>
  <p class="m-2">{settings.kindContractAddress}</p>
  
  
  <p class="m-2">Can Mint? {isAllowedMinter(fund.value, settings.kindContractAddress)}</p>
  {#if !isAllowedMinter(fund.value, settings.kindContractAddress)}
    <Button variant="fill" onclick={() => addAsMinter(fund.address, settings.kindContractAddress)}>Permission As Minter</Button>
  {/if}
</div>
{/each}

{message}