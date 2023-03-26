// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import {MintAlloc} from "./MintAlloc.sol";
import {EclipseAccess} from "../access/EclipseAccess.sol";
import {Eclipse} from "../app/Eclipse.sol";
import {IEclipseMinter} from "../interface/IEclipseMinter.sol";
import {IEclipseERC721} from "../interface/IEclipseERC721.sol";
import {IEclipseMintGate, UserMint} from "../interface/IEclipseMintGate.sol";
import {IEclipsePaymentSplitter} from "../interface/IEclipsePaymentSplitter.sol";

/**
 * @dev Eclipse Mint Allocator
 */

struct PublicGateParams {
    uint24 allowedPerWallet;
    uint8 allowedPerTransaction;
}

contract EclipseMintGatePublic is EclipseAccess, IEclipseMintGate {
    using MintAlloc for MintAlloc.State;
    mapping(address => mapping(address => mapping(uint256 => MintAlloc.State)))
        public gates;

    /**
     *@dev Initialize mint state for collection
     */
    function _addGateForCollection(
        address collection,
        address minterContract,
        uint8 index,
        uint24 allowedPerWallet,
        uint8 allowedPerTransaction
    ) internal {
        gates[minterContract][collection][index].init(
            allowedPerWallet,
            allowedPerTransaction
        );
    }

    function addGateForCollection(
        address collection,
        address minterContract,
        uint8 index,
        bytes memory data
    ) external override onlyAdmin {
        PublicGateParams memory params = abi.decode(data, (PublicGateParams));
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
        _addGateForCollection(
            collection,
            minterContract,
            index,
            allowedPerWallet,
            allowedPerTransaction
        );
    }

    /**
     *@dev Update mint state
     */
    function update(
        address collection,
        address minterContract,
        uint8 index,
        address user,
        uint24 amount
    ) external override onlyAdmin {
        gates[minterContract][collection][index].update(user, amount);
    }

    /**
     *@dev Get allowed mints for collection
     */
    function getAllowedMints(
        address collection,
        address minterContract,
        uint8 index,
        address user
    ) public view override returns (uint24) {
        return gates[minterContract][collection][index].getAllowedMints(user);
    }

    /**
     *@dev Get allowed mints and amount of minted tokens for collection
     */
    function getUserMint(
        address collection,
        address minterContract,
        uint8 index,
        address user
    ) public view override returns (UserMint memory) {
        MintAlloc.State storage mintAlloc = gates[minterContract][collection][
            index
        ];
        return UserMint(mintAlloc.getAllowedMints(user), mintAlloc.minted);
    }

    function isUserAllowed(
        address collection,
        address minterContract,
        uint8 index,
        address user
    ) external view override returns (bool) {
        return
            gates[minterContract][collection][index].getAllowedMints(user) > 0;
    }

    function getTotalMinted(
        address collection,
        address minterContract,
        uint8 index
    ) external view override returns (uint24) {
        return gates[minterContract][collection][index].minted;
    }

    function getGateState(
        address collection,
        address minterContract,
        uint8 index
    )
        external
        view
        returns (
            uint8 allowedPerTransaction,
            uint24 allowedPerWallet,
            uint24 minted
        )
    {
        MintAlloc.State storage mintAlloc = gates[minterContract][collection][
            index
        ];
        return (
            mintAlloc.allowedPerTransaction,
            mintAlloc.allowedPerWallet,
            mintAlloc.minted
        );
    }
}
