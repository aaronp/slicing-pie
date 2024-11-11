<script lang="ts">
    import { Button, Modal } from 'svelteux';
    let showModal = false;
</script>

<Button on:click={() => (showModal = true)}>Open Modal</Button>

{#if showModal}
<Modal on:close={() => (showModal = false)}>
    <h1>Hello from SvelteUX Modal!</h1>
    <Button on:click={() => (showModal = false)}>Close</Button>
</Modal>
{/if}
