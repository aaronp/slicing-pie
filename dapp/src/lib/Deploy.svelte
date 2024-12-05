<script lang="ts">
    import { ethers } from "ethers";
    import contractData from "../../../artifacts/contracts/GruntFund.sol/GruntFund.json"

    import { type Settings, type MetaMask, splitMapping } from "$lib"
    import { Button, TextField } from "svelte-ux"

    type Props = {
        settings : Settings,
        account : MetaMask
    }

    let { settings, account} : Props = $props()

    const abi = contractData.abi
    const bytecode = contractData.bytecode


    let name = $state("foo")
    let symbol = $state("bar")
    let owner = $state("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")

    const onDeploy = () => {
        deployContract(name, symbol, owner)
    }
    // Function to deploy the contract
    async function deployContract(_name: string, _symbol: string, _owner: string) {
        
        try {
            const factory = new ethers.ContractFactory(abi, bytecode, account.signer)

            console.log("Deploying contract...")
            const contract = await factory.deploy(_name, _symbol, _owner)
            console.log("Deploy got ...", contract)
            

            const a = await contract.getAddress()
            console.log(`Contract deployed at: ${a}`)
            alert(`Contract deployed successfully at address: ${a}`)
        } catch (error) {
            console.error("Deployment failed:", error)
        }
    }
</script>


<TextField bind:value={name} />
<TextField bind:value={symbol} />
<TextField bind:value={owner} />
<Button onclick={() => onDeploy()} >Deploy</Button>

abi:
<pre>{JSON.stringify(abi, null, 2)}</pre>


bytecode:
<pre>{bytecode}</pre>