import { ethers } from "ethers"

// Define a key for storing transactions in localStorage
const PENDING_TX_KEY = "pending_transactions"

// Type definition for a transaction object
export type PendingTransaction = {
  hash: string
  timestamp: number,
  functionCall : string,
  status: "pending" | "confirmed" | "failed"
  submittedTransaction: Record<string, any>
}

// Type definition for transaction status object
export type TransactionStatus = {
  pendingTransaction: PendingTransaction
  currentStatus: ethers.TransactionReceipt | null
  status: "pending" | "confirmed" | "failed"
}

/**
 * Helper function to fetch transactions
 * @returns A list of all transactions currently stored in localStorage
 */
export const getAllTransactions = (): PendingTransaction[] => JSON.parse(localStorage.getItem(PENDING_TX_KEY) || "[]")

const save = (txns : PendingTransaction[]) => localStorage.setItem(PENDING_TX_KEY, JSON.stringify(txns))

/**
 * Remove specified transactions from the persisted pending transaction list
 * @param transactions An array of PendingTransaction objects to be removed
 */
export function removePendingTransactions(transactions: PendingTransaction[]): void {
    // Filter out transactions that match any in the provided array
    const updatedTxs = getAllTransactions().filter(
      existingTx => !transactions.some(tx => tx.hash === existingTx.hash)
    )
  
    // Update the localStorage with the filtered transactions
    save(updatedTxs)
  }
  
/**
 * Persist a pending transaction to localStorage
 * @param txHash The transaction hash
 * @param submittedTransaction Arbitrary JSON object representing the submitted transaction
 */
export function persistPendingTransaction(txHash: string, functionCall : string, submittedTransaction: Record<string, any>): void {
  const all = getAllTransactions()

  // Add the new transaction only if it's not already in the list
  if (!all.some(tx => tx.hash === txHash)) {
    const newTx: PendingTransaction = {
      hash: txHash,
      timestamp: Date.now(),
      functionCall,
      status: "pending",
      submittedTransaction
    }
    all.push(newTx)
    save(all)
  }
}

/**
 * List all pending transactions and return their statuses
 * @param provider An ethers provider instance
 * @returns A promise that resolves to an array of TransactionStatus objects
 */
export async function listPendingTransactions(provider: ethers.Provider): Promise<TransactionStatus[]> {
  const storedTxs = getAllTransactions()

  // Check and update the statuses of the transactions
  const transactionStatuses: TransactionStatus[] = await Promise.all(
    storedTxs.map(async (tx) => {
      let currentStatus: ethers.TransactionReceipt | null = null
      let status: "pending" | "confirmed" | "failed" = "pending"

      try {
        currentStatus = await provider.getTransactionReceipt(tx.hash)
        if (currentStatus) {
          status = currentStatus.status === 1 ? "confirmed" : "failed"
        }
      } catch (error) {
        console.error(`Error fetching status for transaction ${tx.hash}`, error)
      }

      return {
        pendingTransaction: tx,
        currentStatus,
        status
      }
    })
  )

  // Remove confirmed and failed transactions from localStorage
  const pendingTxs = transactionStatuses
    .filter(ts => ts.status === "pending")
    .map(ts => ts.pendingTransaction)

  save(pendingTxs)

  return transactionStatuses
}

