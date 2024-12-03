<script lang="ts">
    import { type MetaMask } from "$lib"
    import { Button } from "svelte-ux"
    import { sha256 } from "ethers"
    import JSZip from "jszip"


    let droppedFile = $state(null)
    let dropTimestamp = $state(null)
    let documentHash = $state("")
    let signature = $state('')
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
          
          // const fileContent = await readFileAsBase64(droppedFile)
          const fileContent = await readFileAsByteArray(droppedFile)
          // 
          // alert(`tpe of fileContent is ${typeof fileContent}: ${fileContent}`)
          // message = fileContent
          // const bytes = toUtf8Bytes(fileContent)
          documentHash = sha256(fileContent)
          
          signature = await signer.signMessage(documentHash)
          console.log("Signature:", signature)
          signing = false

          await createAndDownloadZip(droppedFile, signature, documentHash)
        }
      } catch (error) {
        console.error("Error signing document:", error)
        signing = false
      }
    }
  

    async function createAndDownloadZip(droppedFile, signature, documentHash) {
      try {
        const zip = new JSZip()
        

        // Add the original file
        const originalFileContent = await readFileAsByteArray(droppedFile)
        zip.file(droppedFile.name, originalFileContent)

        const metadata = {
          documentHash,
          signature,
          publicKey : account.signerAddress,
          timestamp : (new Date()).toISOString()
        }

        // Add the signature file
        zip.file("metadata.json", JSON.stringify(metadata, null, 2))


        // Add the hash file
        const strippedName = droppedFile.name.replace(/\./g, '_')

        // Generate the ZIP file as a Blob
        const zipBlob = await zip.generateAsync({ type: "blob" })

        // Trigger the download
        const link = document.createElement("a")
        link.href = URL.createObjectURL(zipBlob)
        link.download = `${strippedName}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log("ZIP file created and download initiated.");
      } catch (error) {
        console.error("Error creating ZIP file:", error);
      }
    }

    const copyToClipboard = (text : string) => {
      if (text) {
        navigator.clipboard.writeText(text)
        alert(`${text} copied to clipboard!`)
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
  
    const readFileAsByteArray = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Handle successful file read
        reader.onload = () => {
          const arrayBuffer = reader.result; // ArrayBuffer
          const byteArray = new Uint8Array(arrayBuffer); // Convert to byte array
          resolve(byteArray);
        };

        // Handle file read errors
        reader.onerror = () => {
          reject(new Error("Failed to read file as byte array"));
        };

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
      });
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
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onclick={() => copyToClipboard(documentHash)}
            >
              Copy to Clipboard
            </Button>
          </div>
        {/if}

        {#if signature}
          <div class="flex flex-col items-center space-y-2">
            <div class="text-sm text-gray-700">Signature:</div>
            <div class="text-xs text-gray-800 break-all">{signature}</div>
            <Button
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onclick={() => copyToClipboard(signature)}
            >
              Copy to Clipboard
            </Button>
          </div>

          <div class="flex flex-col items-center space-y-2">
            <div class="text-sm text-gray-700">Signed by:</div>
            <div class="text-xs text-gray-800 break-all">{account.signerAddress}</div>
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
  