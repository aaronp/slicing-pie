<script lang="ts">
    import { TextField, Field, SelectField, MenuItem, cls} from "svelte-ux"
    import { mdiPlus } from '@mdi/js'
    import type { LabeledAmount } from "./settings"
        
    type Props = {
        categoies : LabeledAmount[]
        rates : LabeledAmount[]
        amount : number
    }


    let userAmount : number = $state(0)

    let { categoies, rates, amount = $bindable() } : Props = $props()

    let categoryOptions = $derived(categoies.map(c => {
        return {
            label : c.label,
            value : c.label
        }
    }))

    let firstCategory = $derived(categoies.length == 0 ? '' : categoies[0].label)
    let category = $state(categoies.length == 0 ? '' : categoies[0].label)

    let roles = $derived(rates.map(r => {
        return {
            label : r.label,
            value : r.amount
        }
    }))

    let timeMultiplier = $state(0)

    $effect(() => {
        const found = categoies.find(c => c.label == category)
        const multiplier = found?.amount ?? 1
        // console.log(`calculating w/ userAmount=${userAmount}, timeMultiplier=${timeMultiplier}, category=${category}, multiplier=${multiplier}`)
        if (category.toLowerCase() === firstCategory) {
            amount = timeMultiplier * userAmount
        } else {
            amount = multiplier * userAmount
        }
    })
    
</script>

<!--
Category 
md:grid-cols-[1fr auto 3fr]
-->
<div class={cls(category === firstCategory ? "grid grid-cols-[auto,1fr,1fr] gap-2 w-3/4 bg-green-100" : "grid grid-cols-[auto,1fr] gap-2 w-3/4")}>
    <div class="border">
        <Field label="Category" >
            <SelectField options={categoryOptions} bind:value={category} >
                <div slot="option" let:option let:index let:selected let:highlightIndex>
                    <MenuItem
                        scrollIntoView={index === highlightIndex} 
                        class={cls(
                            index === highlightIndex && "bg-surface-content/5",
                            option === selected && "font-semibold",
                            option.group ? "px-4" : "px-2",
                        )} >
                            <div class="grid grid-cols-1 items-center w-full">{option.label}</div>
                    </MenuItem>
                </div>
            </SelectField>
        </Field>
    </div>

    {#if category===firstCategory}
        <div class="border">
            <Field label="Role" >
                <SelectField options={roles} bind:value={timeMultiplier} >
                    <div slot="option" let:option let:index let:selected let:highlightIndex>
                        <MenuItem
                            scrollIntoView={index === highlightIndex} 
                            class={cls(
                                index === highlightIndex && "bg-surface-content/5",
                                option === selected && "font-semibold",
                                option.group ? "px-4" : "px-2",
                            )} >
                                <div class="grid grid-cols-1 items-center w-full">{option.label}</div>
                        </MenuItem>
                    </div>
                </SelectField>
            </Field>
        </div>
    {:else}
        <!-- <div class=""></div> -->
    {/if}


    <div class="border">
        <TextField bind:value={userAmount} label="Amount" />
    </div>
</div>