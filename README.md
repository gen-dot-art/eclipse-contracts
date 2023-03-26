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

### EclipseMinterFixedPrice

Contract that allows members to mint tokens by a fixed price from cloned ERC721 contracts.

## Eclipse

Allows admin to create clone contracts via `EclipseCollectionFactory` and `EclipsePaymentSplitterFactory`.

## Deployed Contracts

| Name                          | mainnet | goerli                                                                                                                       |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Eclipse                       | [-]()   | [0xd69559Cd515Be1797Cd79883B4Dc435B8fc06bfb](https://goerli.etherscan.io/address/0xd69559Cd515Be1797Cd79883B4Dc435B8fc06bfb) |
| EclipseStorage                | [-]()   | [0x31f9B928983373eA18696421046e36dC666d16e5](https://goerli.etherscan.io/address/0x31f9B928983373eA18696421046e36dC666d16e5) |
| EclipseCollectionFactory      | [-]()   | [0xa567567C3f0dbBab756853dBE97203082B9b4eab](https://goerli.etherscan.io/address/0xa567567C3f0dbBab756853dBE97203082B9b4eab) |
| EclipsePaymentSplitterFactory | [-]()   | [0x37b89b6404F2C77Ed802BA63452Ebdf4e8D5703A](https://goerli.etherscan.io/address/0x37b89b6404F2C77Ed802BA63452Ebdf4e8D5703A) |
| EclipseERC721                 | [-]()   | [0xae9C542a1AfbEa57f9A33170244E3b44d495a335](https://goerli.etherscan.io/address/0xae9C542a1AfbEa57f9A33170244E3b44d495a335) |
| EclipsePaymentSplitter        | [-]()   | [0x99b279583029e51B32ABe72bCc5f374B31440995](https://goerli.etherscan.io/address/0x99b279583029e51B32ABe72bCc5f374B31440995) |
| EclipseMintGatePublic         | [-]()   | [0x0CFF430025A03D148574d64781D1fa11525DBEE1](https://goerli.etherscan.io/address/0x0CFF430025A03D148574d64781D1fa11525DBEE1) |
| EclipseMintGateERC721         | [-]()   | [0x8aA4F14461Efea4e12631e3eB618A583839b7C87](https://goerli.etherscan.io/address/0x8aA4F14461Efea4e12631e3eB618A583839b7C87) |
| EclipseMinterFixedPrice       | [-]()   | [0x62Fb59F357180884958CC5aA3A11DE0C0c21dBf1](https://goerli.etherscan.io/address/0x62Fb59F357180884958CC5aA3A11DE0C0c21dBf1) |
| EclipseMinterDutchAuction     | [-]()   | [0x59ebA181164412F4c97B7ea77Cef3d12D3Ac28f9](https://goerli.etherscan.io/address/0x59ebA181164412F4c97B7ea77Cef3d12D3Ac28f9) |
| EclipseMinterFree             | [-]()   | [0x7C8cd067fDb8167CF3a14a8df34bb135D2BA1DA8](https://goerli.etherscan.io/address/0x7C8cd067fDb8167CF3a14a8df34bb135D2BA1DA8) |
| EclipseMinterAirdrop          | [-]()   | [0x71417909671459C5680E4fB04Ab6b3ba7EFf1b55](https://goerli.etherscan.io/address/0x71417909671459C5680E4fB04Ab6b3ba7EFf1b55) |
