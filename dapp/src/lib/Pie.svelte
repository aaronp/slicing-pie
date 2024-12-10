<script lang="ts">
  import { onMount } from "svelte"
  import { BarStack, TweenedValue, cls, format } from "svelte-ux"
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
        amount : Number(balance.amount),
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

  const colorForIndex = (i : number) => {
    const colors = ['bg-warning', 'bg-info', 'bg-success', 'bg-danger']
    return colors[i % colors.length]
  }

  let barData = $derived(sections.map((s, i) => {
    return { label: s.label, value: s.amount, classes: { bar: colorForIndex(i) } }
  }))


  let data = [
    { label: 'Safari', value: 18.55, classes: { bar: 'bg-info' } },
    { label: 'Edge', value: 5.03, classes: { bar: 'bg-success' } },
    { label: 'Firefox', value: 2.8, classes: { bar: 'bg-danger' } },
  ]

  const duration = 500
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

<BarStack data={barData} let:item {total}>
  <div
    class={cls("group-first:rounded-l group-last:rounded-r", item.classes?.bar)}
  >
    <div class="flex items-center gap-1 truncate py-1 px-2">
      <span class="text-sm font-semibold text-gray-900">
        <TweenedValue
          value={item.value / total}
          let:value
          options={{ duration }}
        >
          {format(value ?? 0, "percent")}
        </TweenedValue>
      </span>

      <span class="truncate text-xs text-gray-900">
        <TweenedValue value={item.value} let:value options={{ duration }}>
          ({format(value ?? 0, "integer")})
        </TweenedValue>
      </span>
    </div>
  </div>
  <div class="truncate text-xs font-semibold text-surface-content">
    {item.label}
  </div>
</BarStack>