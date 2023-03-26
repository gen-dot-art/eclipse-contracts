// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../access/EclipseAccess.sol";
import "../app/Eclipse.sol";
import "../interface/IEclipseMinter.sol";
import "../interface/IEclipseMintGate.sol";

/**
 * @dev Eclipse base minter
 */

struct GateParams {
    uint8 gateType;
    bytes gateCalldata;
}

abstract contract EclipseMinterBase is EclipseAccess, IEclipseMinter {
    struct CollectionMintParams {
        address artist;
        uint48 startTime;
        uint48 endTime;
        uint24 maxSupply;
        address gateAddress;
        uint8 gateType;
    }

    struct CollectionState {
        CollectionMintParams params;
        uint24 minted;
        uint24 available;
    }
    Eclipse public eclipse;

    mapping(address => CollectionMintParams[]) public collections;

    constructor(address eclipse_) EclipseAccess() {
        eclipse = Eclipse(eclipse_);
    }

    /**
     * @dev Set the {Eclipse} contract address
     */
    function setEclipse(address eclipse_) external onlyAdmin {
        eclipse = Eclipse(eclipse_);
    }

    function _getAvailableSupply(
        address collection,
        uint8 index
    ) internal view returns (uint24) {
        address gateAddress = collections[collection][index].gateAddress;
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint24 minted = gate.getTotalMinted(collection, address(this), index);

        return collections[collection][index].maxSupply - minted;
    }

    function getAllowedMintsForUser(
        address collection,
        uint8 index,
        address user
    ) external view override returns (uint24) {
        address gateAddress = collections[collection][index].gateAddress;
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint24 minted = gate.getTotalMinted(collection, address(this), index);
        uint24 mints = gate.getAllowedMints(
            collection,
            address(this),
            index,
            user
        );
        uint24 availableSupply = collections[collection][index].maxSupply -
            minted;

        return mints > availableSupply ? availableSupply : mints;
    }

    function getAvailableSupply(
        address collection,
        uint8 index
    ) external view override returns (uint24) {
        return _getAvailableSupply(collection, index);
    }

    function getCollectionState(
        address collection
    ) external view returns (CollectionState[] memory) {
        CollectionMintParams[] memory params = collections[collection];
        CollectionState[] memory returnArr = new CollectionState[](
            params.length
        );
        for (uint8 i; i < params.length; i++) {
            uint24 minted = IEclipseMintGate(params[i].gateAddress)
                .getTotalMinted(collection, address(this), i);
            returnArr[i] = CollectionState(
                params[i],
                minted,
                _getAvailableSupply(collection, i)
            );
        }

        return returnArr;
    }

    /**
     * @dev Helper function to check for mint price and start date
     */
    function _checkState(
        address collection,
        uint8 index
    ) internal view virtual {
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
        uint8 index,
        address minter,
        address gateAddress,
        address sender,
        uint24 amount
    ) internal view returns (uint24) {
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint24 allowedMints = gate.getAllowedMints(
            collection,
            minter,
            index,
            sender
        );
        require(allowedMints > 0, "no mints available");
        uint24 minted = gate.getTotalMinted(collection, minter, index);
        uint24 availableSupply = collections[collection][index].maxSupply -
            minted;
        require(availableSupply > 0, "sold out");
        uint24 mints = amount > allowedMints ? allowedMints : amount;

        return mints > availableSupply ? availableSupply : mints;
    }

    /**
     * @dev Helper function to check for available mints for sender
     */
    function _getAllowedMintsAndUpdate(
        address collection,
        uint8 index,
        address minter,
        address gateAddress,
        address sender,
        uint24 amount
    ) internal returns (uint24) {
        IEclipseMintGate gate = IEclipseMintGate(gateAddress);
        uint24 minted = _getAllowedMints(
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
}
