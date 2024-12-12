import type { MetaMask } from "$lib"
import type { BytesLike } from "ethers"
import { ethers } from "ethers"
import { sha256, toUtf8Bytes } from "ethers"
import { listPendingTransactions } from './pendingTransactions'
import { GruntFund, type EventData } from "./GruntFund"

export type Pie = {
  pie : number,
  category : string, // the pie category (time, cash, debt, etc)
  role : string | null, // if the category is time, this is the role of the grunt (CTO, marketing, UX, etc)
  amount : number, // the value (hours, money, etc)
  multiplier : number, // the multiplier of the category (e.g. 4x for cash, 1x for time)
}

export type UploadMetadata = {
    fileName : string,
    fundAddress : string,
    publicKey : string,
    timestamp  : string,
    allocation : Pie    
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

export const signDoc = async (
  fileName : string, 
  fundAddress : string, 
  allocation : Pie,
  account : MetaMask, 
  fileContent : BytesLike) : Promise<[UploadMetadata, SignedUpload]> => {
    const metadata = {
      fileName,
      fundAddress,
      publicKey : account.signerAddress,
      timestamp : (new Date()).toISOString(),
      allocation
    }

    const hash = uploadHash(fileContent, metadata)
    const signature = await account.signer.signMessage(hash)

    const signedUpload : SignedUpload = {
        hash,
        signature,
    }

    return [metadata, signedUpload]
}


export const chainContainsDocHash = async (events : EventData[], signedDocHash : string) => {
  for (const e of events) {
    if (e.event == "Allocated") {
      const matches = signedDocHash === e.args.documentHash
      console.log(`checking ${matches}: ${signedDocHash} === ${e.args.documentHash}`)        
      if (matches) {
        return true
      }
    }
  }
  console.log(`doc ${signedDocHash} is not in ${events.length} checked chain events`)
  return false
}

/**
 * We check both chain events and pending transactions to see if there is a mint with this samed signed document hash.
 * This is to protect against double-payment, which is an off-chain operation (the rationale being that it simplifies the contract)
 * 
 * @param signedHash
 */
export const pendingTransactionsContainsDocHash = async (provider: ethers.Provider, signedHash :string) => {
  const pending = await listPendingTransactions(provider)
    
  for (const p of pending) {
    const txn = p.pendingTransaction.submittedTransaction
    if (txn.data && txn.value) {
      const fn =  GruntFund.parseTransaction(txn.data, txn.value)  
      if (fn.name == 'mint') {
        // the doc hash is the last argument in the mint function
        const signedDocHash = fn.args[fn.args.length - 1]
        if (signedHash == signedDocHash) {
          console.error("The signed hash has already been submitted as a pending transaction")
          return true
        }
      } else {
        console.log(`skipping ${fn.name}`)
      }
    } else {
      console.error(`skipping pending txn ${JSON.stringify(txn, null, 2)}`)
    }
  }
  console.log(`didn't find ${signedHash} in ${pending.length} pending  chain events`)
  return false
}
