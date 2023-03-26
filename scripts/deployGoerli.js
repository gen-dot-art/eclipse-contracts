// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function main() {
  // Contracts are deployed using the first signer/account by default
  const [owner] = await ethers.getSigners();
  const URI = "https://test-api.eclipse.art/search/metadata/";
  const EclipseMinterFixedPrice = await ethers.getContractFactory(
    "EclipseMinterFixedPrice"
  );
  const EclipseMinterDutchAuction = await ethers.getContractFactory(
    "EclipseMinterDutchAuction"
  );
  const EclipseMinterFree = await ethers.getContractFactory(
    "EclipseMinterFree"
  );
  const EclipseMinterAirdrop = await ethers.getContractFactory(
    "EclipseMinterAirdrop"
  );

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
  const EclipseMintGateERC721 = await ethers.getContractFactory(
    "EclipseMintGateERC721"
  );
  const Eclipse = await ethers.getContractFactory("Eclipse");

  const EclipseStorage = await ethers.getContractFactory("EclipseStorage");

  const paymentSplitter = await EclipsePaymentSplitter.deploy();
  console.log(
    "yarn hardhat verify --network goerli",
    [paymentSplitter.address].concat([].map((a) => `"${a}"`)).join(" ")
  );
  await paymentSplitter.deployed();

  const store = await EclipseStorage.deploy();
  console.log(
    "yarn hardhat verify --network goerli",
    [store.address].concat([].map((a) => `"${a}"`)).join(" ")
  );
  await store.deployed();

  const paymentSplitterFactory = await EclipsePaymentSplitterFactory.deploy(
    paymentSplitter.address
  );
  console.log(
    "yarn hardhat verify --network goerli",
    [paymentSplitterFactory.address]
      .concat([paymentSplitter.address].map((a) => `"${a}"`))
      .join(" ")
  );
  await paymentSplitterFactory.deployed();

  const collectionFactory = await EclipseCollectionFactory.deploy(URI);
  console.log(
    "yarn hardhat verify --network goerli",
    [collectionFactory.address].concat([URI].map((a) => `"${a}"`)).join(" ")
  );
  await collectionFactory.deployed();

  const mintGatePublic = await EclipseMintGatePublic.deploy();
  console.log(
    "yarn hardhat verify --network goerli",
    [mintGatePublic.address].concat([].map((a) => `"${a}"`)).join(" ")
  );
  await mintGatePublic.deployed();

  const mintGateErc721 = await EclipseMintGateERC721.deploy();
  console.log(
    "yarn hardhat verify --network goerli",
    [mintGateErc721.address].concat([].map((a) => `"${a}"`)).join(" ")
  );
  await mintGateErc721.deployed();

  const eclipseArgs = [
    collectionFactory.address,
    paymentSplitterFactory.address,
    store.address,
    owner.address,
  ];
  const eclipse = await Eclipse.deploy(...eclipseArgs);
  console.log(
    "yarn hardhat verify --network goerli",
    [eclipse.address].concat([...eclipseArgs].map((a) => `"${a}"`)).join(" ")
  );
  await eclipse.deployed();

  const minterArgs = [eclipse.address];

  const minter = await EclipseMinterFixedPrice.deploy(...minterArgs);
  console.log(
    "yarn hardhat verify --network goerli",
    [minter.address].concat(minterArgs.map((a) => `"${a}"`)).join(" ")
  );
  await minter.deployed();

  const minterFree = await EclipseMinterFree.deploy(...minterArgs);
  console.log(
    "yarn hardhat verify --network goerli",
    [minterFree.address].concat(minterArgs.map((a) => `"${a}"`)).join(" ")
  );
  await minterFree.deployed();

  const minterAirdrop = await EclipseMinterAirdrop.deploy(...minterArgs);
  console.log(
    "yarn hardhat verify --network goerli",
    [minterAirdrop.address].concat(minterArgs.map((a) => `"${a}"`)).join(" ")
  );
  await minterAirdrop.deployed();

  const minterDA = await EclipseMinterDutchAuction.deploy(...minterArgs);
  console.log(
    "yarn hardhat verify --network goerli",
    [minterDA.address].concat(minterArgs.map((a) => `"${a}"`)).join(" ")
  );
  await minterDA.deployed();

  const implementation = await EclipseERC721.deploy();
  console.log(
    "yarn hardhat verify --network goerli",
    [implementation.address].concat([].map((a) => `"${a}"`)).join(" ")
  );
  await implementation.deployed();

  await eclipse.addMinter(0, minter.address);
  await eclipse.addMinter(1, minterDA.address);
  await eclipse.addMinter(2, minterFree.address);
  await eclipse.addMinter(3, minterAirdrop.address);
  await eclipse.addGate(0, mintGatePublic.address);
  await eclipse.addGate(1, mintGateErc721.address);
  await collectionFactory.addErc721Implementation(0, implementation.address);
  await collectionFactory.setAdminAccess(eclipse.address, true);
  await mintGatePublic.setAdminAccess(minter.address, true);
  await mintGatePublic.setAdminAccess(minterDA.address, true);
  await mintGatePublic.setAdminAccess(minterFree.address, true);
  await mintGatePublic.setAdminAccess(minterAirdrop.address, true);
  await mintGateErc721.setAdminAccess(minter.address, true);
  await mintGateErc721.setAdminAccess(minterDA.address, true);
  await mintGateErc721.setAdminAccess(minterFree.address, true);
  await mintGateErc721.setAdminAccess(minterAirdrop.address, true);
  await paymentSplitterFactory.setAdminAccess(eclipse.address, true);
  await minter.setAdminAccess(eclipse.address, true);
  await minterDA.setAdminAccess(eclipse.address, true);
  await minterFree.setAdminAccess(eclipse.address, true);
  await minterAirdrop.setAdminAccess(eclipse.address, true);
  await store.setAdminAccess(eclipse.address, true);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
