<script lang="ts">
    import { Icon, TextField, Field, SelectField, MenuItem, cls} from "svelte-ux"
    import { mdiCurrencyUsd, mdiCurrencyGbp, mdiCurrencySign, mdiClock, mdiFinance, mdiAccount, mdiCar, mdiTrain, mdiPercent, mdiSecurity, mdiOfficeBuilding } from '@mdi/js'
    import type { LabeledAmount } from "./settings"
        
    type Props = {
        categoies : LabeledAmount[]
        rates : LabeledAmount[]
        // category : number,
        // amount : number,
        category : string,
        role : string | null,
        amount : number,
        pie : number,
        multiplier : number
    }


    let userAmount : number = $state(0)

    let { categoies, rates, role = $bindable(), category = $bindable(), amount = $bindable(), pie = $bindable(), multiplier = $bindable() } : Props = $props()

    let categoryOptions = $derived(categoies.map(c => {
        return {
            label : c.label,
            value : c.label
        }
    }))

    let firstCategory = $derived(categoies.length == 0 ? '' : categoies[0].label)
    let chosenCategory = $state(categoies.length == 0 ? '' : categoies[0].label)

    let roles = $derived(rates.map(r => {
        return {
            label : r.label,
            value : r.label
        }
    }))

    // the amount icon
    let symbol = $state('')
    let amountLabel = $state("Amount")
    
    let chosenRole = $state('')

    $effect(() => {
        category = chosenCategory
        role = chosenRole
        amount = userAmount
        
        
        if (chosenCategory === firstCategory) {
            multiplier = rates.find(r => r.label === chosenRole)?.amount ?? 0
        } else {
            const found = categoies.find(c => c.label == chosenCategory)
            multiplier = found?.amount ?? 1
        }

        pie = multiplier * userAmount

        // TODO - map symbols in settings
        switch (chosenCategory) {
            case 'Time' : {
                symbol = mdiClock
                amountLabel = "Days"
                break;
            }
            case 'Cash' : {
                symbol = mdiCurrencyGbp
                amountLabel = "GBP"
                break;
            }
            case 'Debt Guarantee' : {
                symbol = mdiFinance
                amountLabel = "Loan Amount Guaranteed"
                break;
            }
            case 'Assets' : {
                symbol = mdiOfficeBuilding
                amountLabel = "Asset Value"
                break;
            }
            case 'Expenses' : {
                symbol = mdiTrain
                amountLabel = "Cost"
                break;
            }
            case 'Sales Commission' : {
                symbol = mdiPercent
                amountLabel = "Commission Amount"
                break;
            }
            default : {
                symbol =  mdiCurrencySign
                break;
            }
        }
    })
    
</script>


<!-- <div class={cls(chosenCategory === firstCategory ? "grid grid-cols-[auto,1fr,1fr] gap-2 w-3/4" : "grid grid-cols-[auto,1fr] gap-2 w-3/4")}> -->
<div >
    <div class="pt-0">
        <Field label="Category" >
            <SelectField options={categoryOptions} bind:value={chosenCategory} >
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

    {#if chosenCategory===firstCategory}
        <div class="pt-2">
            <Field label="Role" >
                <SelectField options={roles} bind:value={chosenRole} >
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
    {/if}

    <div class="pt-2">
        <TextField classes={{
            input: "h-8 text-4xl mb-1",
          }} bind:value={userAmount} label={amountLabel} >
            
            <div slot="prefix">
                {#if symbol}
                    <Icon
                    data={symbol}
                    size="1.8em"
                    class="text-surface-content/50 -mt-1 mr-2"
                    />
                {/if}
              </div>
        </TextField>
    </div>
</div>