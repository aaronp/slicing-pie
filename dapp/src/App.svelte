<script lang="ts">
    import { onMount } from 'svelte';
    import SetFund from './lib/SetFund.svelte';
    import Dashboard from './lib/Dashboard.svelte';
  
    let contractAddress : string | null;
  
    // Check if contractAddress exists in localStorage on component mount
    onMount(() => {
      contractAddress = localStorage.getItem('contractAddress');
    });
  
    // Function to update contractAddress in localStorage (from SetFund component)
    function setContractAddress(addressEvent) {
      console.log(`got setAddress with ${addressEvent.detail} is ${typeof(addressEvent.detail)} ==> ${JSON.stringify(addressEvent.detail)}`)      
      localStorage.setItem('contractAddress', addressEvent.detail)
      contractAddress = addressEvent.value;
    }
  </script>
  
  {#if contractAddress}
    <!-- Render Dashboard if contractAddress exists -->
    <Dashboard />
  {:else}
    <!-- Render SetFund if contractAddress is not set -->
    <SetFund on:setAddress={setContractAddress} />
  {/if}
  