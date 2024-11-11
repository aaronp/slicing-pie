# Slicing Pie Grunt Fund

This project creates a grunt fund (see [slicingpie.com](https://slicingpie.com/)) for managing a start-up's dynamic equity.

That is, it tracks grunts' contribution into a start-up in order to ensure a fair equity split for founders.
(where a 'grunt' is anybody who's contributing to a project)

# The Contract
[The smart-contract](./contracts/GruntFund.sol) is an ERC20 smart contract written in solidity.

# User Interface
You can interact with the contract using a command-line interface:

```sh
make cli
```


## Setup

This project was set-up using [Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started#quick-start)
```sh
# Install Hardhat in your project
npm install --save-dev hardhat
# Create a new Hardhat project
npx hardhat
```