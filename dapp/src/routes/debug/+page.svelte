<script lang="ts">
    import type { MetaMask } from "$lib";


    import HasAccount from "$lib/HasAccount.svelte";

    let account : MetaMask | null = $state(null) //bindable()
</script>


<div class="self-start m-2 text-white">
    <!-- <HasAccount {account}  {message}>
        <span class="p-2 text-xs">{account.signerName} ({acco.signerAddress})</span>
    </HasAccount> -->
</div>