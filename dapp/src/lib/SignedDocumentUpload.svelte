<script lang="ts">
    
    import { defaultSettings, loadSettings, type Settings } from "./settings"
    import { Steps, Step, ProgressCircle, Icon } from 'svelte-ux'
    import { onMount } from "svelte"

    import type { BytesLike } from "ethers"
    import Calculator from "$lib/Calculator.svelte"

    import { mdiAlertCircleCheck, mdiCalculator, mdiCheck, mdiCheckCircle, mdiCreditCardOutline, mdiDownload, mdiListBoxOutline, mdiSignature, mdiTruckDeliveryOutline, mdiUpload } from '@mdi/js'

    import { type MetaMask } from "$lib"
    import { type UploadMetadata, type SignedUpload, type DocLink, signDoc, type Pie } from "./docsign"
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

    // track when the user is signing
    let signing = $state(false)

    let signedDocLink : DocLink | null = $state(null)

    let message = $state('')
  
    // for the amont calculator
    let allocation : Pie = $state({
      role : '',
      category : '',
      pie : 0,
      multiplier : 0,
      amount : 0,
    })
    // let pie = $state(0)
    // let category = $state('')
    // let role = $state('')
    // let amount = $state(0)
    let roleDesc = $derived(allocation.role && allocation.category == 'Time' ? `(${allocation.role})` : "")


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

          const [metadata, signedUpload] = await signDoc(droppedFile.name, fundAddress, allocation, account, fileContent)

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

        const [metadata, signedUpload] = await signDoc(fileName, fundAddress, allocation, account, pastedBytes)

        return await createAndDownloadZip(pastedBytes, metadata, signedUpload)     

      }
    }
  
    const handleDrop = async (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        droppedFile = file

        signing = true
        await signDocument()
        signing = false
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

    // steps are: 
    // 0. use calculator to specify amount (e.g. category (time) x rate )
    // 1. upload signed docs (e.g. timesheet, evidence, screenshot, whatever) - something signed by the grunt
    // 2. sign (via metamask)
    // 3. download the signed zip 

    // they're on step 0 if the allocation.pie is zero.
    // they're on step 1 if the uploaded doc is null
    // they're on step 2 if the signed doc is null
    // they're on the last step if all is good and there's a download link
    let hasCalculator = $derived(allocation.pie > 0)
    let hasDroppedFile = $derived(!!droppedFile)
    let hasSignedLink = $derived(!!signedDocLink)

    let step1 = $derived(hasCalculator ? 1 : 0)
    let step2 = $derived(hasDroppedFile ? 1 : 0)
    let step3 = $derived(hasSignedLink ? 1 : 0)
    
    let step = $derived(step1 + step2 + step3)

    const active = "bg-primary text-primary-content"
    const passive = ""
  </script>
  

{#if message}
  <p>{message}</p>
{/if}

<div class="grid grid-cols-[auto,1fr]">
  <div class="pt-[5em] px-2">
    <Steps vertical>
      <!-- STEP 1 -->
      <Step class="h-10" point="?" icon={mdiCalculator} completed={step >= 0} classes={{ line : passive }}  >Calculate Amount</Step>
      <!-- this is a spacer -->
      <Step point="" classes={{ point : "size-0", line : step > 1 ? active : passive }} completed={step > 0} ></Step>
      <Step point="" classes={{ point : "size-0", line : step > 1 ? active : passive  }} completed={step > 0} ></Step>
      
      
      <!-- STEP 2 -->
        <Step
        icon={mdiUpload}
        completed={step >= 1}
      >
      <span class={step < 1 ? "opacity-20" : ""}>Upload Docs</span>
      </Step>
      <!-- this is a spacer -->
      <Step point="" classes={{ point : "size-0", line : step > 1 ? active : passive  }} completed={step > 2} ></Step>
      <Step point="" classes={{ point : "size-0", line : step > 1 ? active : passive  }} completed={step > 2} ></Step>


      <!-- STEP 3 -->
      <Step
        icon={mdiSignature}
        completed={step >= 2}
      >
        <span class={step < 2 ? "opacity-20" : ""}>Signature</span>
      </Step>
      <!-- this is a spacer -->
      <Step point="" classes={{ point : "size-0", line : step > 2 ? active : passive }} completed={step > 2} ></Step>
      <Step point="" classes={{ point : "size-0", line : step > 2 ? active : passive }} completed={step > 2} ></Step>

      <!-- STEP 4 -->
      <Step icon={mdiDownload} completed={step > 2}>
        
        <span class={step < 3 ? "opacity-20" : ""}>Download & Submit</span>
        </Step>
    </Steps>

  </div>
  <div class="grid grid-cols-1">
    <!-- calculator -->
    <div class="h-[13em]">
      
      <Calculator categoies={settings?.categories ?? []} rates={settings?.rates ?? []} bind:pie={allocation.pie} bind:multiplier={allocation.multiplier}  bind:role={allocation.role} bind:category={allocation.category} bind:amount={allocation.amount} />
      
      <div class="text-xl opacity-50">{allocation.category} {roleDesc} @ {allocation.amount} x {allocation.multiplier} = {allocation.pie}</div>
    </div>

    <!-- upload -->
    <div class="h-[4em] pt-2">
      {#if hasCalculator}
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
            Drag and drop or paste associated documents
          </p>
        {/if}
        </div>
      {/if}
    </div>

    <!--- signing -->
    <div class="pl-2 pt-[5em] h-[7em]">
      {#if signing}
        <ProgressCircle
          size={20}
          class="text-info [--track-color:theme(colors.info/10%)]"
          track
        />
      {:else}
        {#if hasSignedLink}
          <Icon data={mdiCheckCircle} class="text-green-700" style="font-size: 2em;" />
        {/if}
      {/if}
    </div>

    <!-- signature -->
    <div class="h-[4em] pt-[6em]">
      {#if signedDocLink}
      <div class="bg-blue m-2 p-2">
        <a class="text-blue-500 hover:text-blue-700 underline hover:underline-offset-4 focus:outline-none focus:ring focus:ring-blue-300 transition-all duration-200" 
          href={signedDocLink.href} download={signedDocLink.fileName} >Send this document to the grunt fund manager</a>
      </div>
      {/if}
    </div>
  </div>
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
  