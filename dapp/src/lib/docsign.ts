import type { MetaMask } from "$lib"
import type { BytesLike } from "ethers"
import { ethers } from "ethers"
import { sha256, toUtf8Bytes } from "ethers"

export type UploadMetadata = {
    fileName : string,
    fundAddress : string,
    publicKey : string,
    timestamp  : string,
    impliedFundAmount : number
  }

export type SignedUpload = {
    hash : string,
    signature : string
}

export type DocLink = {
  href : string,
  fileName : string
}


const metadataHash = (metadata : UploadMetadata) => {
  const metadataContent = JSON.stringify(metadata, null, 2)
  return sha256(toUtf8Bytes(metadataContent))
}

// we concatenate the SHA256 of the content and the metadata for the content (signer, fund, timestamp)
const uploadHash = (fileContent : BytesLike, metadata : UploadMetadata) => sha256(toUtf8Bytes(sha256(fileContent) + metadataHash(metadata)))

/**
 * used to validate a zip file
 * @param uploadMetadata the metadata associated with the upload
 * @param signature the signature of the privately-signed file content and metadata
 * @param fileContent the content of the file signed by the grunt
 * @returns true if the signature matches the hash of the fileContent and metadata. 
 * @throws If the hash of the content and metadata don't match the original hash computed and saved in the uploadMetadata, which indicates the file contents or metadata have been tampered with
 */
export const validateDoc  = async (uploadMetadata : UploadMetadata, signature : SignedUpload, fileContent : BytesLike) => {
  const unsignedHash = uploadHash(fileContent, uploadMetadata)

  // Reconstruct the signed message from the signed hash
  const recoveredAddress = ethers.verifyMessage(unsignedHash, signature.signature)
  
  if (signature.hash != unsignedHash) {
    throw new Error("The file appears corrupted, as the SHA256 hash doesn't match")
  }

  return recoveredAddress.toLowerCase() === uploadMetadata.publicKey.toLowerCase()
}

export const signDoc = async (fileName : string, fundAddress : string, impliedFundAmount : number, account : MetaMask, fileContent : BytesLike) : Promise<[UploadMetadata, SignedUpload]> => {
    const metadata = {
      fileName,
      fundAddress,
      publicKey : account.signerAddress,
      timestamp : (new Date()).toISOString(),
      impliedFundAmount
    }

    const hash = uploadHash(fileContent, metadata)
    const signature = await account.signer.signMessage(hash)

    const signedUpload : SignedUpload = {
        hash,
        signature,
    }

    return [metadata, signedUpload]
}