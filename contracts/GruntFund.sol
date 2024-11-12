// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title GruntFund - A contract for tracking token allocations and balances
/// @author 
/// @notice This contract allows minting, transferring, and force-transferring tokens with specific permissions.
/// @dev Uses Solidity 0.8.0 or higher to handle arithmetic without SafeMath.

contract GruntFund {
    /// @notice The name of the token
    string public name;

    /// @notice The symbol of the token
    string public symbol;

    /// @notice The address of the contract owner
    address public owner;

    /// @notice Mapping of balances by address
    mapping(address => uint256) public balancesByAddress;

    /// @notice List of all addresses with balances
    address[] public addresses;

    /// @notice List of allowed minter addresses
    mapping(address => bool) public allowedMinters;

    /// @dev Emitted when a new minter is added
    event MinterAdded(address indexed minter);

    /// @dev Emitted when a minter is removed
    event MinterRemoved(address indexed minter);

    /// @dev Emitted when tokens are allocated
    event Allocated(address indexed recipient, uint256 amount, string documentHash);

    /// @dev Emitted when tokens are transferred
    event Transfer(address indexed from, address indexed to, uint256 amount, string documentHash);

    /// @dev Emitted when a forced transfer occurs
    event ForcedTransfer(address indexed from, address indexed to, uint256 amount);

    /// @param _name The name of the token
    /// @param _symbol The symbol of the token
    /// @param _owner The address of the contract owner
    constructor(string memory _name, string memory _symbol, address _owner) {
        name = _name;
        symbol = _symbol;
        owner = _owner;
        allowedMinters[_owner] = true;
    }

    /// @notice Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /// @notice Modifier to restrict access to allowed minters
    modifier onlyMinters() {
        require(allowedMinters[msg.sender], "Caller is not an allowed minter");
        _;
    }

    /// @notice Adds a new minter address
    /// @param allowedAddress The address to be added as a minter
    /// @dev Can only be called by an existing allowed minter
    function addMinter(address allowedAddress) external onlyMinters {
        allowedMinters[allowedAddress] = true;
        emit MinterAdded(allowedAddress);
    }

    /// @notice Removes an allowed minter
    /// @param minter The address to be removed from allowed minters
    /// @dev Can only be called by the contract owner
    function removeMinter(address minter) external onlyOwner {
        allowedMinters[minter] = false;
        emit MinterRemoved(minter);
    }

    /// @notice Mints tokens to a recipient
    /// @param recipient The address to receive the tokens
    /// @param amount The amount of tokens to mint
    /// @param documentHash A hash representing supporting documentation
    /// @dev Can only be called by allowed minters
    function mint(address recipient, uint256 amount, string memory documentHash) external onlyMinters {
        balancesByAddress[recipient] += amount;
        if (!_addressExists(recipient)) {
            addresses.push(recipient);
        }
        emit Allocated(recipient, amount, documentHash);
    }

    /// @notice Transfers tokens to another address
    /// @param to The address to transfer tokens to
    /// @param amount The amount of tokens to transfer
    /// @param documentHash A hash representing supporting documentation
    /// @dev Can be called by the sender or an allowed minter
    function transfer(address to, uint256 amount, string memory documentHash) external {
        require(msg.sender == owner || msg.sender == to || allowedMinters[msg.sender], "Unauthorized transfer");
        require(balancesByAddress[msg.sender] >= amount, "Insufficient balance");

        balancesByAddress[msg.sender] -= amount;
        balancesByAddress[to] += amount;

        if (!_addressExists(to)) {
            addresses.push(to);
        }

        emit Transfer(msg.sender, to, amount, documentHash);
    }

    /// @notice Forcefully transfers tokens from one address to another
    /// @param from The address to deduct tokens from
    /// @param to The address to transfer tokens to
    /// @param amount The amount of tokens to transfer
    /// @dev Can only be called by the contract owner
    function forceTransfer(address from, address to, uint256 amount) external onlyOwner {
        require(balancesByAddress[from] >= amount, "Insufficient balance");

        balancesByAddress[from] -= amount;
        balancesByAddress[to] += amount;

        if (!_addressExists(to)) {
            addresses.push(to);
        }

        emit ForcedTransfer(from, to, amount);
    }

    /// @notice Checks if an address already exists in the addresses array
    /// @param addr The address to check
    /// @return True if the address exists, false otherwise
    function _addressExists(address addr) internal view returns (bool) {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == addr) {
                return true;
            }
        }
        return false;
    }

    /// @notice Returns the list of all addresses with balances
    /// @return An array of addresses
    function getAllAddresses() external view returns (address[] memory) {
        return addresses;
    }
}
