<script lang="ts">
    import { GruntFund, type EventData } from "$lib/GruntFund"
    import { onMount } from "svelte"
    import { Timeline, TimelineEvent } from "svelte-ux"
    import { mdiAbacus, mdiArrowRight, mdiCheckCircle } from '@mdi/js'
  
    type Props = {
      gruntFund : GruntFund
      gruntAliasByAddress : Map<String, String>
    }

    let { gruntFund, gruntAliasByAddress } : Props = $props()
  
    let events : EventData[] = $state([])
  
    let gruntSymbol = $state('')
    onMount(async () => {
      events = (await gruntFund.events())
      gruntSymbol = await gruntFund.getSymbol()
    })
  
    const eventDetails = $derived(events.map((e) => {

        let icon = mdiAbacus
        let description = JSON.stringify(e.args)
        if (e.event == "Allocated") {
            icon = mdiCheckCircle
            const name = gruntAliasByAddress.get(e.args.recipient) ?? e.args.recipient
            description = `gave ${name} ${e.args.amount} ${gruntSymbol}\ndoc: ${e.args.documentHash}`
        } else if (e.event == "Transfer") {
            const from = gruntAliasByAddress.get(e.args.from) ?? e.args.from
            const to = gruntAliasByAddress.get(e.args.to) ?? e.args.to
            description = `Transfered ${e.args.amount} ${gruntSymbol} from ${from} to ${to}`
            icon = mdiArrowRight
        }

        return {
            date : `${e.timestamp.toLocaleDateString()} ${e.timestamp.toLocaleTimeString()}`,
            title : e.event,
            description,
            icon
        }
    }))
  
  </script>
  
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
  