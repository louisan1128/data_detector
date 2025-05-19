// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract dataDetector {
    string public icd; 

    event CIDupdate(string oldCID, string newCID);

    function updateCID(string calldata newCID) external {
        string memory oldcid = cid;
        cid = newCID;
        emit CIDUpdate(oldCID, newCID);
    }
}
