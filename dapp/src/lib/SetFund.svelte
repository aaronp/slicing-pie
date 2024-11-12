<script lang="ts">
    import { createEventDispatcher } from 'svelte'
	import deployment from '/static/assets/deployment.png'
    
  
    let address = '';
    const dispatch = createEventDispatcher()
  
    function saveAddress() {
      if (address) {
        console.log(`dispatching setAddress with ${address} is ${typeof(address)}`)
        dispatch('setAddress', address)
        
        // our routing is based on having an address, so refresh the page
        window.location.reload()
      }
    }
  </script>
  
  <h2>Set Contract Address</h2>
  <p>The Grunt Fund smart contract should report a contract address when it is first created/deployed (e.g. ).</p>
  <p>The owner of that contract will have that address, which we should enter here (see example below).</p>

  <div>
    <input
    type="text"
    bind:value={address}
    
    placeholder="Enter contract address"
  />
  <button on:click={saveAddress}>Save</button>
  </div>

  <p class="docs"><img src={deployment} alt="Smart Contract Deploy" /></p>

  <style>
    img {
        width: 60%
    }
    input {
        width: 40%;
        margin-top: 2em;
        padding: 1em;
    }
    p {
        text-align: center;
    }
    .docs {
        padding-top: 2em;
    }
  </style>
  
  