<script lang="ts">
  import { type Settings, type MetaMask, splitMapping } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { onMount } from "svelte"
  import Pie from "./Pie.svelte"
  import Logs from "./Logs.svelte"
  import GruntShare from "./GruntShare.svelte"

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

  const radius = 150
  const width = 400
  const height = 400

  let { gruntFund, settings, fundAddress, account } : Props = $props()

  let allAddresses : string[] = $state([])

  let balances: Balance[] = $state([]);

  let total = $state(0)

  let gruntLabelByAddress = $state(new Map<string, string>())

  let fundName : string = $state('')
  let fundSymbol : string = $state('')

  onMount(async () => {
    fundName = await gruntFund.getName()
    fundSymbol = await gruntFund.getSymbol()
    allAddresses = await gruntFund.getAllAddresses()
    
    const gruntsByAddress = splitMapping(settings.grunts)

    const insertBalance = (balances: Balance[], newBalance: Balance): Balance[] => {
      // Find the correct index to insert the new balance
      let index = balances.findIndex(balance => newBalance.amount > balance.amount)

      // If no larger amount is found, push to the end
      if (index === -1) {
        balances.push(newBalance)
      } else {
        balances.splice(index, 0, newBalance) // Insert at the found index
      }

      return balances
    }

    const values = await Promise.all(allAddresses.map(async (address) => {
        const value = await gruntFund!.getBalance(address)        
        const amount = (typeof value === 'string') ? parseInt(value, 10) : (value as Number).valueOf()

        const grunt = gruntsByAddress.find((e) => e.address == address)

        insertBalance(balances, {
            label : grunt?.label ?? address,
            address,
            amount
        })

        return amount
    }))
    
    total = values.reduce((a, b) => {
        return Number(a) + Number(b)
    }, 0)

    // balances.sort((a, b) => a.amount - b.amount)

    const grunts =  splitMapping(settings.grunts)
    grunts.forEach(grunt => {
        gruntLabelByAddress.set(grunt.address, grunt.label)
    })
    gruntLabelByAddress = new Map(gruntLabelByAddress)

  })

  const labelFor = (address : string) => gruntLabelByAddress.get(address) ?? address

</script>

<div class="bg-blue-100">

<div class="text-2xl ml-4 pt-4  mt-8">
  Total:  {total} {fundSymbol}
</div>

<div class="container mx-auto p-4">
  <div class="grid gap-4 md:grid-flow-row md:auto-cols-auto md:justify-start ">
    <!-- Component A -->
    <div class="bg-blue-500 text-white p-4 rounded-md w-max">
      <h2 class="text-lg font-bold">Pie:</h2>
      {#if total > 0}
      <Pie {width} {height} {radius} {balances} {total} />
      {/if}
    </div>

    <!-- Component B -->
    <div class="bg-green-500 text-white p-4 rounded-md w-max md:justify-self-start">
      <h2 class="text-lg font-bold">{balances.length} Grunts</h2>
      
      {#each balances as b}
        <GruntShare label={labelFor(b.address)} address={b.address} amount={b.amount} share={100 * Number(b.amount) / total} />
      {/each}

    </div>

    <!-- Component C -->
    <div class="bg-primary-900 text-white p-4 rounded-md md:col-span-2">
      <h2 class="text-lg font-bold">Events</h2>
      <Logs {gruntFund} gruntAliasByAddress={gruntLabelByAddress} />
    </div>
  </div>
</div>



</div>