<script lang="ts">
import { Field, Toggle, Dialog, TextField, SelectField, Button, Form, type MenuOption, MenuItem, cls} from "svelte-ux"
import { mdiPlus } from '@mdi/js'
    
type Props = {
    label: string,
    options: MenuOption[],
    value : string,
    // onCreate: (option: MenuOption) => void
}

let { label, options, value = $bindable() } : Props = $props()

const newOption: () => MenuOption = () => {
    return { label: '', value: null }
}
const onCreateNewOption =  (newOption : MenuOption) => {
    console.log(`onCreate ${JSON.stringify(newOption)}`)
    // try {
    //     onCreate(newOption)
    //     return true
    // } catch (e) {
    //     console.error(`on create threw ${e}`)
    // }
}
</script>

<Toggle let:on={open} let:toggle let:toggleOff>
    <Field {label} >
    <SelectField {options} bind:value={value} >
        <div slot="option" let:option let:index let:selected let:highlightIndex>
            <MenuItem
              class={cls(
                index === highlightIndex && "bg-surface-content/5",
                option === selected && "font-semibold",
                option.group ? "px-4" : "px-2",
              )}
              scrollIntoView={index === highlightIndex}
            >
              <div class="grid grid-cols-[1fr,auto] items-center w-full">
                <div>
                  <div>{option.label}</div>
                  <div class="text-sm text-surface-content/50">{option.value}</div>
                </div>
              </div>
              </MenuItem>
              </div>
<!-- <span slot="append" on:click|stopPropagation role="none">
    <Button
      icon={mdiPlus}
      class="text-surface-content/50 p-2"
      on:click={toggle}
    />
  </span> -->
    </SelectField>
    </Field>
    <!--
    <Form
      initial={newOption()}
      on:change={(e) => {
        options = [e.detail, ...options];
      }}
      let:draft
      let:commit
      let:revert
    >
      <Dialog {open} on:close={toggleOff}>
        <div slot="title">Create new option</div>
        <div class="px-6 py-3 w-96 grid gap-2">
          <TextField
            label="Label"
            value={draft.label}
            on:change={(e) => {
              draft.label = e.detail.value
            }}
            autofocus
          />
          <TextField
            label="Value"
            value={draft.value}
            on:change={(e) => {
              draft.value = e.detail.value
            }}
          />
        </div>
        <div slot="actions">
          <Button on:click={() => onCreateNewOption(draft) && commit()} color="primary">Add option</Button>
          <Button on:click={() => revert()}>Cancel</Button>
        </div>
      </Dialog>
    </Form>
    -->
  </Toggle>