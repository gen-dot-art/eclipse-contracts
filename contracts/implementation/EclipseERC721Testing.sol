// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./EclipseERC721.sol";

/**
 * @dev Eclipse ERC721 V4 for Testing
 * Implements the extentions {IERC721Enumerable} and {IERC2981}.
 * Inherits access control from {EclipseAccess}.
 */

contract EclipseERC721Testing is EclipseERC721 {
    /**
     *@dev Function to test token minting
     */
    function mintTesting() external onlyAdmin {
        _mintOne(_msgSender());
    }
}
