<script lang="ts">
    import Calculator from "$lib/Calculator.svelte"
    import { loadSettings, type Settings } from "$lib/settings"
    import { onMount } from "svelte";

    let settings : Settings | null = $state(null)
    let amount = $state(0)

    onMount(() => {
        settings = loadSettings()
    })

</script>

<Calculator categoies={settings?.categories ?? []} rates={settings?.rates ?? []} bind:amount={amount}/>

<div class="text-4xl">{amount}</div>