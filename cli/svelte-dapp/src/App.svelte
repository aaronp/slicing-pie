<script>
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';

  let accounts = [];
  let errorMessage = '';

  // Function to fetch accounts from MetaMask
  async function getAccounts() {
      if (typeof window.ethereum !== 'undefined') {
          try {
              // Request MetaMask accounts
              await window.ethereum.request({ method: 'eth_requestAccounts' });

              // Create an ethers provider
              const provider = new ethers.BrowserProvider(window.ethereum);

              // Get the list of accounts
              const accountList = await provider.listAccounts();
              accounts = accountList.map(account => account.address);
              errorMessage = '';
          } catch (error) {
              errorMessage = 'Error fetching accounts: ' + error.message;
          }
      } else {
          errorMessage = 'MetaMask is not installed. Please install it to continue.';
      }
  }

  // Fetch accounts on component mount (optional)
  onMount(() => {
      getAccounts();
  });
</script>

<main>
  <h1>MetaMask Accounts</h1>
  <button on:click={getAccounts}>List Accounts</button>

  {#if errorMessage}
      <p style="color: red;">{errorMessage}</p>
  {/if}

  <ul>
      {#each accounts as account}
          <li>{account}</li>
      {/each}
  </ul>
</main>

<style>
  main {
      text-align: center;
      margin-top: 2rem;
  }
  button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
  }
</style>
