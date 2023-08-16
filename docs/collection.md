# Collection

Each collection on Eclipse.art is deployed on an own contract.
The deployer of the collection is assigned as the contract owner.

## Metadata url

The metadata url is the url pointing to the collections metadata. For more info see the [Metadata Standard](https://docs.opensea.io/docs/metadata-standards).

### Change url

To change the url for a collection the owner must call the `setBaseURI` function on the collection's contract and provide the url as an argument.

The url must be in form of: `https://my-url.com/`

Example Contract: [0x5e53e562d26e2f392715c51f7affe3e176cbfa66](https://etherscan.io/address/0x5e53e562d26e2f392715c51f7affe3e176cbfa66#writeContract)

## Custom Minter

Collections can use custom implemented Minter contracts to mint new tokens. In order do that the contract owner has to do the following steps:

1. Implement and deploy a custom Minter contract by using the [Eclipse Minter Interface](../contracts/interface/IEclipseMinter.sol).
2. Enable the new deployed Minter contract in collection's contract by calling the `setMinter` function which takes the minters contract address and a boolean whether it should be enabled.
