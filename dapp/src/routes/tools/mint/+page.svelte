<script lang="ts">
    import { onMount } from "svelte"
    import { GruntFund } from "$lib/GruntFund"
  
    let code = $state("")
    let output = $state("")

    // let address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    // async function getNonce(address : string) {
      
    //   return nonce;
    // }

    async function runCode() {

      
      try {
        const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        const gf = await GruntFund.forAddress(address)

        const nonce = await gf.provider.getTransactionCount(address, 'pending');
        console.log(`Nonce: ${nonce}`);

        // const minted = await gf.mint("0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "123", "some hash")
        
        const result = {
          nonce,
          // minted
        }
        // Use `eval` cautiously. This is for demonstration purposes only.
        // const result = eval(code);
        output = result === undefined ? "undefined" : JSON.stringify(result, null, 2);
      } catch (err) {
        output = `Error: ${err.message}`;
      }
    }
  </script>
  
  
  <div class="container">
    <h1>JavaScript Runner</h1>
  
    <!-- Multiline text input -->
    <textarea bind:value={code} placeholder="Write your JavaScript code here..."></textarea>
  
    <!-- Run button -->
    <button onclick={runCode}>Run</button>
  
    <!-- Output component -->
    <div class="output">
      <strong>Output:</strong>
      <div>{output}</div>
    </div>
  </div>
  
  <style>
    .container {
      max-width: 600px;
      margin: auto;
      padding: 1rem;
      font-family: Arial, sans-serif;
    }
    textarea {
      width: 100%;
      height: 150px;
      font-family: monospace;
      font-size: 1rem;
      padding: 0.5rem;
      margin-bottom: 1rem;
    }
    button {
      display: block;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 1rem;
    }
    .output {
      border: 1px solid #ccc;
      padding: 1rem;
      background-color: #f9f9f9;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>