<script lang="ts">
    import { type MetaMask, type Settings, loadSettings, connectToMetaMask } from "$lib"
    import { Button } from "svelte-ux"
    import { ethers } from "ethers"
    import { sha256 } from "@ethersproject/sha2"
  
    let droppedFile = $state(null)
    let dropTimestamp = $state(null)
    let documentHash = $state("")
    let signing = $state(false)
  
    type Props = {
      account : MetaMask 
    }
    
    let { account } : Props = $props()
  
    const signDocument = async () => {
      if (!droppedFile) return
      try {
        signing = true
        const signer = account.signer
        if (signer) {
          
          const fileContent = await readFileAsBase64(droppedFile)
          
          alert(`tpe of fileContent is ${typeof fileContent}: ${fileContent}`)
          documentHash = sha256(fileContent)
          alert(`sha256 is ${typeof documentHash}: ${documentHash}`)
          const signature = await signer.signMessage(documentHash)
          console.log("Signature:", signature)
          signing = false
        }
      } catch (error) {
        console.error("Error signing document:", error)
        signing = false
      }
    }
  
    const copyToClipboard = () => {
      if (documentHash) {
        navigator.clipboard.writeText(documentHash)
        alert("Hash copied to clipboard!")
      }
    }
  
    const handleDrop = async (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        droppedFile = file
        dropTimestamp = new Date().toLocaleString()
        documentHash = null // Reset hash if a new file is dropped
      }
    }
  
    const handleDragOver = (event) => {
      event.preventDefault()
    }
  
    const readFileAsBase64 = (file) : Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const r = reader.result
          let result = r as string | ArrayBuffer | null
          if (typeof result === 'string') {
            resolve(result)
          } else if (result instanceof ArrayBuffer) {
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result as string)
            }
            reader.readAsDataURL(new Blob([result]))
          } else {
            reject('Invalid file type')
          }
        }
        reader.onerror = () => reject(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file) // Encodes the file as Base64
      })
    }
  </script>
  
  <div class="flex flex-col items-center space-y-4">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="w-full max-w-md p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-200"
      ondrop={handleDrop}
      ondragover={handleDragOver}
    >
      <p class="text-center text-gray-500">
        Drag and drop your document here, or click to upload.
      </p>
    </div>
  
    {#if dropTimestamp}
      <div class="text-sm text-gray-700">
        File dropped at: {dropTimestamp}
      </div>
    {/if}
  
    {#if droppedFile}
      <div class="flex flex-col items-center space-y-2">
        <Button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          on:click={signDocument}
          disabled={signing}
        >
          {signing ? "Signing..." : "Sign Document"}
        </Button>
  
        {#if documentHash}
          <div class="flex flex-col items-center space-y-2">
            <div class="text-sm text-gray-700">Document Hash:</div>
            <div class="text-xs text-gray-800 break-all">{documentHash}</div>
            <Button
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              on:click={copyToClipboard}
            >
              Copy to Clipboard
            </Button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <style>
    .drop-area {
      transition: background-color 0.3s ease
    }
  
    .drop-area:hover {
      background-color: #f0f0f0
    }
  </style>
  