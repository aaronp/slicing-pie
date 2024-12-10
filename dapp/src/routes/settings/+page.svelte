<script lang="ts">
    import { TextField, Collapse } from 'svelte-ux'
    import { writable } from 'svelte/store'
	  import { loadSettings, saveSettings, splitMapping, splitAmounts, toText, amountsToText, type Settings } from '$lib/settings'
    import { onMount } from 'svelte';

  
    let gruntAddresses = writable("")
    let fundAddresses = writable("")
    let ratesText = writable("")
    let categoriesText = writable("")

    let grunts = $state("")
    let funds = $state("")
    let rates = $state("")
    let categories = $state("")
    let kindContractAddress = $state("")
    
    let settings  = $state({})

    const onSave = () => {
      if (localStorage) {
          const s : Settings = {
            grunts : splitMapping(grunts),
            funds : splitMapping(funds),
            rates : splitAmounts(rates),
            categories : splitAmounts(categories),
            kindContractAddress
          }
          saveSettings(s)
          settings = s
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
      gruntAddresses.subscribe(value => {
          grunts = value
          onSave()
      })

      funds = toText(settings.funds)
      fundAddresses.set(funds)
      fundAddresses.subscribe(value => {
        funds = value
        onSave()
      })

      rates = amountsToText(settings.rates)
      ratesText.set(rates)
      ratesText.subscribe(value => {
        rates = value
        onSave()
      })

      categories = amountsToText(settings.categories)
      categoriesText.set(categories)
      categoriesText.subscribe(value => {
        categories = value
        onSave()
      })


      kindContractAddress = settings.kindContractAddress

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
  <div class="m-2 p-2 bg-gray-200 dark:bg-gray-800">
    <Collapse name="Categories">
      <textarea
          id="rates"
          class="p-2 h-60 bg-gray-100 dark:bg-gray-800 w-1/2"
          bind:value={$categoriesText}
          style="width: 100%; height: 100px; resize: vertical;"
          placeholder="Enter multipliers in <label>:<multiplier> format. The first entry is assumed to be the time rate, which is typically multipler 1"></textarea>
      </Collapse>
  </div>
  <div class="m-2 p-2 bg-gray-200 dark:bg-gray-800">
    <Collapse name="Roles">
      <textarea
          id="rates"
          class="p-2 h-60 bg-gray-100 dark:bg-gray-800 w-1/2"
          bind:value={$ratesText}
          style="width: 100%; height: 100px; resize: vertical;"
          placeholder="Enter fair value rates in the format: description:daily rate"></textarea>
      </Collapse>
  </div>
</div>

<div class="grid grid-cols-1 gap-2 mt-8 ml-2 w-3/4">
  <h2 class="text-3xl font-bold">Kind Contract Address</h2>

  <p class="pt-2">The deployed Kind fund address, which we should enter here (see example below).</p>

  <div class="text-lg"><TextField on:change={() => onChangeAddress()} labelPlacement="float" hint="The address of the deployed grunt fund contract" class="w-3/4 text-lg mt-2" label="Contract Address" bind:value={kindContractAddress} /></div>
</div>

<pre>{JSON.stringify(settings, null, 2)}</pre>
