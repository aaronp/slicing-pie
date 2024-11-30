<script lang="ts">
    import { type Result, type LabeledAddress, type Settings, idFromPath, loadSettings, connectToMetaMask, type MetaMask } from "$lib"

    import { onMount } from 'svelte'
    let account : MetaMask | null = $state(null)
    let isConnected = $state(false)
    let message = $state('')
  
    onMount(async () => {
      const connectResult = await connectToMetaMask()
      if (typeof connectResult === 'string') {
        isConnected = false
        message = `Error connecting: ${connectResult}`
      } else {
        account = connectResult
        isConnected = true
      }
    })
  </script>
  
  {@render children()}
  <!-- {@render account, isConnected, message} -->
  