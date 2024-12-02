<script lang="ts">
  import { type MetaMask } from "$lib"
  import { Button } from "svelte-ux"
  import { sha256 } from "ethers"
  import { ethers } from "ethers"


  type Props = {
    account : MetaMask 
  }
  
  let { account } : Props = $props()
  
    let unsignedDocumentHash = $state("") // The SHA-256 hash of the document (unsigned)
    let signedHash = $state("") // The hash signed by the signer
    let signerAddress = $state("") // The expected public address of the signer
    let verificationResult = $state(null) // Stores the verification result
    let verifying = $state(false)
  
    const verifySignature = async () => {
      try {
        verifying = true;
        verificationResult = null;
  
        if (!unsignedDocumentHash || !signedHash || !signerAddress) {
          verificationResult = "Please provide all required inputs.";
          verifying = false;
          return;
        }
  
        // Reconstruct the signed message from the signed hash
        const recoveredAddress = ethers.verifyMessage(unsignedDocumentHash, signedHash);
  
        // Compare the recovered address with the provided address
        verificationResult = recoveredAddress.toLowerCase() === signerAddress.toLowerCase()
          ? "Signature is valid! The signer matches the expected address."
          : "Signature is invalid. The signer does not match the expected address.";
  
        verifying = false;
      } catch (error) {
        console.error("Error verifying signature:", error);
        verificationResult = "An error occurred during verification.";
        verifying = false;
      }
    };
  </script>
  
  <div class="flex flex-col items-center space-y-4 p-4">
    <h2 class="text-lg font-semibold text-gray-700">Verify Signature</h2>
  
    <div class="w-full max-w-lg space-y-2">
      <label class="block text-sm text-gray-600">Unsigned Document Hash (SHA-256)</label>
      <textarea
        class="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
        bind:value={unsignedDocumentHash}
        placeholder="Enter the unsigned document hash..."
        rows="2"
      ></textarea>
  
      <label class="block text-sm text-gray-600">Signed Hash</label>
      <textarea
        class="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
        bind:value={signedHash}
        placeholder="Enter the signed hash..."
        rows="3"
      ></textarea>
  
      <label class="block text-sm text-gray-600">Signer's Public Address</label>
      <input
        type="text"
        class="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
        bind:value={signerAddress}
        placeholder="Enter the public address of the signer..."
      />
    </div>
  
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      on:click={verifySignature}
      disabled={verifying}
    >
      {verifying ? "Verifying..." : "Verify Signature"}
    </button>
  
    {#if verificationResult}
      <div
        class="mt-4 p-4 w-full max-w-lg border rounded-md text-sm"
        class:bg-green-100={verificationResult.startsWith("Signature is valid")}
        class:bg-red-100={verificationResult.startsWith("Signature is invalid")}
      >
        {verificationResult}
      </div>
    {/if}
  </div>
  
  <style>
    textarea {
      resize: none;
    }
  </style>
  