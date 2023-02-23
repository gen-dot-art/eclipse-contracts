// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library MintAlloc {
    struct State {
        uint8 allowedPerTransaction;
        uint24 allowedPerWallet;
        uint256 minted;
        mapping(address => uint256) mints;
    }

    function getAllowedMints(State storage state, address user)
        internal
        view
        returns (uint256)
    {
        uint256 maxMints = getAllowedMintsForUser(state, user);
        return
            maxMints > state.allowedPerTransaction
                ? state.allowedPerTransaction
                : maxMints;
    }

    function getAllowedMintsForUser(State storage state, address user)
        internal
        view
        returns (uint256)
    {
        return state.allowedPerWallet - state.mints[user];
    }

    function init(
        State storage state,
        uint24 allowedPerWallet,
        uint8 allowedPerTransaction
    ) internal {
        state.allowedPerWallet = allowedPerWallet;
        state.allowedPerTransaction = allowedPerTransaction;
    }

    function update(
        State storage state,
        address user,
        uint256 amount
    ) internal {
        state.mints[user] += amount;
        state.minted += amount;
    }
}
