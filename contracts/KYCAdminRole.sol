pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/access/Roles.sol";

/**
 * @title KYCAdminRole
 * @dev KYCAdmins are responsible for assigning and removing KYClisted accounts.
 */
contract KYCAdminRole {
    using Roles for Roles.Role;

    event KYCAdminAdded(address indexed account);
    event KYCAdminRemoved(address indexed account);

    Roles.Role private _kycAdmins;

    constructor () internal {
        _addKYCAdmin(msg.sender);
    }

    modifier onlyKYCAdmin() {
        require(isKYCAdmin(msg.sender));
        _;
    }

    function isKYCAdmin(address account) public view returns (bool) {
        return _kycAdmins.has(account);
    }

    function addKYCAdmin(address account) public onlyKYCAdmin {
        _addKYCAdmin(account);
    }

    function renounceKYCAdmin() public {
        _removeKYCAdmin(msg.sender);
    }

    function removeKYCAdmin(address account) public {
        _removeKYCAdmin(account);
    }

    function _addKYCAdmin(address account) internal {
        _kycAdmins.add(account);
        emit KYCAdminAdded(account);
    }

    function _removeKYCAdmin(address account) internal {
        _kycAdmins.remove(account);
        emit KYCAdminRemoved(account);
    }
}
