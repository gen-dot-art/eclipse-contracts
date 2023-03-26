// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/interfaces/IERC721Enumerable.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

library MintAllocERC721 {
    struct State {
        uint8 minTokensOwned;
        uint8 allowedPerTokenOwned;
        uint24 minted;
        address erc721;
        mapping(uint256 => uint24) mints;
    }

    function getTokensOfUser(
        State storage state,
        address user
    ) internal view returns (uint256[] memory tokens) {
        uint256 balance = IERC721(state.erc721).balanceOf(user);
        tokens = new uint256[](balance);
        for (uint256 i; i < balance; i++) {
            tokens[i] = IERC721Enumerable(state.erc721).tokenOfOwnerByIndex(
                user,
                i
            );
        }
    }

    function getAllowedMints(
        State storage state,
        address user
    ) internal view returns (uint24) {
        return getAllowedMintsForUser(state, user);
    }

    function getAllowedMintsForUser(
        State storage state,
        address user
    ) internal view returns (uint24 available) {
        uint256 balance = IERC721(state.erc721).balanceOf(user);
        if (balance < state.minTokensOwned) return available;
        for (uint256 i; i < balance; i++) {
            uint256 id = IERC721Enumerable(state.erc721).tokenOfOwnerByIndex(
                user,
                i
            );
            available += state.allowedPerTokenOwned - state.mints[id];
        }
    }

    function init(
        State storage state,
        address erc721,
        uint8 minTokensOwned,
        uint8 allowedPerTokenOwned
    ) internal {
        state.minTokensOwned = minTokensOwned;
        state.allowedPerTokenOwned = allowedPerTokenOwned;
        state.erc721 = erc721;
    }

    function update(State storage state, address user, uint24 amount) internal {
        uint24 assigned;
        uint24 i;
        while (assigned < amount) {
            uint256 id = IERC721Enumerable(state.erc721).tokenOfOwnerByIndex(
                user,
                i
            );
            uint24 remaining = amount - assigned;
            uint24 assignedAmount = remaining > state.allowedPerTokenOwned
                ? state.allowedPerTokenOwned
                : remaining;
            state.mints[id] += assignedAmount;
            assigned += assignedAmount;
            i++;
        }
        state.minted += amount;
    }
}
