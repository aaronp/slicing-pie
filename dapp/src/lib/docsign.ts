import type { MetaMask } from "$lib"
import type { BytesLike } from "ethers"
import { sha256, toUtf8Bytes } from "ethers"

export type UploadMetadata = {
    fileName : string,
    fundAddress : string,
    publicKey : string,
    timestamp  : string
  }

export type SignedUpload = {
    hash : string,
    signature : string
}

export const signDoc = async (fileName : string, fundAddress : string, account : MetaMask, fileContent : BytesLike) : Promise<[UploadMetadata, SignedUpload]> => {

    const documentHash = sha256(fileContent)

    const metadata = {
        fileName,
        fundAddress,
        publicKey : account.signerAddress,
        timestamp : (new Date()).toISOString()
      }
    const metadataContent = JSON.stringify(metadata, null, 2)
    
    const metadataHash = sha256(toUtf8Bytes(metadataContent))
    const hash = sha256(toUtf8Bytes(documentHash + metadataHash))
    
    const signature = await account.signer.signMessage(hash)

    const signedUpload : SignedUpload = {
        hash,
        signature,
    }

    return [metadata, signedUpload]
}