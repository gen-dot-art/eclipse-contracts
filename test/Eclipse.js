const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { BigNumber } = ethers;

const ONE_GWEI = 1_000_000_000;

describe("Eclipse", async function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, artistAccount, pool, other2] =
      await ethers.getSigners();

    const EclipseMinterFixedPrice = await ethers.getContractFactory(
      "EclipseMinterFixedPrice"
    );
    const EclipseMinterFree = await ethers.getContractFactory(
      "EclipseMinterFree"
    );
    const EclipseMinterAirdrop = await ethers.getContractFactory(
      "EclipseMinterAirdrop"
    );
    const EclipseMinterDutchAuction = await ethers.getContractFactory(
      "EclipseMinterDutchAuction"
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
    const store = await EclipseStorage.deploy();

    const paymentSplitterFactory = await EclipsePaymentSplitterFactory.deploy(
      paymentSplitter.address
    );
    const collectionFactory = await EclipseCollectionFactory.deploy("uri://");

    const mintGatePublic = await EclipseMintGatePublic.deploy();
    const mintGateErc721 = await EclipseMintGateERC721.deploy();

    const eclipse = await Eclipse.deploy(
      collectionFactory.address,
      paymentSplitterFactory.address,
      store.address,
      owner.address
    );

    const minter = await EclipseMinterFixedPrice.deploy(eclipse.address);
    const minterDA = await EclipseMinterDutchAuction.deploy(eclipse.address);
    const minterFree = await EclipseMinterFree.deploy(eclipse.address);
    const minterAirdrop = await EclipseMinterAirdrop.deploy(eclipse.address);

    const implementation = await EclipseERC721.deploy();

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

    return {
      eclipse,
      store,
      factory: collectionFactory,
      paymentSplitter,
      implementation,
      minter,
      minterDA,
      minterFree,
      minterAirdrop,
      mintGatePublic,
      mintGateErc721,
      owner,
      artistAccount,
      otherAccount,
      pool,
      other2,
    };
  }
  function getPricingData(artistAccount, maxSupplyMinter, startTime, endTime) {
    const gateCalldata = ethers.utils.defaultAbiCoder.encode(
      [
        {
          components: [
            {
              internalType: "uint24",
              name: "allowedPerWallet",
              type: "uint24",
            },
            {
              internalType: "uint8",
              name: "allowedPerTransaction",
              type: "uint8",
            },
          ],
          name: "params",
          type: "tuple",
        },
      ],
      [
        {
          allowedPerWallet: 0,
          allowedPerTransaction: 0,
        },
      ]
    );
    return ethers.utils.defaultAbiCoder.encode(
      [
        {
          components: [
            {
              internalType: "address",
              name: "artist",
              type: "address",
            },
            {
              internalType: "uint48",
              name: "startTime",
              type: "uint48",
            },
            {
              internalType: "uint48",
              name: "endTime",
              type: "uint48",
            },
            {
              internalType: "uint256",
              name: "price",
              type: "uint256",
            },
            {
              internalType: "uint24",
              name: "maxSupply",
              type: "uint24",
            },
            {
              components: [
                {
                  internalType: "uint8",
                  name: "gateType",
                  type: "uint8",
                },
                {
                  internalType: "bytes",
                  name: "gateCalldata",
                  type: "bytes",
                },
              ],
              name: "gate",
              type: "tuple",
              internalType: "GateParams",
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
          endTime,
          price: ONE_GWEI,
          maxSupply: maxSupplyMinter,
          gate: {
            gateType: 0,
            gateCalldata,
          },
        },
      ]
    );
  }
  function getPricingDataFreeMint(
    artistAccount,
    maxSupplyMinter,
    startTime,
    endTime
  ) {
    const gateCalldata = ethers.utils.defaultAbiCoder.encode(
      [
        {
          components: [
            {
              internalType: "uint24",
              name: "allowedPerWallet",
              type: "uint24",
            },
            {
              internalType: "uint8",
              name: "allowedPerTransaction",
              type: "uint8",
            },
          ],
          name: "params",
          type: "tuple",
        },
      ],
      [
        {
          allowedPerWallet: 0,
          allowedPerTransaction: 0,
        },
      ]
    );
    return ethers.utils.defaultAbiCoder.encode(
      [
        {
          components: [
            {
              internalType: "address",
              name: "artist",
              type: "address",
            },
            {
              internalType: "uint48",
              name: "startTime",
              type: "uint48",
            },
            {
              internalType: "uint48",
              name: "endTime",
              type: "uint48",
            },
            {
              internalType: "uint24",
              name: "maxSupply",
              type: "uint24",
            },
            {
              components: [
                {
                  internalType: "uint8",
                  name: "gateType",
                  type: "uint8",
                },
                {
                  internalType: "bytes",
                  name: "gateCalldata",
                  type: "bytes",
                },
              ],
              name: "gate",
              type: "tuple",
              internalType: "GateParams",
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
          endTime,
          maxSupply: maxSupplyMinter,
          gate: {
            gateType: 0,
            gateCalldata,
          },
        },
      ]
    );
  }
  function getPricingDataDA(auctionType = 0) {
    return (artistAccount, maxSupplyMinter, startTime, endTime) => {
      const gateCalldata = ethers.utils.defaultAbiCoder.encode(
        [
          {
            components: [
              {
                internalType: "uint24",
                name: "allowedPerWallet",
                type: "uint24",
              },
              {
                internalType: "uint8",
                name: "allowedPerTransaction",
                type: "uint8",
              },
            ],
            name: "params",
            type: "tuple",
          },
        ],
        [
          {
            allowedPerWallet: 0,
            allowedPerTransaction: 0,
          },
        ]
      );
      return ethers.utils.defaultAbiCoder.encode(
        [
          {
            components: [
              {
                internalType: "address",
                name: "artist",
                type: "address",
              },
              {
                internalType: "uint48",
                name: "startTime",
                type: "uint48",
              },
              {
                internalType: "uint48",
                name: "endTime",
                type: "uint48",
              },

              {
                internalType: "uint24",
                name: "maxSupply",
                type: "uint24",
              },
              {
                components: [
                  {
                    internalType: "uint256",
                    name: "startPrice",
                    type: "uint256",
                  },
                  {
                    internalType: "uint24",
                    name: "decrease",
                    type: "uint24",
                  },
                  {
                    internalType: "uint24",
                    name: "delay",
                    type: "uint24",
                  },
                  {
                    internalType: "uint24",
                    name: "decrements",
                    type: "uint24",
                  },
                  {
                    internalType: "uint8",
                    name: "auctionType",
                    type: "uint8",
                  },
                ],
                name: "pricing",
                type: "tuple",
                internalType: "DutchAuctionPricing",
              },
              {
                components: [
                  {
                    internalType: "uint8",
                    name: "gateType",
                    type: "uint8",
                  },
                  {
                    internalType: "bytes",
                    name: "gateCalldata",
                    type: "bytes",
                  },
                ],
                name: "gate",
                type: "tuple",
                internalType: "GateParams",
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
            endTime,
            maxSupply: maxSupplyMinter,
            pricing: {
              startPrice: ONE_GWEI,
              decrease: 50000,
              decrements: 3,
              delay: 120,
              auctionType,
            },
            gate: {
              gateType: 0,
              gateCalldata,
            },
          },
        ]
      );
    };
  }
  async function createCollection(
    eclipse,
    store,
    factory,
    artistAccount,
    otherAccount,
    maxSupply = 100,
    index = 0,
    maxSupplyMinter = maxSupply,
    pricingMode = [0],
    getPricingDataFn = [getPricingData],
    _startTime,
    _endTime
  ) {
    const name = "Coll";
    const symbol = "SYM";
    const erc721Index = 0;
    const startTime = _startTime ?? (await time.latest()) + 60 * 60 * 10;
    const endTime = _endTime ?? startTime + 1000 + 2000;

    const tx = await eclipse.connect(artistAccount).createCollection({
      name: name,
      symbol: symbol,
      script: "test",
      collectionType: 0,
      maxSupply: maxSupply,
      erc721Index: erc721Index,
      pricingMode: pricingMode,
      pricingData: getPricingDataFn.map((f) =>
        f(artistAccount, maxSupplyMinter, startTime, endTime)
      ),
      payeesMint: [otherAccount.address, artistAccount.address],
      payeesRoyalties: [otherAccount.address, artistAccount.address],
      sharesMint: [2000, 8000],
      sharesRoyalties: [500, 300],
    });

    const artist = await store.getArtist(artistAccount.address);
    const info = await eclipse.getCollectionInfo(artist.collections[index]);

    await expect(tx).to.emit(factory, "Created");

    return { info, startTime, artist };
  }
  async function init() {
    const deployment = await deploy();
    const { store, eclipse, artistAccount, factory, otherAccount } = deployment;

    const { info, startTime, artist } = await createCollection(
      eclipse,
      store,
      factory,
      artistAccount,
      otherAccount,
      100
    );

    // await whitelistMinter.setPricing(
    //   info.collection.contractAddress,
    //   startTime,
    //   ONE_GWEI,
    //   [otherAccount.address]
    // );
    await time.increaseTo(startTime + 1000);
    const EclipseErc721 = await ethers.getContractFactory("EclipseERC721");
    const collection = await EclipseErc721.attach(
      info.collection.contractAddress
    );

    // await collection.setMinter(whitelistMinter.address, true, false);
    return Object.assign(deployment, { artist, info, collection });
  }
  describe("Deployment", async () => {
    it("should deploy", async () => {
      await deploy();
    });
  });
  describe("Collection", async () => {
    it("should create artist and collection", async () => {
      await init();
    });
    it("should fail calling initializer on collection", async () => {
      const { collection, owner } = await init();

      const fail = collection.initialize(
        "name",
        "symb",
        "scrpit",
        1,
        1,
        owner.address,
        owner.address,
        owner.address,
        [owner.address],
        owner.address
      );

      await expect(fail).to.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
    it("should update script", async () => {
      const {
        eclipse,
        artistAccount,
        collection,
        otherAccount,
        artist,
        store,
      } = await init();

      await store
        .connect(artistAccount)
        .updateScript(collection.address, "artist");
      const info = await eclipse.getCollectionInfo(artist.collections[0]);
      expect(info.collection.script).to.equal("artist");

      const fail = store
        .connect(otherAccount)
        .updateScript(collection.address, "fail");

      await expect(fail).to.revertedWith("not allowed");
    });
    it("should only allow minter", async () => {
      const { collection, owner } = await init();

      const shouldFailMint = collection.mintOne(owner.address);
      await expect(shouldFailMint).to.revertedWith("only minter allowed");
    });
    it("should mint reserved", async () => {
      const { collection, artistAccount } = await init();

      const mint = await collection.connect(artistAccount).mintReserved();
      await expect(mint).to.emit(collection, "Mint");
    });
    it("should mint one", async () => {
      const { minter, info, collection } = await init();

      // console.log("a", artist);

      const mint = await minter.mintOne(info.collection.contractAddress, 0, {
        value: ONE_GWEI,
      });

      await expect(mint).to.emit(collection, "Mint");
    });
    it("should mint many", async () => {
      const { minter, info, other2 } = await init();

      await minter
        .connect(other2)
        .mint(info.collection.contractAddress, 0, "4", {
          value: BigNumber.from(ONE_GWEI).mul(4),
        });

      // console.log("name", await collection.name());
    });
    it("should fail on mint sell out", async () => {
      const { minter, other2, factory, eclipse, store, artistAccount, owner } =
        await init();
      const { info, startTime } = await createCollection(
        eclipse,
        store,
        factory,
        artistAccount,
        owner,
        3,
        1
      );
      await time.increaseTo(startTime + 1000);

      await minter
        .connect(other2)
        .mint(info.collection.contractAddress, 0, "2", {
          value: BigNumber.from(ONE_GWEI).mul(2),
        });
      const partialMint = await minter
        .connect(other2)
        .mint(info.collection.contractAddress, 0, "2", {
          value: BigNumber.from(ONE_GWEI).mul(2),
        });

      await expect(partialMint).to.changeEtherBalance(
        other2,
        -BigNumber.from(ONE_GWEI)
      );

      const mintOneFail = minter
        .connect(other2)
        .mintOne(info.collection.contractAddress, 0, {
          value: BigNumber.from(ONE_GWEI),
        });

      const mintManyFail = minter
        .connect(other2)
        .mint(info.collection.contractAddress, 0, "4", {
          value: BigNumber.from(ONE_GWEI).mul(4),
        });

      await expect(mintOneFail).to.revertedWith("sold out");
      await expect(mintManyFail).to.revertedWith("sold out");

      // console.log("name", await collection.name());
    });
    it("should fail on mint wrong amount", async () => {
      const { info, minter } = await init();

      const shouldFailMint = minter.mintOne(
        info.collection.contractAddress,
        0,
        {
          value: BigNumber.from(ONE_GWEI).sub(1),
        }
      );
      const shouldFailMint2 = minter.mint(
        info.collection.contractAddress,
        0,
        "3",
        {
          value: BigNumber.from(ONE_GWEI).mul(3).sub(1),
        }
      );

      await expect(shouldFailMint).to.revertedWith("wrong amount sent");
      await expect(shouldFailMint2).to.revertedWith("wrong amount sent");
    });
    it("should keep minting open for collection", async () => {
      const deployment = await deploy();
      const {
        store,
        eclipse,
        artistAccount,
        factory,
        otherAccount,
        minterFree,
        minter,
      } = deployment;
      const _startTime = (await time.latest()) + 60;
      const { info, startTime } = await createCollection(
        eclipse,
        store,
        factory,
        artistAccount,
        otherAccount,
        10,
        0,
        5,
        [0, 2],
        [getPricingData, getPricingDataFreeMint],
        _startTime,
        0
      );

      await time.increaseTo(startTime + 10 * 10000);
      const EclipseErc721 = await ethers.getContractFactory("EclipseERC721");
      const collection = await EclipseErc721.attach(
        info.collection.contractAddress
      );
      const mint = await minterFree.mintOne(
        info.collection.contractAddress,
        0,
        {
          value: 0,
        }
      );
      const mint2 = await minter.mintOne(info.collection.contractAddress, 0, {
        value: ONE_GWEI,
      });
      await expect(mint).to.emit(collection, "Mint");
      await expect(mint2).to.emit(collection, "Mint");
    });
    it("should respect maxSupply for each minter", async () => {
      const deployment = await deploy();
      const {
        store,
        eclipse,
        artistAccount,
        factory,
        otherAccount,
        minterFree,
        minter,
      } = deployment;
      const _startTime = (await time.latest()) + 60;
      const { info, startTime } = await createCollection(
        eclipse,
        store,
        factory,
        artistAccount,
        otherAccount,
        10,
        0,
        5,
        [0, 2, 2],
        [getPricingData, getPricingDataFreeMint, getPricingDataFreeMint],
        _startTime,
        0
      );

      await time.increaseTo(startTime + 10 * 10000);
      const EclipseErc721 = await ethers.getContractFactory("EclipseERC721");
      const collection = await EclipseErc721.attach(
        info.collection.contractAddress
      );
      const mint = await minterFree.mintOne(
        info.collection.contractAddress,
        0,
        {
          value: 0,
        }
      );
      await minterFree.mint(info.collection.contractAddress, 0, 3, {
        value: 0,
      });
      const mint2 = await minter.mintOne(info.collection.contractAddress, 0, {
        value: ONE_GWEI,
      });
      await minter.mint(info.collection.contractAddress, 0, 4, {
        value: BigNumber.from(ONE_GWEI).mul(4),
      });
      await expect(mint).to.emit(collection, "Mint");
      await expect(mint2).to.emit(collection, "Mint");

      const fail1 = minterFree.mint(info.collection.contractAddress, 1, 2, {
        value: 0,
      });
      await expect(fail1).to.revertedWith("amount exceeds total supply");
      await minterFree.mintOne(info.collection.contractAddress, 0, {
        value: 0,
      });
      const fail2 = minterFree.mint(info.collection.contractAddress, 1, 2, {
        value: 0,
      });
      await expect(fail2).to.revertedWith("sold out");
    });
  });

  describe("DutchAuction", async () => {
    it("should mint linear DA collection", async () => {
      const deployment = await deploy();
      const { store, eclipse, artistAccount, factory, otherAccount, minterDA } =
        deployment;

      const { info, startTime } = await createCollection(
        eclipse,
        store,
        factory,
        artistAccount,
        otherAccount,
        10,
        0,
        8,
        [1],
        [getPricingDataDA()]
      );

      await time.increaseTo(startTime + 1);
      const EclipseErc721 = await ethers.getContractFactory("EclipseERC721");
      const collection = await EclipseErc721.attach(
        info.collection.contractAddress
      );
      const mint = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: ONE_GWEI,
      });

      await expect(mint).to.emit(collection, "Mint");
      await time.increaseTo(startTime + 120);
      const mint2 = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: BigNumber.from(ONE_GWEI)
          .mul(10 ** 6 - 50000)
          .div(10 ** 6),
      });
      await expect(mint2).to.emit(collection, "Mint");
      await time.increaseTo(startTime + 120 * 2);
      const mint3 = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: BigNumber.from(ONE_GWEI)
          .mul(BigNumber.from(10 ** 6 - 50000 * 2))
          .div(10 ** 6),
      });
      await expect(mint3).to.emit(collection, "Mint");
      await time.increaseTo(startTime + 120 * 3);
      const mint4 = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: BigNumber.from(ONE_GWEI)
          .mul(BigNumber.from(10 ** 6 - 50000 * 3))
          .div(10 ** 6),
      });
      await expect(mint4).to.emit(collection, "Mint");
    });
    it("should mint exponential DA collection", async () => {
      const deployment = await deploy();
      const { store, eclipse, artistAccount, factory, otherAccount, minterDA } =
        deployment;

      const { info, startTime } = await createCollection(
        eclipse,
        store,
        factory,
        artistAccount,
        otherAccount,
        10,
        0,
        8,
        [1],
        [getPricingDataDA(1)]
      );

      await time.increaseTo(startTime + 1);
      const EclipseErc721 = await ethers.getContractFactory("EclipseERC721");
      const collection = await EclipseErc721.attach(
        info.collection.contractAddress
      );
      const mint = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: ONE_GWEI,
      });

      await expect(mint).to.emit(collection, "Mint");

      await time.increaseTo(startTime + 120);

      const mint2 = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: BigNumber.from(ONE_GWEI)
          .mul(10 ** 6 - 50000)
          .div(10 ** 6),
      });

      await expect(mint2).to.emit(collection, "Mint");
      await time.increaseTo(startTime + 120 * 2);

      const mint3 = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: BigNumber.from(ONE_GWEI)
          .mul(BigNumber.from(10 ** 6 - 50000).pow(2))
          .div(BigNumber.from(10 ** 6).pow(2)),
      });
      await expect(mint3).to.emit(collection, "Mint");
      await time.increaseTo(startTime + 120 * 3);
      const mint4 = await minterDA.mintOne(info.collection.contractAddress, 0, {
        value: BigNumber.from(ONE_GWEI)
          .mul(BigNumber.from(10 ** 6 - 50000).pow(3))
          .div(BigNumber.from(10 ** 6).pow(3)),
      });
      const mintFail = minterDA.mintOne(info.collection.contractAddress, 0, {
        value: BigNumber.from(ONE_GWEI)
          .mul(BigNumber.from(10 ** 6 - 50000).pow(3))
          .div(BigNumber.from(10 ** 6).pow(3))
          .sub(1),
      });
      await expect(mint4).to.emit(collection, "Mint");
      await expect(mintFail).to.revertedWith("wrong amount sent");
    });
  });
  describe("PaymentSplitter", async () => {
    it("should split royalties eth", async () => {
      const { otherAccount, artistAccount, owner, info } = await init();

      const EclipsePaymentSplitter = await ethers.getContractFactory(
        "EclipsePaymentSplitter"
      );
      const paymentSplitter = await EclipsePaymentSplitter.attach(
        info.collection.paymentSplitter
      );
      await paymentSplitter.setAdminAccess(otherAccount.address, true);

      const tx = await otherAccount.sendTransaction({
        to: paymentSplitter.address,
        value: ONE_GWEI,
      });

      await expect(tx).to.changeEtherBalance(
        paymentSplitter,
        BigNumber.from(ONE_GWEI)
      );

      const artistRelease = await paymentSplitter
        .connect(artistAccount)
        .release(artistAccount.address);
      const artistRelease2 = await paymentSplitter
        .connect(otherAccount)
        .release(otherAccount.address);
      const ownerRelease = await paymentSplitter.release(owner.address);

      const totalShares = await paymentSplitter.getTotalRoyaltyShares();

      expect(totalShares.toNumber() / 10_000).equals(0.1);

      await expect(ownerRelease).to.changeEtherBalance(
        owner,
        BigNumber.from(ONE_GWEI).mul(200).div(totalShares)
      );
      await expect(artistRelease).to.changeEtherBalance(
        artistAccount,
        BigNumber.from(ONE_GWEI).mul(300).div(totalShares)
      );
      await expect(artistRelease2).to.changeEtherBalance(
        otherAccount,
        BigNumber.from(ONE_GWEI).mul(500).div(totalShares)
      );
    });
    it("should split payment eth", async () => {
      const { otherAccount, artistAccount, owner, info } = await init();

      const EclipsePaymentSplitter = await ethers.getContractFactory(
        "EclipsePaymentSplitter"
      );
      const paymentSplitter = await EclipsePaymentSplitter.attach(
        info.collection.paymentSplitter
      );
      await paymentSplitter.setAdminAccess(otherAccount.address, true);

      await paymentSplitter
        .connect(otherAccount)
        .splitPayment({ value: ONE_GWEI });
      const artistRelease = await paymentSplitter
        .connect(artistAccount)
        .release(artistAccount.address);
      const artistRelease2 = await paymentSplitter
        .connect(otherAccount)
        .release(otherAccount.address);
      const ownerRelease = await paymentSplitter.release(owner.address);
      const ownerAmount = BigNumber.from(ONE_GWEI).mul(125).div(1000);
      await expect(ownerRelease).to.changeEtherBalance(owner, ownerAmount);
      const artistAmount = ONE_GWEI - ownerAmount;
      await expect(artistRelease).to.changeEtherBalance(
        artistAccount,
        BigNumber.from(artistAmount).mul(80).div(100)
      );
      await expect(artistRelease2).to.changeEtherBalance(
        otherAccount,
        BigNumber.from(artistAmount).mul(20).div(100)
      );
    });
    it("should split payment token", async () => {
      const { info, otherAccount, artistAccount, owner } = await init();

      const EclipsePaymentSplitter = await ethers.getContractFactory(
        "EclipsePaymentSplitter"
      );
      const paymentSplitter = await EclipsePaymentSplitter.attach(
        info.collection.paymentSplitter
      );

      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const token = await MockERC20.deploy(owner.address);
      await token.transfer(paymentSplitter.address, ONE_GWEI);

      const release = () => paymentSplitter.releaseTokens(token.address);

      await expect(release).to.changeTokenBalances(
        token,
        [otherAccount, artistAccount],
        [
          BigNumber.from(ONE_GWEI)
            .mul(500)
            .div(500 + 300 + 200),
          BigNumber.from(ONE_GWEI)
            .mul(300)
            .div(500 + 300 + 200),
        ]
      );
    });
    it("should fail calling initializer on payment splitter", async () => {
      const { info, otherAccount, owner } = await init();

      const EclipsePaymentSplitter = await ethers.getContractFactory(
        "EclipsePaymentSplitter"
      );
      const paymentSplitter = await EclipsePaymentSplitter.attach(
        info.collection.paymentSplitter
      );
      const fail = paymentSplitter.initialize(
        otherAccount.address,
        otherAccount.address,
        [owner.address],
        [owner.address],
        [1000],
        [1000]
      );

      await expect(fail).to.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
    it("should fail if no funds available for account", async () => {
      const { info, otherAccount } = await init();

      const EclipsePaymentSplitter = await ethers.getContractFactory(
        "EclipsePaymentSplitter"
      );
      const paymentSplitter = await EclipsePaymentSplitter.attach(
        info.collection.paymentSplitter
      );
      const fail = paymentSplitter
        .connect(otherAccount)
        .release(otherAccount.address);

      await expect(fail).to.revertedWith("no funds to release");
    });
    it("should fail if unauthorized account updates payee", async () => {
      const { info, otherAccount } = await init();

      const EclipsePaymentSplitter = await ethers.getContractFactory(
        "EclipsePaymentSplitter"
      );
      const paymentSplitter = await EclipsePaymentSplitter.attach(
        info.collection.paymentSplitter
      );
      const fail = paymentSplitter
        .connect(otherAccount)
        .updatePayee(0, 1, otherAccount.address);
      const fail2 = paymentSplitter
        .connect(otherAccount)
        .updatePayee(1, 1, otherAccount.address);

      await expect(fail).to.revertedWith("sender is not current payee");
      await expect(fail2).to.revertedWith("sender is not current payee");
    });
    it("should fail if invalid mint shares", async () => {
      const { otherAccount, eclipse, artistAccount } = await init();

      const fail = eclipse.connect(artistAccount).createCollection({
        artist: artistAccount.address,
        name: "name",
        symbol: "symbol",
        script: "test",
        collectionType: 0,
        maxSupply: 500,
        erc721Index: 0,
        pricingMode: [0],
        pricingData: [getPricingData].map((f) =>
          f(artistAccount, 500, Math.floor(new Date() / 1000) + 500, 0)
        ),
        payeesMint: [otherAccount.address, artistAccount.address],
        payeesRoyalties: [otherAccount.address, artistAccount.address],
        sharesMint: [2000, 8001],
        sharesRoyalties: [500, 300],
      });

      await expect(fail).to.revertedWith("sum of shares must equal DOMINATOR");
    });
    it("should update payee", async () => {
      const { info, otherAccount, artistAccount } = await init();

      const EclipsePaymentSplitter = await ethers.getContractFactory(
        "EclipsePaymentSplitter"
      );
      const paymentSplitter = await EclipsePaymentSplitter.attach(
        info.collection.paymentSplitter
      );
      await paymentSplitter
        .connect(artistAccount)
        .updatePayee(0, 1, otherAccount.address);

      await paymentSplitter.splitPayment({ value: ONE_GWEI });

      const release = await paymentSplitter
        .connect(artistAccount)
        .release(otherAccount.address);

      await expect(release).to.changeEtherBalance(
        otherAccount,
        BigNumber.from(ONE_GWEI).mul(875).div(1000)
      );
    });
  });
});
