pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/access/Roles.sol";
import "./KYCAdminRole.sol";

/**
 * @title KYCListedRole
 * @dev KYCListed accounts have been approved by a KYCAdmin. This role is special in that the only accounts that can add it are KYCAdmins (who can also remove
 * it), and not KYCListed themselves.
 */
contract KYCListedRole is KYCAdminRole {
    using Roles for Roles.Role;

    event KYClistedAdded(address indexed account);
    event KYClistedRemoved(address indexed account);

    Roles.Role private _kyclisteds;

    modifier onlyKYClisted() {
        require(isKYClisted(msg.sender));
        _;
    }

    function isKYClisted(address account) public view returns (bool) {
        return _kyclisteds.has(account);
    }

    function addKYClisted(address account) public onlyKYCAdmin {
        _addKYClisted(account);
    }

    function removeKYClisted(address account) public onlyKYCAdmin {
        _removeKYClisted(account);
    }

    function renounceKYClisted() public {
        _removeKYClisted(msg.sender);
    }

    function _addKYClisted(address account) internal {
        _kyclisteds.add(account);
        emit KYClistedAdded(account);
    }

    function _removeKYClisted(address account) internal {
        _kyclisteds.remove(account);
        emit KYClistedRemoved(account);
    }
}
