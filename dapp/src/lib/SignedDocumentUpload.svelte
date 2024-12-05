<script lang="ts">
    import type { BytesLike } from "ethers"

    import { type MetaMask } from "$lib"
    import { type UploadMetadata, type SignedUpload, type DocLink, signDoc } from "./docsign"
    import JSZip from "jszip"


    let droppedFile = $state(null)
  
    type Props = {
      account : MetaMask,
      fundAddress : string
    }

    let { account, fundAddress } : Props = $props()

    let signedDocLink : DocLink | null = $state(null)

    let message = $state('')
  
    const signDocument = async () => {
      if (!droppedFile) return
      try {
        const signer = account.signer
        if (signer) {

          // const fileContent = await readFileAsBase64(droppedFile)
          const fileContent = await readFileAsByteArray(droppedFile)

          const impliedFundAmount = 123 // TODO - insert fund calculator to work out resulting PIE

          const [metadata, signedUpload] = await signDoc(droppedFile.name, fundAddress, impliedFundAmount, account, fileContent)

          return await createAndDownloadZip(droppedFile, metadata, signedUpload)
        }
      } catch (error) {
        console.error("Error signing document:", error)
      }
    }

    async function createAndDownloadZip(droppedFile, metadata : UploadMetadata, signedUpload : SignedUpload) {
      try {
        const zip = new JSZip()
        
        // Add the original file
        const originalFileContent = await readFileAsByteArray(droppedFile)
        zip.file(droppedFile.name, originalFileContent)

        // Add the signature file
        zip.file("metadata.json", JSON.stringify(metadata, null, 2))
        zip.file("signature.json", JSON.stringify(signedUpload, null, 2))

        // Add the hash file
        const strippedName = droppedFile.name.replace(/\./g, '_')

        // Generate the ZIP file as a Blob
        const zipBlob = await zip.generateAsync({ type: "blob" })

        signedDocLink = {
          href : URL.createObjectURL(zipBlob),
          fileName : `${signedUpload.signature}-${strippedName}.zip`
        }

      } catch (error) {
        message = `Error creating ZIP file: ${error}`
      }
    }
  
    const handleDrop = async (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        droppedFile = file

        await signDocument()
      }
    }
  
    const handleDragOver = (event) => event.preventDefault()
  
    const readFileAsByteArray = (file) : Promise<BytesLike> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        // Handle successful file read
        reader.onload = () => {
          const arrayBuffer = reader.result // ArrayBuffer
          const byteArray = new Uint8Array(arrayBuffer) // Convert to byte array
          resolve(byteArray)
        }

        // Handle file read errors
        reader.onerror = () => {
          reject(new Error("Failed to read file as byte array"));
        }

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file)
      })
    }

  </script>
  
  <div class="flex flex-col items-center space-y-4">
    {message}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="w-full max-w-md p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-200"
      ondrop={handleDrop}
      ondragover={handleDragOver}
    >
    {#if droppedFile}
      <p class="text-center text-gray-500 drop-target">
        Dropped {droppedFile.name}
      </p>
    {:else}
      <p class="text-center text-gray-500">
        Drag and drop your document here, or click to upload.
      </p>
    {/if}
    </div>
  
    {#if signedDocLink}
    <div class="bg-blue m-2 p-2">
      Send this document to the grunt fund manager:
      <a class="text-blue-500 hover:text-blue-700 underline hover:underline-offset-4 focus:outline-none focus:ring focus:ring-blue-300 transition-all duration-200" 
        href={signedDocLink.href} download={signedDocLink.fileName} >{signedDocLink.fileName}</a>
    </div>
    {/if}
  </div>
  
  <style>
    .drop-area {
      transition: background-color 0.3s ease
    }

    .drop-target {
      cursor: pointer;
    }
  
    .drop-area:hover {
      background-color: #f0f0f0
    }
  </style>
  