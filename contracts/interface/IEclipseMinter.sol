// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IEclipseMinter {
    function mintOne(address collection, uint256 index) external payable;

    function mint(
        address collection,
        uint256 index,
        uint256 amount
    ) external payable;

    function getPrice(address collection, uint256 index)
        external
        view
        returns (uint256);

    function getAllowedMintsForUser(
        address collection,
        uint256 index,
        address user
    ) external view returns (uint256);

    function setPricing(address collection, bytes memory data) external;

    function getAvailableSupply(address collection, uint256 index)
        external
        view
        returns (uint256);
}
