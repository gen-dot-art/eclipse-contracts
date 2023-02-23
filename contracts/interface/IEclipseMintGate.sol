// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IEclipseMintGate {
    function getAllowedMints(
        address collection,
        address minterContract,
        uint256 index,
        address user
    ) external view returns (uint256);

    function update(
        address collection,
        address minterContract,
        uint256 index,
        address user,
        uint256 amount
    ) external;

    function isUserAllowed(
        address collection,
        address minterContract,
        uint256 index,
        address user
    ) external view returns (bool);

    function addGateForCollection(
        address collection,
        address minterContract,
        uint256 index,
        bytes memory data
    ) external;

    function getTotalMinted(
        address collection,
        address minterContract,
        uint256 index
    ) external view returns (uint256);
}
