// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IEclipseMinter {
    function mintOne(address collection, uint8 index) external payable;

    function mint(
        address collection,
        uint8 index,
        uint24 amount
    ) external payable;

    function getPrice(
        address collection,
        uint8 index
    ) external view returns (uint256);

    function getAllowedMintsForUser(
        address collection,
        uint8 index,
        address user
    ) external view returns (uint24);

    function setPricing(
        address collection,
        address sender,
        bytes memory data
    ) external;

    function getAvailableSupply(
        address collection,
        uint8 index
    ) external view returns (uint24);
}
