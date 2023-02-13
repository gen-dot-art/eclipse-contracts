// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IEclipseMinter {
    function mintOne(address collection) external payable;

    function mint(address collection, uint256 amount) external payable;

    function getPrice(address collection) external view returns (uint256);

    function setPricing(address collection, bytes memory data) external;
}
