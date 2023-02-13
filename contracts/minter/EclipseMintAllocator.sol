// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./MintAlloc.sol";
import "../access/EclipseAccess.sol";
import "../app/Eclipse.sol";
import "../interface/IEclipseMinter.sol";
import "../interface/IEclipseERC721.sol";
import "../interface/IEclipsePaymentSplitter.sol";

/**
 * @dev Eclipse Mint Allocator
 */

contract EclipseMintAllocator is EclipseAccess {
    using MintAlloc for MintAlloc.State;

    mapping(address => MintAlloc.State) public mintstates;

    /**
     *@dev Initialize mint state for collection
     */
    function init(
        address collection,
        uint8 allowedPerTransaction,
        uint24 allowedPerWallet
    ) external onlyAdmin {
        mintstates[collection].init(allowedPerTransaction, allowedPerWallet);
    }

    /**
     *@dev Get allowed mints for collection
     */
    function getAllowedMints(address collection, address user)
        external
        view
        returns (uint256)
    {
        return mintstates[collection].getAllowedMints(user);
    }
}
