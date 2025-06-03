// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract dataDetector is Ownable {
    string[] public cids; 

    event CIDAdd(string cid, uint timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function addCID(string calldata cid) external {
        cids.push(cid);
        emit CIDAdd(cid, block.timestamp);
    }
}

