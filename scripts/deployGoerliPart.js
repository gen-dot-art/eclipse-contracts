// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function main() {
  // Contracts are deployed using the first signer/account by default
  const [owner] = await ethers.getSigners();

  const EclipseMinter = await ethers.getContractFactory("EclipseMinter");

  // const EclipseProxy = await ethers.getContractFactory('EclipseProxy');
  const EclipseERC721 = await ethers.getContractFactory("EclipseERC721");
  const EclipsePaymentSplitterFactory = await ethers.getContractFactory(
    "EclipsePaymentSplitterFactory"
  );
  const EclipsePaymentSplitter = await ethers.getContractFactory(
    "EclipsePaymentSplitter"
  );
  const EclipseCollectionFactory = await ethers.getContractFactory(
    "EclipseCollectionFactory"
  );
  const EclipseMintAllocator = await ethers.getContractFactory(
    "EclipseMintAllocator"
  );
  const Eclipse = await ethers.getContractFactory("Eclipse");

  const EclipseStorage = await ethers.getContractFactory("EclipseStorage");

  // const paymentSplitter = await EclipsePaymentSplitter.deploy();
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [paymentSplitter.address].concat([].map((a) => `"${a}"`)).join(" ")
  // );
  // await paymentSplitter.deployed();

  // const store = await EclipseStorage.deploy();
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [store.address].concat([].map((a) => `"${a}"`)).join(" ")
  // );
  // await store.deployed();

  // const paymentSplitterFactory = await EclipsePaymentSplitterFactory.deploy(
  //   paymentSplitter.address
  // );
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [paymentSplitterFactory.address]
  //     .concat([paymentSplitter.address].map((a) => `"${a}"`))
  //     .join(" ")
  // );
  // await paymentSplitterFactory.deployed();

  const collectionFactory = await EclipseCollectionFactory.deploy("uri://");
  console.log(
    "yarn hardhat verify --network goerli",
    [collectionFactory.address]
      .concat(["uri://"].map((a) => `"${a}"`))
      .join(" ")
  );
  await collectionFactory.deployed();

  // const mintAlloc = await EclipseMintAllocator.deploy();
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [mintAlloc.address].concat([].map((a) => `"${a}"`)).join(" ")
  // );
  // await mintAlloc.deployed();

  // const eclipseArgs = [
  //   collectionFactory.address,
  //   paymentSplitterFactory.address,
  //   store.address,
  //   owner.address,
  // ];
  // const eclipse = await Eclipse.deploy(...eclipseArgs);
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [eclipse.address].concat([...eclipseArgs].map((a) => `"${a}"`)).join(" ")
  // );
  // await eclipse.deployed();

  // const minter = await EclipseMinter.deploy(eclipse.address, mintAlloc.address);
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [minter.address]
  //     .concat([eclipse.address, mintAlloc.address].map((a) => `"${a}"`))
  //     .join(" ")
  // );
  // await minter.deployed();

  // const implementation = await EclipseERC721.deploy();
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [implementation.address].concat([].map((a) => `"${a}"`)).join(" ")
  // );
  // await implementation.deployed();

  // await eclipse.addMinter(0, minter.address);
  // await collectionFactory.addErc721Implementation(0, implementation.address);
  await collectionFactory.addErc721Implementation(
    0,
    "0xfCD6f325e546F65fB2572Fa064A761A1f61BaA2F"
  );
  await collectionFactory.setAdminAccess(
    "0xe6E29776931EaAeb64305b908C048BD89E762301",
    true
  );
  // await mintAlloc.setAdminAccess(minter.address, true);
  // await paymentSplitterFactory.setAdminAccess(eclipse.address, true);
  // await minter.setAdminAccess(eclipse.address, true);
  // await store.setAdminAccess(eclipse.address, true);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
