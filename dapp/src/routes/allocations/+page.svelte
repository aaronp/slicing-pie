<script lang="ts">
    import { _requestMint } from './+page'
    import { onMount } from 'svelte'
    import { Button, Dialog } from 'svelte-ux'

    import { writable, derived } from 'svelte/store'
    let contractAddress = $state('')

    onMount(() => {
      contractAddress = localStorage.getItem('contractAddress') || ''
    })


    // Create a writable store for the gruntAddresses
    const storedAddresses = localStorage.getItem('gruntAddresses') || ''
    let gruntAddresses = writable(storedAddresses)

    // Sync the writable store with localStorage
    gruntAddresses.subscribe(value => {
        localStorage.setItem('gruntAddresses', value);
    })

    // Derived store to parse gruntAddresses into { label, address } pairs
    export const grunts = derived(gruntAddresses, $gruntAddresses => {
        return $gruntAddresses
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.includes(':'))
            .map(line => {
                const [label, address] = line.split(':').map(part => part.trim());
                return { label, address };
            });
    });

    // Store for selected grunt and allocation amount
    let selectedGrunt = $state('')
    let amount = $state('')

    let open = $state(false)
    let message = $state('')

    // Function to handle allocation (replace this with your allocation logic)
    const makeAllocation = async () => {
        if (selectedGrunt && amount) {
            try {
                // const response = await _requestMint(contractAddress, selectedGrunt, parseInt(amount, 10))
                const response = await _requestMint(contractAddress, selectedGrunt, amount)
                message = `Allocated ${amount} to ${selectedGrunt} returned ${response.message}`
                open = true
            } catch (e) {
                alert("Bug: " + e)
            }
        } else {
            alert('Please select a grunt and enter an amount.')
        }
    };
</script>

<!-- Allocate Dropdown -->
<div class="grid grid-cols-1 gap-2 mt-8">
    <label for="allocate">Allocate:</label>
    <select id="allocate" bind:value={selectedGrunt}>
        <option value="" disabled selected>Select a grunt</option>
        {#each $grunts as grunt}
            <option value={grunt.address}>{grunt.label}</option>
        {/each}
    </select>
</div>

<!-- Amount Input -->
<div class="grid grid-cols-1 gap-2 mt-8">
    <label for="amount">Amount:</label>
    <input
        id="amount"
        type="number"
        bind:value={amount}
        placeholder="Enter amount" />
</div>

<!-- Allocate Button -->
<div class="pt-8">
    <Button variant="fill" color="primary" rounded onclick={makeAllocation}>Allocate</Button>
</div>

<!-- <Button on:click={() => (open = true)}>Show Dialog</Button> -->
<Dialog bind:open>
  <div slot="title">{message}</div>
  <div slot="actions">
    <Button variant="fill" color="primary">Close</Button>
  </div>
</Dialog>