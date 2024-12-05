<script lang="ts">
  import { onMount } from 'svelte';

  import { GruntFund } from './GruntFund';

  import { Notification, Icon, Button, Tooltip, toTitleCase, Checkbox } from 'svelte-ux'
  import type { DocLink, SignedUpload, UploadMetadata} from './docsign'
  import { validateDoc } from './docsign'

  import {
    mdiAlert,
    mdiAlertOctagonOutline,
    mdiCheckCircleOutline
  } from '@mdi/js'

  import { splitByAddress, type MetaMask, type Settings } from '$lib';
  import JSZip from 'jszip'

    
  type Props = {
    settings : Settings,
    account : MetaMask,
    gruntFund : GruntFund,
    fundAddress : string,
    onBack : () => void
  }

  let { settings, account, gruntFund, fundAddress, onBack } : Props = $props()

  let gruntsByAddress = splitByAddress(settings.grunts)
  let fundsByAddress = splitByAddress(settings.funds)

  let uploadMetadata : UploadMetadata | null = $state(null)
  let signatureUpload : SignedUpload | null = $state(null)
  let signatureIsValid = $state(false)
  let useHoldingFund = $state(false)
  let isValid = $derived(signatureIsValid)
  let error = $state("")

  // the symbol which we retrieve from the chain
  let fundSymbol = $state("")

  let uploadLink : DocLink | null = $state(null)
  let docLink : DocLink | null = $state(null)

  onMount(async() => {
    fundSymbol = await gruntFund.getSymbol()
  })

  const handleFileDrop = async (event) => {
    event.preventDefault()
    error = ""
    uploadMetadata = null
    signatureUpload = null

    const files = event.dataTransfer.files
    if (files.length !== 1 || files[0].type !== 'application/zip') {
      error = 'Please drop a valid zip file.'
      return
    }

    const zipFile = files[0]
    try {
      const zip = await JSZip.loadAsync(zipFile)


      // we make assumptions on the zip (that it was created from our SignedDocumentUpload), which has
      // specific entries we look for.
      //
      // these files, BTW, are indented to be stored securely off-chain, ideally with access controls as the file contents
      // may be sensitive

      const metadataFile = zip.file('metadata.json')
      const signatureFile = zip.file('signature.json')
      
      if (!metadataFile || !signatureFile) {
        error = 'The zip file must contain metadata.json and signature.json.'
        return
      }

      uploadMetadata = JSON.parse(await metadataFile.async('string')) as UploadMetadata
      signatureUpload = JSON.parse(await signatureFile.async('string')) as SignedUpload

      const uploadFile = zip.file(uploadMetadata.fileName)
      if (!uploadFile) {
        error = `Corrupted upload. The file ${uploadMetadata.fileName} is missing`
        return
      }

      const fileContentBuffer : ArrayBuffer = await uploadFile.async('arraybuffer')
      const fileContent = new Uint8Array(fileContentBuffer)

      uploadLink = {
        href : URL.createObjectURL(new Blob([zipFile])),
        fileName : zipFile.name
      }
      docLink = {
        href : URL.createObjectURL(new Blob([fileContentBuffer])),
        fileName : uploadMetadata.fileName
      }

      try {
        signatureIsValid = await validateDoc(uploadMetadata, signatureUpload, fileContent)
      } catch (e) {
        error = `Error validating the doc: ${e}`
        return
      }

    } catch (err) {
      error = `Failed to extract files from the zip: ${err}`
    }
  }

  const fundName = (address : string) => fundsByAddress.get(address) ?? address
  const gruntName = (address : string) => gruntsByAddress.get(address) ?? address

  const handleDragOver = (event) => event.preventDefault()

  const mintToHoldingFund = async () => {
    try {
        const response = await gruntFund?.mintForKindFund(settings.kindContractAddress, uploadMetadata.publicKey, uploadMetadata.impliedFundAmount, signatureUpload.signature)
        console.log(`submitted ${JSON.stringify(response)}`)
        return response
    } catch(e) {
        error = `Error minting token: ${e}`
    }
  }

  const mintToGruntFund = async () => {
    if (!uploadMetadata || !signatureUpload) {
      throw new Error("Bug: uploadMetadata or signatureUpload is null")
    }

    try {
        const response = await gruntFund?.mint(uploadMetadata.publicKey, uploadMetadata.impliedFundAmount, signatureUpload.signature)
        console.log(`submitted ${JSON.stringify(response)}`)
        return response
    } catch(e) {
        error = `Error minting token: ${e}`
    }
  }
  const approveAndMint = async () => {
    if (!uploadMetadata || !signatureUpload) {
      error = "Bug no metadata"
      return 
    }

    if (useHoldingFund) {
      const response = await mintToHoldingFund()
      console.log(`mint to kind got ${JSON.stringify(response, null, 2)}`)
    } else {
      const response = await mintToGruntFund()
      console.log(`mint to grunt fund got ${JSON.stringify(response, null, 2)}`)
    }
  }
