<script lang="ts">
    import { ethers } from "ethers";
    import contractData from "../../../artifacts/contracts/GruntFund.sol/GruntFund.json"

    import { type Settings, type MetaMask, splitMapping } from "$lib"
    import { Button, TextField } from "svelte-ux"

    type Props = {
        settings : Settings,
        account : MetaMask
    }

    let { account} : Props = $props()

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


<TextField class="m-2 w-1/2" label="Fund Name:" bind:value={name} />
<TextField class="m-2 w-1/2" label="Symbol:" bind:value={symbol} />
<TextField class="m-2 w-1/2" label="Owner Address:" bind:value={owner} />
<Button variant="fill" color="primary" class="m-2" onclick={() => onDeploy()} >Deploy</Button>
