<script lang="ts">
  import { type Settings, splitMapping } from "$lib"
  import { GruntFund } from "$lib/GruntFund"
  import { TextField, SelectField, MenuItem, Field, Button, cls } from "svelte-ux"

  type Props = {
    settings : Settings,
    gruntFund : GruntFund,
    fundAddress : string
  }

  let { settings, gruntFund, fundAddress } : Props = $props()

  let gruntOptions = $derived(splitMapping(settings.grunts).map(g => ({ label: g.label, value: g.address })))
  let selectedGrunt : string = $state('')

  let message = $state('')
  let amount = $state(0)
  let canMint = $derived(amount > 0 && message.length == 0 && selectedGrunt.length > 0)

  let documentHash = $state('hash')

  let fundName = $derived(splitMapping(settings.funds).find(f => f.address === fundAddress)?.label || '???')

  const onMint = async () => {
        try {
            const addreses = await gruntFund?.mint(selectedGrunt, amount, documentHash)
            alert(JSON.stringify(addreses))
        } catch(e) {
            message = `${e}`
        }
    }

</script>

<div class="bg-gray-200 m-2 p-2" ><div class="font-bold">{fundName}</div><div class="text-sm text-opacity-50 text-blue-700">({fundAddress})</div></div>

<div class="grid-cols-1 gap-2 w-1/3 bg-opacity-50 text-opacity-75">
    <div class="m-2">
        <Field label="Grunt:" >
            <SelectField options={gruntOptions} bind:value={selectedGrunt}>
                <svelte:fragment
                slot="option"
                let:option
                let:index
                let:selected
                let:highlightIndex
            >
                <MenuItem
                class={cls(
                    index === highlightIndex && "bg-surface-content/5",
                    option === selected && "font-semibold",
                    option.group ? "px-4" : "px-2",
                )}
                scrollIntoView={index === highlightIndex}
                disabled={option.disabled}
                >
                <div>
                    <div>{option.label}</div>
                    <div class="text-xs text-surface-content/50">{option.value}</div>
                </div>
                </MenuItem>
            </svelte:fragment>
            </SelectField>
        </Field>
    </div>

    <div class="m-2">
        <TextField label="Amount" type="integer" labelPlacement="float" placeholder="Fund Amount" bind:value={amount} >
            <div slot="suffix" class="text-xs text-surface-content/50">coins</div>
        </TextField>
    </div>
    <div class="m-2">
        <Button  variant="fill" color="primary" onclick={onMint}>Mint</Button>
    </div>
</div>