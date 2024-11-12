<script lang="ts">
  import { type LabeledAddress, type Settings, type Result, type MetaMask, idFromPath, connect, splitMapping, accountFeed } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { Button  } from "svelte-ux"
  import { onMount } from "svelte";

  type Props = {
    settings : Settings,
    gruntFund : GruntFund,
    fundAddress : string
  }
  
  type Balance = {
    address :string
    amount :number
  }

  let { settings, fundAddress } : Props = $props()

  let gruntFund : GruntFund | null = $state(null)

  let allAddresses : string[] = $state([])

  let balances: Balance[] = $state([]);
  const gruntLabelByAddress = new Map<string, string>();
  let account : Result<MetaMask> = $state('init')

  onMount(async () => {

    accountFeed.subscribe(async (s) => {
        account = s
        gruntFund = await GruntFund.forSettings(fundAddress, account as MetaMask)

        allAddresses = await gruntFund!.getAllAddresses()

        allAddresses.forEach(async (address) => {
            const value = await gruntFund!.getBalance(address)        
            const amount = (typeof value === 'string') ? parseInt(value, 10) : (value as Number).valueOf()
            balances.push({
                address,
                amount
            })
        })
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

<div class="text-lg">
    !!! gruntFund:{fundAddress}
</div>

<!-- <div>
    account:
    <pre>{JSON.stringify(account, null, 2)}</pre>
</div> -->


<div>{balances.length} Grunts:</div>
<div>{allAddresses.length} allAddresses:</div>

{#each balances as b}
<div class="m-2">
    <span class="p-2">{labelFor(b.address)}:</span><span class="p-2">{b.amount}</span>
</div>

{/each}

<Button onclick={onDebug} >Check</Button>
