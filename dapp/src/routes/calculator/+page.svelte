<script lang="ts">
    import Calculator from "$lib/Calculator.svelte"
    import { loadSettings, type Settings } from "$lib/settings"
    import { onMount } from "svelte";

    let settings : Settings | null = $state(null)
    let pie = $state(0)
    let category = $state('')
    let role = $state('')
    let amount = $state(0)

    onMount(() => {
        settings = loadSettings()
    })

    let roleDesc = $derived(role && category == 'Time' ? `(${role})` : "")
</script>

<Calculator categoies={settings?.categories ?? []} rates={settings?.rates ?? []} bind:pie={pie} bind:role={role} bind:category={category} bind:amount={amount}/>

<div class="text-4xl">{category} {roleDesc} @ {amount} = {pie}</div>