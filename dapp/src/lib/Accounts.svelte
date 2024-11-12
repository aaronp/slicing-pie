<script lang="ts">
    import { onMount } from 'svelte'
    import { ethers, JsonRpcSigner } from 'ethers'
    import { Button } from 'svelte-ux'
  
    let accounts : string[] = $state([])
    let names : string[] = $state([])
    let errorMessage = $state('')
    let infoMessage = $state('')
    let signer : JsonRpcSigner | null = $state(null)
  
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
                infoMessage = infoMessage + '; listing accounts'
                accounts = accountList.map(account => account.address);
                
                signer = await provider.getSigner()
                infoMessage = `Connected account: ${await signer.getAddress()}`;


                errorMessage = '';
            } catch (error) {
                errorMessage = `Error fetching accounts: ${error.message}`;
            }
        } else {
            errorMessage = 'MetaMask is not installed. Please install it to continue.';
        }
    }
  
    // Fetch accounts on component mount (optional)
    onMount(async () => {
        await getAccounts();
    });
  </script>
  
  <main>
    <h1>MetaMask Accounts</h1>
    <Button onclick={getAccounts}>List Accounts</Button>
  
    {#if errorMessage}
        <p style="color: red;">{errorMessage}</p>
    {/if}
  
    {#if infoMessage}
      <p style="color: blue;">{infoMessage}</p>
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
  