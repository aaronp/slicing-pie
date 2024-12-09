<script lang="ts">

  import {
    mdiMinusCircle,
    mdiPlusCircle
  } from '@mdi/js'
  import { onMount } from "svelte";

  import { GruntFund } from "./GruntFund"

  import { type MetaMask } from "$lib"
  import { type LabeledAddress, loadSettings, type Settings, toLabels } from "$lib/settings"
  import { ListItem, Card, Button, Avatar, Header } from "svelte-ux"

  type Props = {
      settings : Settings,
      account : MetaMask
  }

  let { account, settings } : Props = $props()

  // let fundOptions : MenuOption[] = $derived(settings ? toMenuOptions((settings as Settings).funds) : [])

  // let gruntOptions : MenuOption[] = $derived(settings ? toMenuOptions((settings as Settings).grunts) : [])

  let message = $state("")

  type PermissionEntry = {
    fund :LabeledAddress,
    grunt :LabeledAddress,
    isAllowedMinter :boolean,
    symbol: string
  }
  let entries : PermissionEntry[] = $state([])

  let groupedEntries = $derived(entries.reduce((acc, entry) => {
      if (!acc[entry.fund.label]) {
        acc[entry.fund.label] = []
      }
      acc[entry.fund.label].push(entry)
      return acc
    }, {}))
  
  const addAsMinter = async (fundAddress : string, gruntAddress : string) => {
    let gruntFund = new GruntFund(fundAddress, account.provider, account.signer)
    try {
      const response = await gruntFund.addMinter(gruntAddress)
      message = `result: ${JSON.stringify(response, null, 2)}`
    } catch (e) {
      message = `${e}`
    }
  }
  
  const removeAsMinter = async (fundAddress : string, gruntAddress : string) => {
    try {
      let gruntFund = new GruntFund(fundAddress, account.provider, account.signer)
      const response = await gruntFund.removeMinter(gruntAddress)
      message = `result: ${JSON.stringify(response, null, 2)}`
    } catch (e) {
      message = `${e}`
    }
  }
  onMount(async () => {
    settings = loadSettings()

    toLabels(settings.funds).forEach(async (fund) => {        
      let gruntFund = new GruntFund(fund.address, account.provider, account.signer)
      const symbol = await gruntFund.getSymbol()
      toLabels(settings.grunts).forEach(async grunt => {

        // TODO - add these checks to a list
        const isAllowedMinter = await gruntFund.isAllowedMinter(grunt.address)

        let entry : PermissionEntry = {
          fund,
          grunt,
          symbol,
          isAllowedMinter
        }
        entries.push(entry)
      })

      if (settings.kindContractAddress) {
        const isAllowedMinter = await gruntFund.isAllowedMinter(settings.kindContractAddress)

        let entry : PermissionEntry = {
          fund,
          grunt : {
            label : 'Kind Group Fund',
            address : settings.kindContractAddress
          },
          symbol,
          isAllowedMinter
        }
        entries.push(entry)
      }
    })
  })
</script>

{#each Object.entries(groupedEntries) as [key, group] } 

<div class="m-4 mr-36">
  <Card >
  <Header title={(group as PermissionEntry[])[0].fund.label} subheading={(group as PermissionEntry[])[0].fund.address} slot="header">
    <div slot="avatar">
      <Avatar class="bg-primary text-primary-content font-bold">{(group as PermissionEntry[])[0].symbol}</Avatar>
    </div>
  </Header>
  {#each (group as PermissionEntry[]) as entry } 
    <div class="m-2 grid grid-cols-[1fr,auto,1fr] gap-2">
      <div class="text-xl w-96">
        {entry.grunt.label}
        <div class="text-sm opacity-20">{entry.grunt.address}</div>
      </div>
      <div class="flex border justify-end">
        {#if entry.isAllowedMinter}
          <Button class="w-60" icon={mdiMinusCircle} color="secondary" variant="outline" onclick={() => removeAsMinter(entry.fund.address, entry.grunt.address)}>Remove As Minter</Button>
        {:else}
          <Button class="w-60" icon={mdiPlusCircle} color="secondary" variant="outline" onclick={() => addAsMinter(entry.fund.address, entry.grunt.address)}>Permission As Minter</Button>
        {/if}
      </div>
      <div class=""></div>
    </div>
  {/each}
  </Card>
</div>
{/each}

{message}