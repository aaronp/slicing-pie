<script lang="ts">
    import { TextField, Collapse } from 'svelte-ux'
    import { writable } from 'svelte/store'
	  import { loadSettings, saveSettings, splitMapping, toText } from '$lib/settings'
    import { onMount } from 'svelte';

  
    let gruntAddresses = writable("")
    let fundAddresses = writable("")

    let grunts = $state("")
    let funds = $state("")
    let kindContractAddress = $state("")

    const onSave = () => {
      if (localStorage) {
          saveSettings({
          grunts : splitMapping(grunts),
          funds : splitMapping(funds),
          kindContractAddress
        })
      }
    }

    const onChangeAddress = () => onSave()

    let message = $state('')

    onMount(() => {
      if (!localStorage) {
        message = 'could not load - localStorage is kaput'
        return
      }
      let settings = loadSettings()
      grunts = toText(settings.grunts)
      gruntAddresses.set(grunts)

      funds = toText(settings.funds)
      fundAddresses.set(funds)

      kindContractAddress = settings.kindContractAddress

      // Sync the writable store with localStorage
      gruntAddresses.subscribe(value => {
          grunts = value
          onSave()
      })

      // Sync the writable store with localStorage
      fundAddresses.subscribe(value => {
        funds = value
        onSave()
      })

    })

  </script>

<h1 class="text-2xl ml-2 font-bold mb-2">Settings</h1>  

{message}
<!-- Funds Input Section -->

<div class="grid grid-cols-1 gap-2 w-3/4">
  <div class="m-2 p-2 bg-gray-200 dark:bg-gray-800">
  <Collapse name="Grunts">
    <textarea
        id="funds"
        class="p-2 h-60 bg-gray-100 dark:bg-gray-800 w-1/2"
        bind:value={$gruntAddresses}
        style="width: 100%; height: 100px; resize: vertical;"
        placeholder="Enter grunts in the format: label:address"></textarea>
    </Collapse>
  </div>
  <div class="m-2 p-2 bg-gray-200 dark:bg-gray-800">
  <Collapse name="Funds">
    <textarea
        id="funds"
        class="p-2 h-60 bg-gray-100 dark:bg-gray-800 w-1/2"
        bind:value={$fundAddresses}
        style="width: 100%; height: 100px; resize: vertical;"
        placeholder="Enter grunts in the format: label:address"></textarea>
    </Collapse>
  </div>
</div>

<div class="grid grid-cols-1 gap-2 mt-8 ml-2 w-3/4">
  <h2 class="text-3xl font-bold">Kind Contract Address</h2>

  <p class="pt-2">The deployed Kind fund address, which we should enter here (see example below).</p>

  <div class="text-lg"><TextField on:change={() => onChangeAddress()} labelPlacement="float" hint="The address of the deployed grunt fund contract" class="w-3/4 text-lg mt-2" label="Contract Address" bind:value={kindContractAddress} /></div>
</div>

<!-- <p class="p-8"><img src='/deployment.png' alt="Smart Contract Deploy" /></p> -->
