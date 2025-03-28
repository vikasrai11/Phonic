// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IPFSStorage {
    mapping(string => string) private ipfsHashes;
    string[] private names;
    address private owner;

    // Set the contract deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict access to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Store the IPFS hash with a name (only owner can add)
    function setIPFSHash(
        string memory _name,
        string memory _ipfsHash
    ) public onlyOwner {
        require(bytes(ipfsHashes[_name]).length == 0, "Name already exists");
        ipfsHashes[_name] = _ipfsHash;
        names.push(_name);
    }

    // Retrieve the IPFS hash by name (only owner can retrieve)
    function getIPFSHash(
        string memory _name
    ) public view onlyOwner returns (string memory) {
        require(bytes(ipfsHashes[_name]).length != 0, "Name does not exist");
        return ipfsHashes[_name];
    }

    // Get the total number of stored IPFS hashes (only owner can check)
    function getIPFSHashCount() public view onlyOwner returns (uint) {
        return names.length;
    }
}