</script>
  
{#if !signatureIsValid}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:bg-gray-100 border-gray-300"
    ondrop={handleFileDrop}
    ondragover={handleDragOver}
  >
    <p class="text-gray-600 text-center">Drag and drop a .zip file here</p>
    <p class="text-sm text-gray-400">(Must contain metadata.json and signature.json)</p>
  </div>
  {/if}
  
  {#if error}
    <div class="grid gap-2 w-[400px] mt-8">
      <Notification
        title={toTitleCase(error)}
        icon={mdiAlertOctagonOutline}
        color="danger"
        danger
        closeIcon
      />
    </div>
  {/if}

  {#if uploadMetadata && signatureUpload}
    
    {#if signatureIsValid}
    <div class="w-[400px] mt-4 mb-4">
      <Notification
        title="The document is valid"
        description="The file {uploadMetadata.fileName} has been signed by {gruntName(uploadMetadata.publicKey)} at {uploadMetadata.timestamp}"
        icon={mdiCheckCircleOutline}
        color="success"
        closeIcon
      />
    </div>
  {/if}
    <div class="mt-4">
      <p class="text-lg"><Tooltip title={uploadMetadata.publicKey}>"{toTitleCase(gruntName(uploadMetadata.publicKey))}"</Tooltip> is requesting {uploadMetadata.impliedFundAmount} {fundSymbol}</p>
      <p class="">Their request was created at {uploadMetadata.timestamp}</p>
      
      {#if docLink}
      <div class="bg-blue mt-2 pt-2">
        Uploaded file:
        <Tooltip title="document hash: {signatureUpload.hash}\nsignature: {signatureUpload.signature}">
          <a class="text-blue-500 hover:text-blue-700 underline hover:underline-offset-4 focus:outline-none focus:ring focus:ring-blue-300 transition-all duration-200" 
          href={docLink.href} download={docLink.fileName} >{docLink.fileName}</a>
        </Tooltip>
      </div>
      {/if}
      
    </div>
  {/if}
  

  <div class="my-2">
    {#if isValid}

    <div class="my-2 py-2">
      <Tooltip title="If this is checked, the grunt will earn equity in the holding company, and the holding company will earn equity in the grunt fund">
        <Checkbox  bind:checked={useHoldingFund} fullWidth>Allocate to Holding Group</Checkbox>
      </Tooltip>
    </div>
      <Button variant="fill" color="primary" onclick={async () => approveAndMint()}>Approve</Button>
    {/if}
    <Button variant="outline" color="secondary" onclick={onBack}>Back</Button>
  </div>

  {#if isValid}
    <p class="text-red-300"><Icon class="my-4 mr-4" data={mdiAlert}/>Note: be sure to upload {#if uploadLink}
      <span class="bg-blue mt-2 pt-2">
        <a class="text-blue-500 hover:text-blue-700 underline hover:underline-offset-4 focus:outline-none focus:ring focus:ring-blue-300 transition-all duration-200" 
          href={uploadLink.href} download={uploadLink.fileName} >the uploaded document</a>
      </span>
      {:else}
      this document
      {/if} to permanent store.</p>
    
  {/if}