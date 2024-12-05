<script lang="ts">
    import { goto } from "$app/navigation";

  import { type Settings, type MetaMask, splitMapping } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { onMount } from "svelte"
  import Pie from "./Pie.svelte"
  import BalanceTable from "./BalanceTable.svelte"
  import { Toggle, Button, Dialog, Tooltip } from "svelte-ux"
  import { page } from '$app/stores'
  

  type Props = {
    settings : Settings,
    gruntFund : GruntFund,
    fundAddress : string,
    account : MetaMask
  }
  
  export type Balance = {
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
  let isApprover = $state(false)
  let approveTooltip = $derived(isApprover ? 'Approve submitted allocation requests' : 'Only approvers have this option')

  let gruntLabelByAddress = $state(new Map<string, string>())

  let fundName : string = $state('')
  let fundSymbol : string = $state('')

  onMount(async () => {
    fundName = await gruntFund.getName()
    fundSymbol = await gruntFund.getSymbol()
    allAddresses = await gruntFund.getAllAddresses()
    
    const gruntsByAddress = splitMapping(settings.grunts)

    const insertBalance = (balanceArray: Balance[], newBalance: Balance): Balance[] => {
      // Find the correct index to insert the new balance
      let index = balanceArray.findIndex(balance => newBalance.amount > balance.amount)

      // If no larger amount is found, push to the end
      if (index === -1) {
        balanceArray.push(newBalance)
      } else {
        balanceArray.splice(index, 0, newBalance) // Insert at the found index
      }

      return balanceArray
    }

    // reset
    balances = []

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

    const ia = await gruntFund.isAllowedMinter(account.signerAddress)
    console.log(`${account.signerAddress} is approver: ${ia}`)
    isApprover = ia

    const grunts =  splitMapping(settings.grunts)
    grunts.forEach(grunt => {
        gruntLabelByAddress.set(grunt.address, grunt.label)
    })

  })

const onUploadDocs = () => goto(`${$page.url}/allocate`)
const onMint = () => goto(`${$page.url}/mint`)
const onEvents = () => goto(`${$page.url}/logs`)

</script>


<div class="text-2xl ml-4  mt-2">
  Total:  {total} {fundSymbol}
</div>


<div class="container mx-auto p-4">
  <div class="grid gap-4 md:grid-cols-[1fr auto 3fr] md:grid-rows-[auto 10px auto]">
    <!-- Component A -->
    <div class="bg-blue-500 text-white p-4 rounded-md">
      <h2 class="text-lg font-bold">Pie:</h2>
      {#if total > 0}
      <Pie {width} {height} {radius} {balances} {total} />
      {/if}
    </div>

    <!-- Component B bg-green-100  -->
    <div class="text-primary p-4 rounded-md">
      <h2 class="text-lg font-bold">{balances.length} Grunts</h2>
      
      <BalanceTable {gruntFund} {balances} {total} />

    </div>

    <!-- Component C -->
    <div class="text-white p-4 rounded-md">
      <!-- spacer -->
    </div>


    <!-- Spacer Row -->
    <div class="col-span-3" >
      <Button variant="fill" color="primary" onclick={onUploadDocs}>Submit Docs</Button>

      <Tooltip title={approveTooltip}>
        <Button disabled={!isApprover} variant="outline" color="secondary" onclick={onMint}>Approve</Button>
      </Tooltip>
      
      <Button variant="outline" color="secondary" onclick={onEvents}>Events</Button>
    </div>

    <!-- Component D -->
    <!-- <div class="bg-yellow-500 text-white p-4 rounded-md md:col-span-3">
      <h2 class="text-lg font-bold">Events</h2>
      <Logs {gruntFund} gruntAliasByAddress={gruntLabelByAddress} />
    </div> -->
  </div>
</div>
