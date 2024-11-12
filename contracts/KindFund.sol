// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGruntFund {
    function mint(address recipient, uint256 amount, string memory documentHash) external;
}

/// This is a utility contract which needs to be given permission to mint tokens 
/// for managed grunt funds (including an umbrella holding fund)
/// @title KindFund - A contract that interacts with GruntFund contracts to mint tokens.
/// @notice This contract allows minting tokens in associated GruntFund contracts.
/// @dev Implements access control for the owner and maintains a list of GruntFund addresses.
contract KindFund {
    /// @notice The address of the primary GruntFund contract for the holding company 
    address public kindFund;

    /// @notice The list of all associated GruntFund addresses
    address[] public allFunds;

    /// @notice The owner of the contract
    address public owner;

    /// @dev Emitted when minting is performed via the KindFund
    event Minted(
        address indexed person,
        address indexed fundAddress,
        uint256 amount,
        string documentHash
    );

    /// @notice Modifier to restrict access to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /// @param _kindFund The address of the primary GruntFund contract
    constructor(address _kindFund) {
        require(_kindFund != address(0), "KindFund address cannot be zero");
        kindFund = _kindFund;
        owner = msg.sender;
    }

    /// @notice Checks if a GruntFund address is already in the list
    /// @param fundAddress The address to check
    /// @return True if the address exists in the list, false otherwise
    function _fundExists(address fundAddress) internal view returns (bool) {
        for (uint256 i = 0; i < allFunds.length; i++) {
            if (allFunds[i] == fundAddress) {
                return true;
            }
        }
        return false;
    }

    /// @notice Adds a new GruntFund address to the list if it does not already exist
    /// @param fundAddress The GruntFund address to add
    function _addFundIfNotExists(address fundAddress) internal {
        if (!_fundExists(fundAddress)) {
            allFunds.push(fundAddress);
        }
    }

    /// gives the person equity in the KindFund, and the KindFund equity in the fundAddress
    /// @notice Mints tokens for a given person and fund
    /// @param person The recipient of the minted tokens in the KindFund
    /// @param fundAddress The address of the GruntFund to mint tokens for
    /// @param amount The amount of tokens to mint
    /// @param documentHash A hash representing supporting documentation
    /// @dev Can only be called by the contract owner
    function mint(
        address person,
        address fundAddress,
        uint256 amount,
        string memory documentHash
    ) external onlyOwner {
        require(person != address(0), "Recipient address cannot be zero");
        require(fundAddress != address(0), "Fund address cannot be zero");
        require(fundAddress != kindFund, "Trying to treat the kind fund (group) as an underlying fund. Use the kind fund directly to book equity if that's what is intended");
        require(amount > 0, "Mint amount must be greater than zero");

        // Add the fund to the list if it doesn't already exist
        _addFundIfNotExists(fundAddress);

        // Allocate tokens to this account
        IGruntFund(fundAddress).mint(kindFund, amount, documentHash);

        // given the person tokens in our primary KindFund
        IGruntFund(kindFund).mint(person, amount, documentHash);

        // Emit the Minted event
        emit Minted(person, fundAddress, amount, documentHash);
    }

    /// @notice Returns the list of all associated GruntFund addresses
    /// @return An array of GruntFund addresses
    function getAllFunds() external view returns (address[] memory) {
        return allFunds;
    }
}
