// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import {EclipseAccess} from "../access/EclipseAccess.sol";
import {IEclipseMinter} from "../interface/IEclipseMinter.sol";
import {IEclipseMintGate, UserMint} from "../interface/IEclipseMintGate.sol";
import {MintAllocERC721} from "./MintAllocERC721.sol";
import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";

/**
 * @dev Eclipse base minter
 */

struct ERC721GateParams {
    address erc721;
    uint8 minTokensOwned;
    uint8 allowedPerTokenOwned;
}

contract EclipseMintGateERC721 is EclipseAccess, IEclipseMintGate {
    using MintAllocERC721 for MintAllocERC721.State;
    mapping(address => mapping(address => mapping(uint8 => MintAllocERC721.State)))
        public gates;

    /**
     * @dev Set pricing for collection
     * @param collection contract address of the collection
     * @param data `ERC721GateParams` struct
     */
    function addGateForCollection(
        address collection,
        address minterContract,
        uint8 index,
        bytes memory data
    ) external override onlyAdmin {
        ERC721GateParams memory gate = abi.decode(data, (ERC721GateParams));
        _addGateForCollection(collection, minterContract, index, gate);
    }

    function _addGateForCollection(
        address collection,
        address minterContract,
        uint8 index,
        ERC721GateParams memory gate
    ) internal {
        gates[minterContract][collection][index].init(
            gate.erc721,
            gate.minTokensOwned,
            gate.allowedPerTokenOwned
        );
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
        MintAllocERC721.State storage mintAlloc = gates[minterContract][
            collection
        ][index];
        return UserMint(mintAlloc.getAllowedMints(user), mintAlloc.minted);
    }

    function update(
        address collection,
        address minterContract,
        uint8 index,
        address user,
        uint24 amount
    ) external override {
        gates[minterContract][collection][index].update(user, amount);
    }

    function getGateState(
        address collection,
        address minterContract,
        uint8 index
    )
        external
        view
        returns (
            uint8 minTokensOwned,
            uint8 allowedPerTokenOwned,
            uint24 minted,
            address erc721
        )
    {
        MintAllocERC721.State storage mintAlloc = gates[minterContract][
            collection
        ][index];
        return (
            mintAlloc.minTokensOwned,
            mintAlloc.allowedPerTokenOwned,
            mintAlloc.minted,
            mintAlloc.erc721
        );
    }
}
