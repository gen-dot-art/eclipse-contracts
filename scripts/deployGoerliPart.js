// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function main() {
  // Contracts are deployed using the first signer/account by default
  const [owner] = await ethers.getSigners();

  const eclipseAddress = "0x963F27FBc71B453d883BE0978742a03f469b4dad";
  const collectionFactoryAddress = "0xa567567C3f0dbBab756853dBE97203082B9b4eab";
  const mintGatePublicAddress = "0xCF12A14A49DfAF0c1BF7C0bca57bDd806Af459E2";

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
  const EclipseMintGatePublic = await ethers.getContractFactory(
    "EclipseMintGatePublic"
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

  // const collectionFactory = await EclipseCollectionFactory.deploy("uri://");
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [collectionFactory.address]
  //     .concat(["uri://"].map((a) => `"${a}"`))
  //     .join(" ")
  // );
  // await collectionFactory.deployed();

  const mintGatePublic = EclipseMintGatePublic.attach(mintGatePublicAddress);
  // const mintAlloc = await EclipseMintGatePublic.deploy();
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

  const eclipse = Eclipse.attach(eclipseAddress);
  // const collectionFactory = EclipseCollectionFactory.attach(
  //   collectionFactoryAddress
  // );

  const minter = await EclipseMinter.deploy(eclipse.address);
  console.log(
    "yarn hardhat verify --network goerli",
    [minter.address]
      .concat([eclipse.address, mintGatePublic.address].map((a) => `"${a}"`))
      .join(" ")
  );
  await minter.deployed();

  // const implementation = await EclipseERC721.deploy();
  // console.log(
  //   "yarn hardhat verify --network goerli",
  //   [implementation.address].concat([].map((a) => `"${a}"`)).join(" ")
  // );
  // await implementation.deployed();

  await eclipse.addMinter(0, minter.address);
  // await collectionFactory.addErc721Implementation(0, implementation.address);
  // await collectionFactory.setAdminAccess(eclipse.address, true);
  await mintGatePublic.setAdminAccess(minter.address, true);
  // await paymentSplitterFactory.setAdminAccess(eclipse.address, true);
  await minter.setAdminAccess(eclipse.address, true);
  // await store.setAdminAccess(eclipse.address, true);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
