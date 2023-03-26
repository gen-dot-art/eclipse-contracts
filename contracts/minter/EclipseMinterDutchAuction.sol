// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../app/Eclipse.sol";
import "../interface/IEclipseERC721.sol";
import "../interface/IEclipseMintGate.sol";
import "../interface/IEclipsePaymentSplitter.sol";
import "./EclipseMinterBase.sol";

/**
 * @dev Eclipse Dutch Auction Minter
 * Admin for collections deployed on {Eclipse}
 */

contract EclipseMinterDutchAuction is EclipseMinterBase {
    struct DutchAuctionPricing {
        uint256 startPrice;
        uint24 decrease;
        uint24 delay;
        uint8 decrements;
        uint8 auctionType;
    }
    struct DutchAuctionParams {
        address artist;
        uint48 startTime;
        uint48 endTime;
        uint24 maxSupply;
        DutchAuctionPricing pricing;
        GateParams gate;
    }

    mapping(address => DutchAuctionPricing[]) public pricings;

    uint256 public constant PRECISION_FACTOR = 10 ** 6;

    event PricingSet(
        address collection,
        CollectionMintParams mint,
        DutchAuctionPricing pricing,
        uint8 index
    );

    constructor(address eclipse_) EclipseMinterBase(eclipse_) {}

    /**
     * @dev Set pricing for collection
     * @param collection contract address of the collection
     * @param data `FixedPriceParams` struct
     */
    function setPricing(
        address collection,
        address sender,
        bytes memory data
    ) external override onlyAdmin {
        DutchAuctionParams memory params = abi.decode(
            data,
            (DutchAuctionParams)
        );
        CollectionMintParams[] storage col = collections[collection];
        DutchAuctionPricing memory pricing = params.pricing;
        address artist = params.artist;
        uint48 startTime = params.startTime;
        uint48 endTime = params.endTime;
        uint24 maxSupply = params.maxSupply;
        uint8 index = uint8(col.length);
        uint8 gateType = params.gate.gateType;
        address gateAddress = Eclipse(eclipse).gateTypes(gateType);

        checkParams(
            collection,
            artist,
            sender,
            startTime,
            endTime,
            maxSupply,
            pricing
        );

        IEclipseMintGate(gateAddress).addGateForCollection(
            collection,
            address(this),
            index,
            params.gate.gateCalldata
        );
        CollectionMintParams memory mintParams = CollectionMintParams(
            artist,
            startTime,
            endTime,
            maxSupply,
            gateAddress,
            gateType
        );
        col.push(mintParams);
        emit PricingSet(collection, mintParams, pricing, index);
    }

    function checkParams(
        address collection,
        address artist,
        address sender,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply,
        DutchAuctionPricing memory pricing
    ) internal {
        require(sender == artist, "invalid collection");
        require(startTime > block.timestamp, "startTime too early");
        if (endTime != 0) {
            require(endTime > startTime, "endTime must be greater startTime");
        }
        require(maxSupply > 0, "maxSupply must be greater 0");
        require(pricing.startPrice > 0, "startPrice must be greater 0");
        require(
            pricing.decrease <= 1_000_000,
            "decrease must be less or equal than 1_000_000"
        );
        require(
            pricing.decrements <= 6 && pricing.decrements > 0,
            "decrements must be between 1 and 6"
        );
        require(pricing.delay > 0, "delay must be greather 0");
        require(pricing.auctionType <= 1, "invalid auctionType");
        pricings[collection].push(pricing);
    }

    /**
     * @dev Mint a token
     * @param collection contract address of the collection
     */
    function mintOne(
        address collection,
        uint8 index
    ) external payable override {
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
        uint8 index,
        uint24 amount
    ) external payable override {
        _checkState(collection, index);
        address user = _msgSender();
        address minter = address(this);
        address gate = collections[collection][index].gateAddress;
        uint24 allowedMints = _getAllowedMintsAndUpdate(
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
        uint8 index,
        address sender,
        uint24 amount,
        uint256 value
    ) internal {
        uint256 msgValue = msg.value;
        require(
            msgValue == getPrice(collection, index) * amount,
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

    /**
     * @dev Get collection pricing object
     * @param collection contract address of the collection
     */
    function getCollectionPricing(
        address collection
    ) external view returns (DutchAuctionPricing[] memory) {
        return pricings[collection];
    }

    /**
     * @dev Get price for collection
     * @param collection contract address of the collection
     */
    function getPrice(
        address collection,
        uint8 index
    ) public view override returns (uint256) {
        DutchAuctionPricing memory pricing = pricings[collection][index];
        CollectionMintParams memory mintParams = collections[collection][index];
        uint48 startTime = mintParams.startTime;
        uint256 startPrice = pricing.startPrice;
        uint48 timestamp = uint48(block.timestamp);
        if (startTime >= timestamp) return startPrice;
        uint8 decrements = pricing.decrements;
        uint256 decrease = pricing.decrease;
        uint256 delay = pricing.delay;
        uint256 duration = timestamp - startTime + 1;
        uint256 steps = (duration / delay) + (duration % delay > 0 ? 1 : 0) - 1;
        steps = steps > decrements ? decrements : steps;

        return
            pricing.auctionType == 0
                ? (startPrice * (PRECISION_FACTOR - (decrease * steps))) /
                    PRECISION_FACTOR
                : (startPrice * ((PRECISION_FACTOR - decrease) ** steps)) /
                    (PRECISION_FACTOR ** steps);
    }
}
