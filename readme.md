# Slicing Pie Grunt Fund

This project creates a grunt fund (see [slicingpie.com](https://slicingpie.com/)) for managing a start-up's dynamic equity.

That is, it tracks grunts' contribution into a start-up in order to ensure a fair equity split for founders.
(where a 'grunt' is anybody who's contributing to a project)

# The Contracts
There is an [ERC-777 smart-contract](./contracts/GruntFund.sol) which can mint tokens with data (the hash of a signed document representing a reference to why the funds are being minted).

These contracts also maintain a whitelist for which accounts are allowed to mint tokens.

Beyond these 'grunt fund' contracts, there is also [an orcheestration contract](./contracts/KindFund.sol).

The idea is that there is a holding-company 'Grunt Fund' which shares resources (and thus earns equity) in incubator child Grunt Funds.

The Kind Fund exposes a `mint` function which will correctly mint tokens into the holding company fund, and the holding company fund will in turn get tokens in the child fund.

# Command-line User Interface

You can interact with the contract using a command-line interface:

```sh
make cli
```

However, to interact with your account in this way requires access to the private key in a settings config.

A perhaps better way is to just use a web client and integrate in the browser

# Building / Deploying

The contract is deployed locally using [Ignition](https://hardhat.org/ignition/docs/guides/deploy) as triggered by `make deploy` (which also runs the tests):

![./docs/deployment.png](./docs/deployment.png)
