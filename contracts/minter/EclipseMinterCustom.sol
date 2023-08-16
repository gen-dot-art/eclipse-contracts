pragma solidity ^0.8.0;
import {IEclipseERC721} from "../interface/IEclipseERC721.sol";

contract EclipseMinterCustom {
    uint256 _price = 0.1 ether;
    address _collectionAddress;

    constructor(address collectionAddress) {
        _collectionAddress = collectionAddress;
    }

    function checkMinting(uint24 amount) internal view {
        /**
         * add logic to verify whether user is eligible to mint
         */
        // verify if user send sufficient funds
        require(msg.value == _price * amount, "insufficient funds sent");
    }

    /** Mint many tokens */
    function mint(uint24 amount) public payable {
        checkMinting(amount);
        IEclipseERC721(_collectionAddress).mint(msg.sender, amount);
    }

    /** Mint one token */
    function mint() public payable {
        checkMinting(1);
        IEclipseERC721(_collectionAddress).mintOne(msg.sender);
    }
}
