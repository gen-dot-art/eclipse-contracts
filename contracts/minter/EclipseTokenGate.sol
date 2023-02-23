// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../access/EclipseAccess.sol";
import "../interface/IEclipseMinter.sol";
import "../interface/IEclipseMintGate.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

/**
 * @dev Eclipse base minter
 */

struct TokenGateParams {
    address contractAddress;
    uint256 amount;
}

contract EclipseTokenGate is EclipseAccess {
    mapping(address => mapping(address => TokenGateParams)) tokenGates;

    function addGateForCollection(
        address collection,
        address minterContract,
        TokenGateParams calldata gate
    ) external onlyAdmin {
        tokenGates[collection][minterContract] = gate;
    }

    /**
     * @dev Set pricing for collection
     * @param collection contract address of the collection
     * @param data `TokenGateParams` struct
     */
    function addGateForCollection(
        address collection,
        address minterContract,
        bytes memory data
    ) external onlyAdmin {
        TokenGateParams memory gate = abi.decode(data, (TokenGateParams));
        _addGateForCollection(collection, minterContract, gate);
    }

    function isGated(address collection, address minterContract)
        external
        view
        returns (bool)
    {
        return
            tokenGates[collection][minterContract].contractAddress !=
            address(0);
    }

    function isUserAllowed(
        address collection,
        address minterContract,
        address user
    ) external view returns (bool) {
        TokenGateParams memory params = tokenGates[collection][minterContract];
        return IERC721(params.contractAddress).balanceOf(user) > params.amount;
    }

    function _addGateForCollection(
        address collection,
        address minterContract,
        TokenGateParams memory gate
    ) internal {
        tokenGates[collection][minterContract] = gate;
    }
}
