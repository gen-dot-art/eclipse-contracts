// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../access/EclipseAccess.sol";
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
    address public eclipse;

    constructor(address eclipse_) EclipseAccess() {
        eclipse = eclipse_;
    }

    /**
     * @dev Set the {Eclipse} contract address
     */
    function setEclipse(address eclipse_) external onlyAdmin {
        eclipse = eclipse_;
    }
}
