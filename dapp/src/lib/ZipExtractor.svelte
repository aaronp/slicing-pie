<script lang="ts">
    import { GruntFund } from './GruntFund';

  import { Notification, Icon, Tooltip, toTitleCase } from 'svelte-ux'
  import type { SignedUpload, UploadMetadata} from './docsign'
  import { validateDoc } from './docsign'

  import {
    mdiAlertOctagonOutline,
  mdiCheckCircleOutline
} from '@mdi/js'

  import { splitByAddress, type MetaMask, type Settings } from '$lib';
  import JSZip from 'jszip'

    
  type Props = {
    settings : Settings,
    account : MetaMask,
    gruntFund : GruntFund,
    fundAddress : string
  }

  let { settings, account, gruntFund, fundAddress } : Props = $props()

  let gruntsByAddress = splitByAddress(settings.grunts)
  let fundsByAddress = splitByAddress(settings.funds)

  let uploadMetadata : UploadMetadata | null = $state(null)
  let signatureUpload : SignedUpload | null = $state(null)
  let signatureIsValid = $state(false)
  let error = $state("")

  const handleFileDrop = async (event) => {
    event.preventDefault()
    error = ""
    uploadMetadata = null
    signatureUpload = null

    const files = event.dataTransfer.files
    if (files.length !== 1 || files[0].type !== 'application/zip') {
      error = 'Please drop a valid .zip file.'
      return
    }

    const zipFile = files[0]
    try {
      const zip = await JSZip.loadAsync(zipFile)
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
      try {
        signatureIsValid = await validateDoc(uploadMetadata, signatureUpload, fileContent)
      } catch (e) {
        error = `${e}`
        return
      }

    } catch (err) {
      error = 'Failed to extract files from the zip. Please ensure it is valid.'
      console.error(err)
    }
  }

  const fundName = (address : string) => fundsByAddress.get(address) ?? address
  const gruntName = (address : string) => gruntsByAddress.get(address) ?? address

  const handleDragOver = (event) => event.preventDefault()
</script>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:bg-gray-100 border-gray-300"
    ondrop={handleFileDrop}
    ondragover={handleDragOver}
  >
    <p class="text-gray-600 text-center">Drag and drop a .zip file here</p>
    <p class="text-sm text-gray-400">(Must contain metadata.json and signature.json)</p>
  </div>
  
  {#if uploadMetadata && signatureUpload}
    
    <div class="mt-4">
      <p class="text-lg"><Tooltip title={uploadMetadata.publicKey}>{gruntName(uploadMetadata.publicKey)}</Tooltip> requesting {uploadMetadata.impliedFundAmount} {await gruntFund.getSymbol()}</p>
      <p class="">It was created at {uploadMetadata.timestamp}</p>
      
      {#if error}
      <div class="grid gap-2 w-[400px]">
        <Notification
          title={toTitleCase(error)}
          icon={mdiAlertOctagonOutline}
          danger
          closeIcon
        />
      </div>
      {/if}
      
      {#if signatureIsValid}
        <div class="w-[400px]">
          <Notification
            title="Document Valid"
            description="The file {uploadMetadata.fileName} has been signed by {gruntName(uploadMetadata.publicKey)} at {uploadMetadata.timestamp}"
            icon={mdiCheckCircleOutline}
            color="success"
            closeIcon
          />
        </div>
      {/if}
    </div>
  {/if}
  
  