// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { time } = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {
  // Contracts are deployed using the first signer/account by default
  const [artistAccount] = await ethers.getSigners();
  const eclipseAddress = "0xCaC81119Ae5Ee882cd0f8a011280Cfc1aDD2e540";
  const eclipseStoreAddress = "0x2FdF74841021C051095BB11E0620Cfc416A8EB49";
  const Eclipse = await ethers.getContractFactory("Eclipse");

  const eclipse = Eclipse.attach(eclipseAddress);
  const name = "Eclipse Genesis";
  const symbol = "ECL";
  const erc721Index = 0;
  const pricingMode = 0;
  const maxSupply = 100;
  const startTime = (await time.latest()) + 60 * 5;
  const price = BigNumber.from(10).pow(16);

  const pricingData = ethers.utils.defaultAbiCoder.encode(
    [
      {
        components: [
          {
            internalType: "address",
            name: "artist",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "allowedPerTransaction",
            type: "uint8",
          },
        ],
        name: "params",
        type: "tuple",
        internalType: "FixedPriceParams",
      },
    ],
    [
      {
        artist: artistAccount.address,
        startTime,
        price: price,
        allowedPerTransaction: 5,
      },
    ]
  );

  const calldata = eclipse.interface.encodeFunctionData("createCollection", [
    {
      artist: artistAccount.address,
      name: name,
      symbol: symbol,
      script: "test",
      collectionType: 0,
      maxSupply: maxSupply,
      erc721Index: erc721Index,
      pricingMode: [pricingMode],
      pricingData: [pricingData],
      payeesMint: [artistAccount.address],
      payeesRoyalties: [artistAccount.address],
      sharesMint: [500],
      sharesRoyalties: [500],
    },
  ]);

  await artistAccount.sendTransaction({
    to: eclipse.address,
    data: calldata,
  });

  // const EclipseStore = await ethers.getContractFactory("EclipseStore");
  // const store = EclipseStore.attach(eclipseStoreAddress)
  // const artist = await store.getArtist(artistAccount.address);
  // const info = await eclipse.getCollectionInfo(artist.collections[0]);
  // const EclipseErc721 = await ethers.getContractFactory("EclipseERC721");
  // const collection = await EclipseErc721.attach(
  //   info.collection.contractAddress
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
