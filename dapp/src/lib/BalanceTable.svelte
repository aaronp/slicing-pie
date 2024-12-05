<script lang="ts">
    import { onMount } from "svelte";

import { Table } from "svelte-ux"
import { type Balance } from "./Balances.svelte"
import { GruntFund } from "$lib/GruntFund"


  type Props = {
    gruntFund : GruntFund,
    balances : Balance[],
    total: number
  }
  
  let { gruntFund, balances, total } : Props = $props()

  let fundLabel : string = $state('')

  onMount(async () => {
    fundLabel = await gruntFund.getSymbol()
  })

  let balanceData = $derived(balances.map((b) => {
    return {
        label : b.label ?? b.address,
        amount : Number(b.amount),
        percent : total > 0 ? (100 * Number(b.amount) / total).toFixed(2) : 0
    }
  }))

</script>

<Table
  data={balanceData}
  columns={[
    {
      header : "Grunt",
      name: "label",
      align: "left",
    },
    {
      header : fundLabel,
      name: "amount",
      align: "right",
      format: "integer",
      dataBackground: {
        inset: [1, 2],
        tweened: { duration: 300 },
      },
      classes: {
        td: "from-primary/35 to-primary/60",
      },
    },
    {
      header : "share",
      name: "percent",
      align: "right",
      format: "integer",
      dataBackground: {
        inset: [1, 2],
        tweened: { duration: 300 },
      },
      classes: {
        td: "from-success/35 to-success/60",
      },
    }
  ]}
/>


