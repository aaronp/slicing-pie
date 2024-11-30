<script lang="ts">

type Props = {
    label : string,
    address : string,
    amount : number,
    share : number
}

let { label, address, amount, share } : Props =  $props()
</script>

<div class="m-2">
    <span class="p-2">{label}:</span><span class="p-2">{amount} {Math.floor(share)}%</span>
  </div>