// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20PresetFixedSupply} from "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "../access/EclipseAccess.sol";

contract MockERC20 is ERC20PresetFixedSupply, EclipseAccess {
    constructor(address owner_)
        ERC20PresetFixedSupply(
            "Mock Token",
            "MOCK",
            1_000_000_000 * 10**18,
            owner_
        )
    {
        transferOwnership(owner_);
    }
}
