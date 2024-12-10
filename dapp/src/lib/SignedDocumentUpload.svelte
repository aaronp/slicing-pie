<script lang="ts">
    
    import { defaultSettings, loadSettings, type Settings } from "./settings";

    import { onMount } from "svelte";

    import type { BytesLike } from "ethers"
    import Calculator from "$lib/Calculator.svelte"

    import { type MetaMask } from "$lib"
    import { type UploadMetadata, type SignedUpload, type DocLink, signDoc } from "./docsign"
    import JSZip from "jszip"


    type FileLike = {
      name : string
    }
    let droppedFile : FileLike | null = $state(null)
  
    type Props = {
      account : MetaMask,
      fundAddress : string
    }

    let { account, fundAddress } : Props = $props()

    let signedDocLink : DocLink | null = $state(null)

    let message = $state('')
  
    // for the amont calculator
    let pie = $state(0)
    let category = $state('')
    let role = $state('')
    let roleDesc = $derived(role && category == 'Time' ? `(${role})` : "")
    let amount = $state(0)


    let settings : Settings = $state(defaultSettings())

    onMount(() => {
      settings = loadSettings()
    })

    const signDocument = async () => {
      if (!droppedFile) return

      try {
        const signer = account.signer
        if (signer) {

          // const fileContent = await readFileAsBase64(droppedFile)
          const fileContent = await readFileAsByteArray(droppedFile)

          const impliedFundAmount = 123 // TODO - insert fund calculator to work out resulting PIE

          const [metadata, signedUpload] = await signDoc(droppedFile.name, fundAddress, impliedFundAmount, account, fileContent)

          return await createAndDownloadZip(fileContent, metadata, signedUpload)
        }
      } catch (error) {
        console.error("Error signing document:", error)
      }
    }

    async function createAndDownloadZip(originalFileContent : BytesLike, metadata : UploadMetadata, signedUpload : SignedUpload) {
      try {
        const zip = new JSZip()
        
        // Add the original file
        // const originalFileContent = await readFileAsByteArray(droppedFile)
        zip.file(metadata.fileName, originalFileContent)

        // Add the signature file
        zip.file("metadata.json", JSON.stringify(metadata, null, 2))
        zip.file("signature.json", JSON.stringify(signedUpload, null, 2))

        // Add the hash file
        const strippedName = metadata.fileName.replace(/\./g, '_')

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

    function convertBase64ToHex(base64: string): string {
      // Decode Base64 string into binary data
      const binary = atob(base64)
      let hexString = ''

      // Convert binary data to hexadecimal
      for (let i = 0; i < binary.length; i++) {
        const hex = binary.charCodeAt(i).toString(16).padStart(2, '0')
        hexString += hex
      }

      return hexString
    }
    
    const handlePaste = async (event) => {
      // Prevent default behavior (optional, if you don't want the data to appear directly in the div)
      event.preventDefault()

      // Extract the clipboard data
      const clipboardData = event.clipboardData || window.clipboardData

      if (clipboardData) {
        // let pastedImage = null
        // let pastedFile = null

        let fileName = 'Text'
        let pastedBytes : BytesLike = ''

        // Check for image in the clipboard
        const items = clipboardData.items
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              droppedFile = item.getAsFile()
              if (droppedFile) {
                fileName = droppedFile.name
                const reader = new FileReader();
                reader.onload = (e) => {
                  // pastedImage = e.target.result // Base64 image data
                  const content = e.target ? e.target.result?.toString() ?? 'null target result' : 'null target'// Base64 image data
                  console.log(content.substring(0, 20) + '...')
                  const v = convertBase64ToHex(content)
                  console.log('buffered...')
                  pastedBytes = v
                  // pastedBytes = (new TextEncoder()).encode(content)

                }
                reader.readAsDataURL(droppedFile)
                // return // Exit as we've found an image
              }
            } else if (item.kind === 'file') {
              droppedFile = item.getAsFile()
              if (droppedFile) {
                fileName = droppedFile.name
                // pastedFile = { name: file.name, type: file.type, size: file.size }
                pastedBytes = await readFileAsByteArray(droppedFile)
                console.log(`pasted data is a file: ${fileName}`)
                // return // Exit as we've processed a file
              }
            }
          }
        }

        if (!pastedBytes) {
          pastedBytes = clipboardData.getData('text')
          droppedFile = {
            name : fileName
          }
          console.log(`pasted data is text`)
        }

        console.log(`signing pasted contents for ${fileName}`)

        const impliedFundAmount = 123 // TODO - insert fund calculator to work out resulting PIE

        const [metadata, signedUpload] = await signDoc(fileName, fundAddress, impliedFundAmount, account, pastedBytes)

        return await createAndDownloadZip(pastedBytes, metadata, signedUpload)     

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
          const arrayBuffer = reader.result
          const byteArray = new Uint8Array(arrayBuffer) 
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
  
  <div class="flex flex-col space-y-4 my-8">
    <h4>Pie Amount:</h4>
    <Calculator categoies={settings?.categories ?? []} rates={settings?.rates ?? []} bind:pie={pie} bind:role={role} bind:category={category} bind:amount={amount}/>
    <div class="text-xl opacity-50">{category} {roleDesc} @ {amount} = {pie}</div>
  </div>
  <div class="flex flex-col items-center space-y-4">
    {#if message}
      <p>{message}</p>
    {/if}

    
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      tabindex="0" 
      contenteditable="true" 
      class="w-full max-w-md p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-200 drop-area"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      onpaste={handlePaste}
    >
    <!-- <input onpaste={handlePaste} /> -->
    {#if droppedFile}
      <p class="text-center text-gray-500 drop-target">
        Uploaded {droppedFile.name}
      </p>
    {:else}
      <p class="text-center text-gray-500">
        Drag and drop or paste associated documents here
      </p>
    {/if}
    </div>
  
    {#if signedDocLink}
    <div class="bg-blue m-2 p-2">
      
      <a class="text-blue-500 hover:text-blue-700 underline hover:underline-offset-4 focus:outline-none focus:ring focus:ring-blue-300 transition-all duration-200" 
        href={signedDocLink.href} download={signedDocLink.fileName} >Send this document to the grunt fund manager</a>
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
  