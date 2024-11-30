<script lang="ts">
  import { type Settings, type Result, type MetaMask, splitMapping, accountFeed } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { Button  } from "svelte-ux"
  import { onMount } from "svelte"
  import Arcs from "./Arcs.svelte"
  import { type Section } from "./Arcs.svelte"
  import { type Balance } from "$lib"

  type Props = {
    balances : Balance[],
    total : number,
    radius : number,
    width : number,
    height : number
  }
  
  function calculatePieChartSegments(balances : Balance[], totalAmount : number) : Section[] {

    // Initialize the starting degree
    let currentDeg = 0

    // Map balances to include fromDeg and toDeg
    return balances.map(balance => {
      const percent = Number(balance.amount) / totalAmount
      const degrees = percent * 360
      const fromDeg = currentDeg
      const toDeg = currentDeg + degrees

      // Update currentDeg for the next balance
      currentDeg = toDeg;

      return {
        label : balance.label,
        percent,
        fromDeg: fromDeg,
        toDeg: toDeg,
      };
    });
  }


  let { radius, balances, total, width, height } : Props = $props()

  let sections : Section[] = $state([])

  onMount(() => {
    sections = calculatePieChartSegments(balances, total)
  })

</script>


<!-- svelte-ignore a11y_click_events_have_key_events -->
<svg width={width} height={height} viewBox="0 0 {width} {height}" role="img">

  <Arcs 
  radius={radius} 
  sections={sections} 
  fontSize={20} 
  labelOffset={10}
  labelGap={0}
  centerX={width / 2}
  centerY={height / 2}
  />


</svg>