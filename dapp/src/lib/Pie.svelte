<script lang="ts">
  import { type Settings, type Result, type MetaMask, splitMapping, accountFeed } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { Button  } from "svelte-ux"
  import { onMount } from "svelte"
  import Arcs from "./Arcs.svelte"

  type Props = {
    settings : Settings,
    gruntFund : GruntFund,
    fundAddress : string
  }
  
  type Balance = {
    label : string,
    address :string
    amount :number
  }

  const radius = 50
  const width = 200
  const height = 200

  let { settings, fundAddress } : Props = $props()

  let gruntFund : GruntFund | null = $state(null)

  let allAddresses : string[] = $state([])

  let balances: Balance[] = $state([]);

  let total = $state(0)

  const gruntLabelByAddress = new Map<string, string>();
  let account : Result<MetaMask> = $state('init')

  onMount(async () => {

    accountFeed.subscribe(async (s) => {
        account = s
        gruntFund = await GruntFund.forSettings(fundAddress, account as MetaMask)

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
    })
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
  <span class="p-2">{labelFor(b.address)}:</span><span class="p-2">{b.amount}</span>
</div>

{/each}





<!-- svelte-ignore a11y_click_events_have_key_events -->
<svg width={width} height={height} viewBox="0 0 {width} {height}"  role="img">

  <Arcs 
  radius={radius} 
  sections={balances.map((b) => {
    return { label : b.label, percentage : total > 0 ? b.amount / total : 1 }
  })} 
  fontSize={20} 
  labelOffset={10}
  labelGap={10}
  centerX={width / 2}
  centerY={height / 2}
  />


</svg>



<Button onclick={onDebug} >Check</Button>

</div>