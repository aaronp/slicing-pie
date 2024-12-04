<script lang="ts">
    import JSZip from 'jszip'
    let extractedData = $state(null)
    let error = $state("")
  
    const handleFileDrop = async (event) => {
      event.preventDefault()
      error = ""
      extractedData = null
  
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
  
        const metadata = await metadataFile.async('string')
        const signature = await signatureFile.async('string')
  
        extractedData = {
          metadata: JSON.parse(metadata),
          signature: JSON.parse(signature),
        }
      } catch (err) {
        error = 'Failed to extract files from the zip. Please ensure it is valid.'
        console.error(err)
      }
    }
  
    const handleDragOver = (event) => {
      event.preventDefault()
    }
  </script>
  
  <div
    class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:bg-gray-100 border-gray-300"
    on:drop={handleFileDrop}
    on:dragover={handleDragOver}
  >
    <p class="text-gray-600 text-center">Drag and drop a .zip file here</p>
    <p class="text-sm text-gray-400">(Must contain metadata.json and signature.json)</p>
  </div>
  
  {#if error}
    <p class="text-red-500 mt-4">{error}</p>
  {/if}
  
  {#if extractedData}
    <div class="mt-4">
      <h3 class="text-lg font-semibold">Extracted Data:</h3>
      <pre class="p-4 mt-2 bg-gray-100 rounded-lg text-sm">
        {JSON.stringify(extractedData, null, 2)}
      </pre>
    </div>
  {/if}
  
  <style>
    /* Additional styling if needed */
  </style>
  