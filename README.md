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

## Deployed Contracts Production

| Name                           | ethereum                                                                                                              | goerli                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Eclipse                        | [0x71AA097B3B9dab88a4b755dAF6bb581Ca0aeD4CA](https://etherscan.io/address/0x71AA097B3B9dab88a4b755dAF6bb581Ca0aeD4CA) | [0x072D7Fe49C12a4FB9f8CF80827DB2D2ADEE87767](https://goerli.etherscan.io/address/0x072D7Fe49C12a4FB9f8CF80827DB2D2ADEE87767) |
| EclipseStorage                 | [0xfccb82B0228EA6a3932bd3b6A7D75a27D397edCE](https://etherscan.io/address/0xfccb82B0228EA6a3932bd3b6A7D75a27D397edCE) | [0x782F88888463a3Fa62bC608ca713C64104249b9f](https://goerli.etherscan.io/address/0x782F88888463a3Fa62bC608ca713C64104249b9f) |
| EclipseCollectionFactory       | [0x5c1d1D6f27588159407E546B2D7D9034AeBf37d4](https://etherscan.io/address/0x5c1d1D6f27588159407E546B2D7D9034AeBf37d4) | [0x3A2Ba3be9aCD856a3FDe19E35f2E23665C67605B](https://goerli.etherscan.io/address/0x3A2Ba3be9aCD856a3FDe19E35f2E23665C67605B) |
| EclipsePaymentSplitterFactory  | [0x32388eaEe64a224Ee3ea3c9da483BF390EC1ba93](https://etherscan.io/address/0x32388eaEe64a224Ee3ea3c9da483BF390EC1ba93) | [0x6d5Be445B9042bB622BA522e2b3817E3b6cBb47a](https://goerli.etherscan.io/address/0x6d5Be445B9042bB622BA522e2b3817E3b6cBb47a) |
| EclipseERC721                  | [0x83473a0A1a9a08506e2952D96730AaC0f39b8c9A](https://etherscan.io/address/0x83473a0A1a9a08506e2952D96730AaC0f39b8c9A) | [0x9A6b8f379B706C8350C4f82a527ec3217C27b869](https://goerli.etherscan.io/address/0x9A6b8f379B706C8350C4f82a527ec3217C27b869) |
| EclipsePaymentSplitter (12.5%) | [0x75808de233a660B6486a4BA4aC8a2290f9fD5d35](https://etherscan.io/address/0x75808de233a660b6486a4ba4ac8a2290f9fd5d35) | [0x3720f5108Abe3a379282696f6B782C10D5F9F892](https://goerli.etherscan.io/address/0x3720f5108Abe3a379282696f6B782C10D5F9F892) |
| EclipsePaymentSplitter (7.5%)  | [0x48cE90f944Cb357eE9F9A0eAcb308C696Cd6b21B](https://etherscan.io/address/0x48cE90f944Cb357eE9F9A0eAcb308C696Cd6b21B) | [0x3720f5108Abe3a379282696f6B782C10D5F9F892](https://goerli.etherscan.io/address/0x3720f5108Abe3a379282696f6B782C10D5F9F892) |
| EclipseMintGatePublic          | [0x55457f9383352680B69788C4c10d3Ca0Dc8d3bE4](https://etherscan.io/address/0x55457f9383352680B69788C4c10d3Ca0Dc8d3bE4) | [0xb0490bb81631A4EA287bea3F48443776b523975E](https://goerli.etherscan.io/address/0xb0490bb81631A4EA287bea3F48443776b523975E) |
| EclipseMintGateERC721          | [0xA471d6a9547ca00E108bB9e75B7490A81bD5004c](https://etherscan.io/address/0xA471d6a9547ca00E108bB9e75B7490A81bD5004c) | [0x8187AFF484eB5b1D3DFA4466149e706c9201eE29](https://goerli.etherscan.io/address/0x8187AFF484eB5b1D3DFA4466149e706c9201eE29) |
| EclipseMinterFixedPrice        | [0x2eF16CE70B35Ca69Ef618c3DE847EF76E666e555](https://etherscan.io/address/0x2eF16CE70B35Ca69Ef618c3DE847EF76E666e555) | [0xe447cec4f649E302C063b850dc134a868da196fb](https://goerli.etherscan.io/address/0xe447cec4f649E302C063b850dc134a868da196fb) |
| EclipseMinterDutchAuction      | [0x3549Bd450c4D118f5030B9c51C8A40a8807dF3A5](https://etherscan.io/address/0x3549Bd450c4D118f5030B9c51C8A40a8807dF3A5) | [0x3306E0424517E63B4D44F780a2794695bBFc4a68](https://goerli.etherscan.io/address/0x3306E0424517E63B4D44F780a2794695bBFc4a68) |
| EclipseMinterFree              | [0x3E28E8D80D4d76CD22Fe1FB83c64DA032c76bf15](https://etherscan.io/address/0x3E28E8D80D4d76CD22Fe1FB83c64DA032c76bf15) | [0x932eaf75e8DEeAa0e994548FA35A48F1Ab4E78F9](https://goerli.etherscan.io/address/0x932eaf75e8DEeAa0e994548FA35A48F1Ab4E78F9) |
| EclipseMinterAirdrop           | [-]()                                                                                                                 | [0x011aFaBfB8E630Ba1a46D070A9A8693d62F13731](https://goerli.etherscan.io/address/0x011aFaBfB8E630Ba1a46D070A9A8693d62F13731) |

## Deployed Contracts Test

| Name                          | ethereum | goerli                                                                                                                       |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Eclipse                       | [-]()    | [0x290fd1652A0B5A21721cfb0A3Fa1F6d02d1bFB3C](https://goerli.etherscan.io/address/0x290fd1652A0B5A21721cfb0A3Fa1F6d02d1bFB3C) |
| EclipseStorage                | [-]()    | [0x7C595C9D2cD2FC52e989DEBEA89C89c262AEfE3d](https://goerli.etherscan.io/address/0x7C595C9D2cD2FC52e989DEBEA89C89c262AEfE3d) |
| EclipseCollectionFactory      | [-]()    | [0xeFeC2cd927d3539164C4763788F5d0FEe165caaF](https://goerli.etherscan.io/address/0xeFeC2cd927d3539164C4763788F5d0FEe165caaF) |
| EclipsePaymentSplitterFactory | [-]()    | [0x74A75b76988b2bA5B8E92A34796b780802DF7815](https://goerli.etherscan.io/address/0x74A75b76988b2bA5B8E92A34796b780802DF7815) |
| EclipseERC721                 | [-]()    | [0x9A6b8f379B706C8350C4f82a527ec3217C27b869](https://goerli.etherscan.io/address/0x9A6b8f379B706C8350C4f82a527ec3217C27b869) |
| EclipsePaymentSplitter        | [-]()    | [0xdB0fc195B1B8Abb304780D530D86C2D04D9eaC83](https://goerli.etherscan.io/address/0xdB0fc195B1B8Abb304780D530D86C2D04D9eaC83) |
| EclipseMintGatePublic         | [-]()    | [0x4D038c187201c1D54677ba8F6aa91A697a6D1293](https://goerli.etherscan.io/address/0x4D038c187201c1D54677ba8F6aa91A697a6D1293) |
| EclipseMintGateERC721         | [-]()    | [0x26Fd2faB260fa452675483F7cb65FA3411baf1Df](https://goerli.etherscan.io/address/0x26Fd2faB260fa452675483F7cb65FA3411baf1Df) |
| EclipseMinterFixedPrice       | [-]()    | [0x395921E93Be76f73bA2A2799b36a3e8df602aa5f](https://goerli.etherscan.io/address/0x395921E93Be76f73bA2A2799b36a3e8df602aa5f) |
| EclipseMinterDutchAuction     | [-]()    | [0x8E9f60465EF3bC9cb5dA53ea756d621F85C60AD9](https://goerli.etherscan.io/address/0x8E9f60465EF3bC9cb5dA53ea756d621F85C60AD9) |
| EclipseMinterFree             | [-]()    | [0x0e93252BAb3B73E57eDad721617C20Dc34751C89](https://goerli.etherscan.io/address/0x0e93252BAb3B73E57eDad721617C20Dc34751C89) |
| EclipseMinterAirdrop          | [-]()    | [0xBAAd96fb04A3Fd4A40349D17c6f0FFcC7dC536Da](https://goerli.etherscan.io/address/0xBAAd96fb04A3Fd4A40349D17c6f0FFcC7dC536Da) |
