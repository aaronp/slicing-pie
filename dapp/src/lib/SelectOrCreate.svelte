<script lang="ts">
import { Field, SelectField, type MenuOption, MenuItem, cls} from "svelte-ux"
import { mdiPlus } from '@mdi/js'
    
type Props = {
    label: string,
    options: MenuOption[],
    value : string,
}

let { label, options, value = $bindable() } : Props = $props()

</script>

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
  </SelectField>
  </Field>