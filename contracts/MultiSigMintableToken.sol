
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MultiSigMintableToken is ERC20 {
    address public owner;
    mapping(address => bool) public isAdmin;
    uint256 public requiredApprovals;

    struct MintRequest {
        address to;
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) approved;
        bool executed;
    }

    MintRequest[] public mintRequests;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event MintRequested(uint256 indexed requestId, address indexed to, uint256 amount);
    event MintApproved(uint256 indexed requestId, address indexed admin);
    event MintExecuted(uint256 indexed requestId, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can execute this");
        _;
    }

    constructor(string memory name, string memory symbol, uint256 _requiredApprovals) ERC20(name, symbol) {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        requiredApprovals = _requiredApprovals;
    }

    function addAdmin(address admin) external onlyOwner {
        require(!isAdmin[admin], "Address is already an admin");
        isAdmin[admin] = true;
        emit AdminAdded(admin);
    }

    function removeAdmin(address admin) external onlyOwner {
        require(isAdmin[admin], "Address is not an admin");
        isAdmin[admin] = false;
        emit AdminRemoved(admin);
    }

    function requestMint(address to, uint256 amount) external onlyAdmin {
        MintRequest storage newRequest = mintRequests.push();
        newRequest.to = to;
        newRequest.amount = amount;
        newRequest.approvals = 0;
        newRequest.executed = false;

        emit MintRequested(mintRequests.length - 1, to, amount);
    }

    function approveMint(uint256 requestId) external onlyAdmin {
        MintRequest storage request = mintRequests[requestId];
        require(!request.executed, "Mint request already executed");
        require(!request.approved[msg.sender], "Admin already approved");

        request.approved[msg.sender] = true;
        request.approvals += 1;

        emit MintApproved(requestId, msg.sender);

        if (request.approvals >= requiredApprovals) {
            _executeMint(requestId);
        }
    }

    function _executeMint(uint256 requestId) internal {
        MintRequest storage request = mintRequests[requestId];
        require(!request.executed, "Mint request already executed");

        request.executed = true;
        _mint(request.to, request.amount);

        emit MintExecuted(requestId, request.to, request.amount);
    }

    function getMintRequestsCount() external view returns (uint256) {
        return mintRequests.length;
    }

    function getMintRequest(uint256 requestId) external view returns (address to, uint256 amount, uint256 approvals, bool executed) {
        MintRequest storage request = mintRequests[requestId];
        return (request.to, request.amount, request.approvals, request.executed);
    }
}
