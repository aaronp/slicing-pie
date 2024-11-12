<script lang="ts">
    import { onMount } from "svelte"
    import { GruntFund } from "$lib/GruntFund"
  
    let code = $state("")
    let output = $state("")
  
    async function runCode() {

      
      try {
        const gf = await GruntFund.forAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3")

        const addresses = await gf.getAllAddresses()
        
        const result = {
            name : await gf.getName(),
            symbol : await gf.getSymbol(),
            owner : await gf.getOwner(),
            addresses
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