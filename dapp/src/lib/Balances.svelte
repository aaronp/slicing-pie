<script lang="ts">
  import { type Settings, type MetaMask, splitMapping } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { Button  } from "svelte-ux"
  import { onMount } from "svelte"
  import Pie from "./Pie.svelte"
  import { type Section } from "./Arcs.svelte"

  type Props = {
    settings : Settings,
    gruntFund : GruntFund,
    fundAddress : string,
    account : MetaMask
  }
  
  type Balance = {
    label : string,
    address :string
    amount :number
  }

  const radius = 50
  const width = 200
  const height = 200

  let { settings, fundAddress, account } : Props = $props()

  let gruntFund : GruntFund | null = $state(null)

  let allAddresses : string[] = $state([])

  let balances: Balance[] = $state([]);

  let total = $state(0)

  const gruntLabelByAddress = new Map<string, string>()

  onMount(async () => {
    gruntFund = await GruntFund.forSettings(fundAddress, account)

    allAddresses = await gruntFund!.getAllAddresses()

    
    const gruntsByAddress = splitMapping(settings.grunts)

    const values = await Promise.all(allAddresses.map(async (address) => {
        const value = await gruntFund!.getBalance(address)        
        const amount = (typeof value === 'string') ? parseInt(value, 10) : (value as Number).valueOf()

        const grunt = gruntsByAddress.find((e) => e.address == address)
        
        console.log(`${address} is ${amount}`)
        balances.push({
            label : grunt?.label ?? address,
            address,
            amount
        })
        return amount
    }))
    
    
    total = values.reduce((a, b) => {
        return Number(a) + Number(b);
    }, 0)
        
    // connectToMetaMask
    const grunts =  splitMapping(settings.grunts)
    grunts.forEach(grunt => {
        gruntLabelByAddress.set(grunt.address, grunt.label);
    });

  })

  const onDebug = async () => {
    try {
        const found = await readAddresses()
        alert(`found ${found.length}: ${JSON.stringify(found, null, 2)}`)
    } catch(e) {
        alert(`threw called on ${await gruntFund!.contract.getAddress()}:: ${e}`)
    }
  }

  const readAddresses = async () => await gruntFund!.getAllAddresses()

  const labelFor = (address : string) => gruntLabelByAddress.get(address) ?? address

</script>

<div class="bg-blue-100">

<div class="text-lg">
  Total: {total}
  !!! gruntFund:{fundAddress}
</div>

<div>{balances.length} Grunts:</div>
<div>{allAddresses.length} allAddresses:</div>

{#each balances as b}
<div class="m-2">
  <span class="p-2">{labelFor(b.address)}:</span><span class="p-2">{b.amount} {100 * Number(b.amount) / total}%</span>
</div>

{/each}


<div class="container mx-auto p-4">
  <div class="grid gap-4 md:grid-cols-2 md:grid-rows-2">
    <!-- Component A -->
    <div class="bg-blue-500 text-white p-4 rounded-md">
      <h2 class="text-lg font-bold">Component A</h2>
      <p>
        {#if total > 0}
        <Pie {width} {height} {radius} {balances} {total} />
        {/if}
      </p>
    </div>

    <!-- Component B -->
    <div class="bg-green-500 text-white p-4 rounded-md">
      <h2 class="text-lg font-bold">Component B</h2>
      <p>Content for component B</p>
    </div>

    <!-- Component C -->
    <div class="bg-red-500 text-white p-4 rounded-md md:col-span-2">
      <h2 class="text-lg font-bold">Component C</h2>
      <p>Content for component C</p>
    </div>
  </div>
</div>



<Button onclick={onDebug} >Check</Button>

</div>