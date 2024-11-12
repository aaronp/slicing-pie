# Resources

These are from running the workshop on creating dapp w/ firefly, e.g.

`ff init workshop 2 -t erc20_erc721 --prompt-names`
`ff start workshop`


 * [Firefly workshop guide](https://gist.github.com/nguyer/a5ea1cc1181de58ffb0d693d5ca50fb9) from ["How to Build a Web3 App"](https://www.youtube.com/watch?v=BWiwvIdODns)

 * [MetaMask integration](https://hyperledger.github.io/firefly/latest/tutorials/tokens/erc721/#use-metamask)


 ## Notes

  Use `ff help` or `ff init --help` to [see init options](https://youtu.be/BWiwvIdODns?t=955)


## Token Connectors for bridging FF and custom contracts
 * A ["Tokens Connector"](https://youtu.be/BWiwvIdODns?t=1473) sits between firefly core and the blockchain node itself and knows about the contracts it's working with ... There's a reference impl for ERC20-ERC721 (see [here](git@github.com:hyperledger/firefly-tokens-erc20-erc721.git))


 ## Deployments
 [Deploying contracts ](https://youtu.be/BWiwvIdODns?t=1817) and [hardhat.config.ts](https://youtu.be/BWiwvIdODns?t=1920) to use the local hardhat deploy

Use `npx hardhat run scripts/deploy.ts` to deploy


## Simplified Roadmap:

Phase 1:
 1. swap out ERC20 w/ our custom GruntFund
    a. change the GF to take an owner address (e.g. the FF org address)
       the 'addAdmin' will still work
 2. test the swagger UI against the GruntFund. Do all the endpoitns work?

Phase 2: build out the dapp and/or CLI
 1. update our dapp to generate client stubs
 2. write and test the app, visualising on-chain

Phase 3: deploy
 1. What option is there for spinning up a super-node?
    a. w/ my local FF stack, but pointing at geth or production
    b. in the cloud via Kaleido (https://docs.kaleido.io/using-kaleido/quick-start-firefly/first-firefly/?utm_source=chatgpt.com)
       looks like it'd be $25  / week (0.15 per node per hour!)
       https://www.kaleido.io/pricing?utm_feeditemid=&utm_device=c&utm_term=digital%20asset%20platform&utm_source=google&utm_medium=cpc&utm_campaign=Asset+Tokenization+%26+Management+-+New&hsa_cam=21489657039&hsa_grp=170777730208&hsa_mt=b&hsa_src=g&hsa_ad=706579137255&hsa_acc=4239638370&hsa_net=adwords&hsa_kw=digital%20asset%20platform&hsa_tgt=kwd-411434348327&hsa_ver=3&gad_source=1&gclid=CjwKCAiA3ZC6BhBaEiwAeqfvykhUoM6d8940O_qYvDnAx2XP6t1-3NXh1AMafV_JsHF-EPj9U7EMzRoC1QoQAvD_BwE 
 