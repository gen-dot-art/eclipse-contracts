// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../access/EclipseAccess.sol";
import "../interface/IEclipseMinter.sol";

/**
 * @dev Eclipse base minter
 */

abstract contract EclipseMinterBase is EclipseAccess, IEclipseMinter {
    struct MintParams {
        uint256 startTime;
        uint256 price;
    }

    address public eclipse;
    address public mintAllocator;

    constructor(address eclipse_, address mintAllocator_) EclipseAccess() {
        eclipse = eclipse_;
        mintAllocator = mintAllocator_;
    }

    /**
     * @dev Set the {Eclipse} contract address
     */
    function setEclipse(address eclipse_) external onlyAdmin {
        eclipse = eclipse_;
    }

    /**
     * @dev Set the {EclipseMintAllocator} contract address
     */
    function setMintAllocator(address mintAllocator_) external onlyAdmin {
        mintAllocator = mintAllocator_;
    }
}
