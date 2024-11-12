<script lang="ts">
    let contractAddress = localStorage.getItem('contractAddress')
    const reset = () => {
        localStorage.removeItem('contractAddress')
        window.location.reload()
    }
</script>
  
  <h2>Dashboard</h2>
  <p>Contract Address: {JSON.stringify(contractAddress, null, 2)}</p>
  <button on:click={reset} >Reset</button>
  