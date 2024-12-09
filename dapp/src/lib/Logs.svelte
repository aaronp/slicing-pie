<script lang="ts">
    import { GruntFund, type EventData } from "$lib/GruntFund"
    import { onMount } from "svelte"
    import { Timeline, TimelineEvent } from "svelte-ux"
    import { mdiAbacus, mdiArrowRight, mdiCheckCircle, mdiCross } from '@mdi/js'
    import { listAndUpdatePendingTransactions, type TransactionStatus } from "./pendingTransactions"
    import type { KindFund } from "./KindFund"
  
    type Props = {
      contract : GruntFund | KindFund
      gruntAliasByAddress : Map<String, String>
      fundAliasByAddress : Map<String, String>
    }

    let { contract, gruntAliasByAddress, fundAliasByAddress } : Props = $props()
  
    let events : EventData[] = $state([])
    let pending : TransactionStatus[] = $state([])
  
    let gruntSymbol = $state('')
    onMount(async () => {
      events = contract instanceof GruntFund ? await contract.events() : await (contract as KindFund).events()
      const provider = contract instanceof GruntFund ? contract.provider : (contract as KindFund).provider
      pending = await listAndUpdatePendingTransactions(provider)
      
      if (contract instanceof GruntFund) {
        gruntSymbol = await contract.getSymbol()
      } else {
        gruntSymbol = 'GROUP'
      }

    })
  
    const pendingDetails = $derived(pending.map((e) => {
      const timestamp = new Date(e.pendingTransaction.timestamp)
      const description = JSON.stringify(e.pendingTransaction.submittedTransaction, null, 2)
      let icon = e.status === "pending" ? mdiArrowRight : (e.status === "confirmed" ? mdiCheckCircle : mdiCross)
      return {
            date : `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`,
            title : `${e.status} : ${e.pendingTransaction.functionCall}`,
            description,
            icon
        }
    }))

    const fundDetails = $derived(events.map((e) => {

        let icon = mdiAbacus
        let description = ''
        if (e.event == "Allocated") {
            icon = mdiCheckCircle
            const name = gruntAliasByAddress.get(e.args.recipient) ?? e.args.recipient
            description = `gave ${name} ${e.args.amount} ${gruntSymbol}\ndoc: ${e.args.documentHash}`
        } else if (e.event == "Transfer") {
            const from = gruntAliasByAddress.get(e.args.from) ?? e.args.from
            const to = gruntAliasByAddress.get(e.args.to) ?? e.args.to
            description = `Transfered ${e.args.amount} ${gruntSymbol} from ${from} to ${to}`
            icon = mdiArrowRight
        } else if (e.event == "Minted") {
            const person = gruntAliasByAddress.get(e.args.person) ?? e.args.person
            const fundAddress = fundAliasByAddress.get(e.args.fundAddress) ?? e.args.fundAddress
            description = `${person} earned ${e.args.amount} ${gruntSymbol} in the Group Fund and ${fundAddress}`
            icon = mdiArrowRight
        } else {
          description = `${e.args}`
        }

        return {
            date : `${e.timestamp.toLocaleDateString()} ${e.timestamp.toLocaleTimeString()}`,
            title : e.event,
            description,
            icon
        }
    }))

    const eventDetails = $derived([...fundDetails, ...pendingDetails])
  
  </script>
  
  {#if eventDetails.length == 0}
  <p>No events found</p>
  {:else}
  <Timeline vertical compact snapPoint>
    {#each eventDetails as item, i}
      <TimelineEvent
        icon={item.icon}
        start={i % 2 === 0}
        end={i % 2 !== 0}
        classes={{
          icon: "size-5",
        }}
        completed={true}
      >
        <div class="-mt-0.5 mb-10 mx-2">
          <time class="font-mono italic">{item.date}</time>
          <div class="text-lg font-black">{item.title}</div>
          <div class="text-surface-content/70 text-sm text-secondary">
            {item?.description}
          </div>
        </div>
      </TimelineEvent>
    {/each}
  </Timeline>
  {/if}