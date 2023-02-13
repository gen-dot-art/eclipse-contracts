// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../app/Eclipse.sol";
import "../interface/IEclipseERC721.sol";
import "../interface/IEclipsePaymentSplitter.sol";
import "./EclipseMinterBase.sol";
import "./EclipseMintAllocator.sol";

/**
 * @dev Eclipse Default Minter
 * Admin for collections deployed on {Eclipse}
 */

contract EclipseMinter is EclipseMinterBase {
    struct FixedPriceParams {
        address artist;
        uint256 startTime;
        uint256 price;
        uint8 allowedPerTransaction;
        uint24 allowedPerWallet;
    }

    mapping(address => FixedPriceParams) public collections;

    event PricingSet(address collection, FixedPriceParams params);

    constructor(address eclipse_, address mintAllocator_)
        EclipseMinterBase(eclipse_, mintAllocator_)
    {}

    /**
     * @dev Set pricing for collection
     * @param collection contract address of the collection
     * @param data `FixedPriceParams` struct
     */
    function setPricing(address collection, bytes memory data)
        external
        override
        onlyAdmin
    {
        FixedPriceParams memory params = abi.decode(data, (FixedPriceParams));
        uint256 startTime = params.startTime;
        uint256 price = params.price;
        require(startTime > block.timestamp, "startTime too early");
        require(price > 0, "price must be greater 0");
        uint24 allowedPerWallet = params.allowedPerWallet == 0
            ? 99_999
            : params.allowedPerWallet;
        uint8 allowedPerTransaction = params.allowedPerTransaction == 0
            ? 30
            : params.allowedPerTransaction;
        require(
            allowedPerWallet >= allowedPerTransaction,
            "allowedPerTransaction has to be ge allowedPerWallet"
        );
        EclipseMintAllocator(mintAllocator).init(
            collection,
            allowedPerTransaction,
            allowedPerWallet
        );
        collections[collection] = FixedPriceParams(
            params.artist,
            startTime,
            price,
            allowedPerTransaction,
            allowedPerWallet
        );
        emit PricingSet(collection, collections[collection]);
    }

    /**
     * @dev Get price for collection
     * @param collection contract address of the collection
     */
    function getPrice(address collection)
        public
        view
        override
        returns (uint256)
    {
        return collections[collection].price;
    }

    /**
     * @dev Helper function to check for mint price and start date
     */
    function _checkMint(address collection, uint256 amount) internal view {
        require(
            msg.value >= getPrice(collection) * amount,
            "wrong amount sent"
        );
        require(
            collections[collection].startTime != 0 &&
                collections[collection].startTime <= block.timestamp,
            "mint not started yet"
        );
    }

    /**
     * @dev Helper function to check for available mints for sender
     */
    function _checkAvailableMints(
        address collection,
        address sender,
        uint256 amount
    ) internal view {
        uint256 allowedMint = EclipseMintAllocator(mintAllocator)
            .getAllowedMints(collection, sender);
        require(
            amount <= allowedMint,
            "amount exceeds allowed amount per transaction"
        );
    }

    /**
     * @dev Mint a token
     * @param collection contract address of the collection
     */
    function mintOne(address collection) external payable override {
        _checkMint(collection, 1);
        address minter = _msgSender();
        _checkAvailableMints(collection, minter, 1);
        IEclipseERC721(collection).mintOne(minter);
        _splitPayment(collection, minter, msg.value);
    }

    /**
     * @dev Mint a token
     * @param collection contract address of the collection
     * @param amount amount of tokens to mint
     */
    function mint(address collection, uint256 amount)
        external
        payable
        override
    {
        _checkMint(collection, amount);
        address minter = _msgSender();
        _checkAvailableMints(collection, minter, amount);
        uint256 minted = IEclipseERC721(collection).mint(minter, amount);
        _splitPayment(collection, minter, (msg.value / amount) * minted);
    }

    /**
     * @dev Internal function to forward funds to a {EclipsePaymentSplitter}
     */
    function _splitPayment(
        address collection,
        address sender,
        uint256 value
    ) internal {
        uint256 msgValue = msg.value;
        address paymentSplitter = Eclipse(eclipse)
            .store()
            .getPaymentSplitterForCollection(collection);
        IEclipsePaymentSplitter(paymentSplitter).splitPayment{value: value}();
        if (value != msgValue) {
            payable(sender).transfer(msgValue - value);
        }
    }

    /**
     * @dev Get collection pricing object
     * @param collection contract address of the collection
     */
    function getCollectionPricing(address collection)
        external
        view
        returns (FixedPriceParams memory)
    {
        return collections[collection];
    }
}
