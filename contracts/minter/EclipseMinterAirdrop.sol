// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import {Eclipse} from "../app/Eclipse.sol";
import {IEclipseERC721} from "../interface/IEclipseERC721.sol";
import {IEclipseMintGate} from "../interface/IEclipseMintGate.sol";
import {IEclipsePaymentSplitter} from "../interface/IEclipsePaymentSplitter.sol";
import {EclipseMinterBase} from "./EclipseMinterBase.sol";

/**
 * @dev Eclipse Airdrop Minter
 * Admin for collections deployed on {Eclipse}
 */

contract EclipseMinterAirdrop is EclipseMinterBase {
    struct AirdropParams {
        address artist;
        uint24 maxSupply;
    }

    mapping(address => AirdropParams) public airdropCollections;
    mapping(address => uint256) public minted;

    event PricingSet(
        address collection,
        CollectionMintParams mint,
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
        AirdropParams memory params = abi.decode(data, (AirdropParams));
        address artist = params.artist;
        require(sender == artist, "invalid collection");
        uint24 maxSupply = params.maxSupply;
        require(maxSupply > 0, "maxSupply must be greater 0");
        airdropCollections[collection] = params;
        emit PricingSet(
            collection,
            CollectionMintParams(artist, 0, 0, maxSupply, address(0), 0),
            0
        );
    }

    /**
     * @dev Helper function to check for sender and supply
     */
    function _checkState(address collection, uint256 amount) internal view {
        require(
            _msgSender() == airdropCollections[collection].artist,
            "only artist allowed"
        );
        require(
            minted[collection] + amount <=
                airdropCollections[collection].maxSupply,
            "exceeds max supply"
        );
    }

    /**
     * @dev Get price for collection
     */
    function getPrice(address, uint8) public pure override returns (uint256) {
        return 0;
    }

    /**
     * @dev Mint a token
     */
    function mintOne(address, uint8) external payable override {
        revert("not implemented");
    }

    /**
     * @dev Mint a token
     */
    function mint(address, uint8, uint24) external payable override {
        revert("not implemented");
    }

    /**
     * @dev Airdrop tokens to users
     * @param collection contract address of the collection
     * @param users addresses of users
     */
    function airdrop(
        address collection,
        address[] memory users
    ) external payable {
        uint256 amount = users.length;
        _checkState(collection, amount);
        for (uint256 i; i < amount; i++) {
            IEclipseERC721(collection).mintOne(users[i]);
        }
        minted[collection] += amount;
    }

    /**
     * @dev Get collection pricing object
     */
    function getCollectionPricing(address) external pure returns (uint256) {
        return 0;
    }
}
