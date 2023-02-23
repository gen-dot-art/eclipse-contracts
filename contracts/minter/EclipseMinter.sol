// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../app/Eclipse.sol";
import "../interface/IEclipseERC721.sol";
import "../interface/IEclipseMintGate.sol";
import "../interface/IEclipsePaymentSplitter.sol";
import "./EclipseMinterBase.sol";

/**
 * @dev Eclipse Default Minter
 * Admin for collections deployed on {Eclipse}
 */

contract EclipseMinter is EclipseMinterBase {
    struct FixedPriceParams {
        address artist;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
        uint256 maxSupply;
        GateParams gate;
    }

    struct CollectionPricingParams {
        address artist;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
        uint256 maxSupply;
        address gateAddress;
    }

    struct CollectionState {
        CollectionPricingParams params;
        uint256 minted;
        uint256 available;
    }

    mapping(address => CollectionPricingParams[]) public collections;

    event PricingSet(
        address collection,
        CollectionPricingParams params,
        uint256 index
    );

    constructor(address eclipse_) EclipseMinterBase(eclipse_) {}

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
        CollectionPricingParams[] storage col = collections[collection];
        uint256 endTime = params.endTime;
        uint256 price = params.price;
        uint256 maxSupply = params.maxSupply;
        uint256 index = col.length;
        uint8 gateType = params.gate.gateType;
        require(startTime > block.timestamp, "startTime too early");
        if (endTime != 0) {
            require(endTime > startTime, "endTime must be greater startTime");
        }
        require(price > 0, "price must be greater 0");
        require(maxSupply > 0, "maxSupply must be greater 0");
        address gateAddress = Eclipse(eclipse).gateTypes(gateType);
        IEclipseMintGate(gateAddress).addGateForCollection(
            collection,
            address(this),
            index,
            params.gate.gateCalldata
        );
        CollectionPricingParams memory ev = CollectionPricingParams(
            params.artist,
            startTime,
            endTime,
            price,
            maxSupply,
            gateAddress
        );
        col.push(ev);
        emit PricingSet(collection, ev, index);
    }

    /**
     * @dev Get price for collection
     * @param collection contract address of the collection
     */
    function getPrice(address collection, uint256 index)
        public
        view
        override
        returns (uint256)
    {
        return collections[collection][index].price;
    }

    /**
     * @dev Helper function to check for mint price and start date
     */
    function _checkState(address collection, uint256 index) internal view {
        uint256 timestamp = block.timestamp;
        uint256 startTime = collections[collection][index].startTime;
        uint256 endTime = collections[collection][index].endTime;
        require(
            startTime != 0 && startTime <= timestamp,
            "mint not started yet"
        );
        require(endTime != 0 && endTime >= timestamp, "mint ended");
    }

    /**
     * @dev Helper function to check for available mints for sender
     */
    function _getAllowedMints(
        address collection,
        uint256 index,
        address minter,
        address gateAddress,
        address sender,
        uint256 amount
    ) internal view returns (uint256) {
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint256 allowedMints = gate.getAllowedMints(
            collection,
            minter,
            index,
            sender
        );
        require(allowedMints > 0, "no mints available");
        uint256 minted = gate.getTotalMinted(collection, minter, index);
        uint256 availableSupply = collections[collection][index].maxSupply -
            minted;
        require(availableSupply > 0, "sold out");
        uint256 mints = amount > allowedMints ? allowedMints : amount;

        return mints > availableSupply ? availableSupply : mints;
    }

    /**
     * @dev Helper function to check for available mints for sender
     */
    function _getAllowedMintsAndUpdate(
        address collection,
        uint256 index,
        address minter,
        address gateAddress,
        address sender,
        uint256 amount
    ) internal returns (uint256) {
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint256 minted = _getAllowedMints(
            collection,
            index,
            minter,
            gateAddress,
            sender,
            amount
        );
        gate.update(collection, minter, index, sender, minted);
        return minted;
    }

    /**
     * @dev Mint a token
     * @param collection contract address of the collection
     */
    function mintOne(address collection, uint256 index)
        external
        payable
        override
    {
        _checkState(collection, index);
        address user = _msgSender();
        address minter = address(this);
        address gate = collections[collection][index].gateAddress;
        _getAllowedMintsAndUpdate(collection, index, minter, gate, user, 1);
        IEclipseERC721(collection).mintOne(user);
        _splitPayment(collection, index, user, 1, msg.value);
    }

    /**
     * @dev Mint a token
     * @param collection contract address of the collection
     * @param amount amount of tokens to mint
     */
    function mint(
        address collection,
        uint256 index,
        uint256 amount
    ) external payable override {
        _checkState(collection, index);
        address user = _msgSender();
        address minter = address(this);
        address gate = collections[collection][index].gateAddress;
        uint256 allowedMints = _getAllowedMintsAndUpdate(
            collection,
            index,
            minter,
            gate,
            user,
            amount
        );
        IEclipseERC721(collection).mint(user, allowedMints);

        _splitPayment(
            collection,
            index,
            user,
            amount,
            (msg.value / amount) * allowedMints
        );
    }

    /**
     * @dev Internal function to forward funds to a {EclipsePaymentSplitter}
     */
    function _splitPayment(
        address collection,
        uint256 index,
        address sender,
        uint256 amount,
        uint256 value
    ) internal {
        uint256 msgValue = msg.value;
        require(
            msgValue >= getPrice(collection, index) * amount,
            "wrong amount sent"
        );
        address paymentSplitter = Eclipse(eclipse)
            .store()
            .getPaymentSplitterForCollection(collection);
        IEclipsePaymentSplitter(paymentSplitter).splitPayment{value: value}();
        if (value != msgValue) {
            payable(sender).transfer(msgValue - value);
        }
    }

    function _getAvailableSupply(address collection, uint256 index)
        internal
        view
        returns (uint256)
    {
        address gateAddress = collections[collection][index].gateAddress;
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint256 minted = gate.getTotalMinted(collection, address(this), index);

        return collections[collection][index].maxSupply - minted;
    }

    /**
     * @dev Get collection pricing object
     * @param collection contract address of the collection
     */
    function getCollectionPricing(address collection)
        external
        view
        returns (CollectionPricingParams[] memory)
    {
        return collections[collection];
    }

    function getAllowedMintsForUser(
        address collection,
        uint256 index,
        address user
    ) external view override returns (uint256) {
        address gateAddress = collections[collection][index].gateAddress;
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint256 minted = gate.getTotalMinted(collection, address(this), index);
        uint256 mints = gate.getAllowedMints(
            collection,
            address(this),
            index,
            user
        );
        uint256 availableSupply = collections[collection][index].maxSupply -
            minted;

        return mints > availableSupply ? availableSupply : mints;
    }

    function getAvailableSupply(address collection, uint256 index)
        external
        view
        override
        returns (uint256)
    {
        return _getAvailableSupply(collection, index);
    }

    function getCollectionState(address collection)
        external
        view
        returns (CollectionState[] memory)
    {
        CollectionPricingParams[] memory params = collections[collection];
        CollectionState[] memory returnArr = new CollectionState[](
            params.length
        );
        for (uint24 i; i < params.length; i++) {
            uint256 minted = IEclipseMintGate(params[i].gateAddress)
                .getTotalMinted(collection, address(this), i);
            returnArr[i] = CollectionState(
                params[i],
                minted,
                _getAvailableSupply(collection, i)
            );
        }

        return returnArr;
    }
}
