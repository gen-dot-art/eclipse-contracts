# Eclipse Smart contracts

Eclipse contracts support the onchain deployment of `ERC721` contract implementations to provide onchain generative art.

The central entry point for deploying contracts is the `Eclipse` contract.

## EclipsePaymentSplitter

Allows admin to clone instances of `EclipsePaymentSplitter` which are assigned to artists.
They hold payout address and shares for royalty payouts and handle the splitting. For each artist one PaymentSplitter is deployed.

## EclipseCollectionFactory

Allows admin to clone ERC721 implementations and assign a minter to it. An arbitrary amount implementations and minters can be added to the factory and chosen from on cloning.

- `function addErc721Implementation(uint8 index, address implementation)`
- `function addMinter(uint8 index, address minter)`

## Minter

Minters are the only signers how are allowed to mint tokens on cloned ERC721 contracts. They handle permission checking, updating the mint allocation state and can provide various mint mechanics. A collection may be assigned to multiple minters.

### EclipseMinter

Contract that allows members to mint tokens by a fixed price from cloned ERC721 contracts.

## Eclipse

Allows admin to create clone contracts via `EclipseCollectionFactory` and `EclipsePaymentSplitterFactory`.

## Deployed Contracts

| Name                          | mainnet | goerli                                                                                                                       |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Eclipse                       | [-]()   | [0x963F27FBc71B453d883BE0978742a03f469b4dad](https://goerli.etherscan.io/address/0x963F27FBc71B453d883BE0978742a03f469b4dad) |
| EclipseStorage                | [-]()   | [0x31f9B928983373eA18696421046e36dC666d16e5](https://goerli.etherscan.io/address/0x31f9B928983373eA18696421046e36dC666d16e5) |
| EclipseCollectionFactory      | [-]()   | [0xa567567C3f0dbBab756853dBE97203082B9b4eab](https://goerli.etherscan.io/address/0xa567567C3f0dbBab756853dBE97203082B9b4eab) |
| EclipsePaymentSplitterFactory | [-]()   | [0x1607858335b393C82c1A751DD0f1D1e0f707dC8c](https://goerli.etherscan.io/address/0x1607858335b393C82c1A751DD0f1D1e0f707dC8c) |
| EclipseERC721                 | [-]()   | [0x462EA76f7ae1c3D3CA59389747443267e9D206A5](https://goerli.etherscan.io/address/0x462EA76f7ae1c3D3CA59389747443267e9D206A5) |
| EclipsePaymentSplitter        | [-]()   | [0x4538FA3C2dc6253AAe286c613DfF18280D454Faa](https://goerli.etherscan.io/address/0x4538FA3C2dc6253AAe286c613DfF18280D454Faa) |
| EclipseMintGatePublic         | [-]()   | [0xCF12A14A49DfAF0c1BF7C0bca57bDd806Af459E2](https://goerli.etherscan.io/address/0xCF12A14A49DfAF0c1BF7C0bca57bDd806Af459E2) |
| EclipseMinter                 | [-]()   | [0x71eee101A00b6515fd888B1Fe9aD334873f910A7](https://goerli.etherscan.io/address/0x71eee101A00b6515fd888B1Fe9aD334873f910A7) |
