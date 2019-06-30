pragma solidity ^0.5.7;

import "../WhiteListTokenAccess.sol";

/**
 * A testable version for RegulationDTokenAccess
 */
contract WhiteListTokenAccessTestable is WhiteListTokenAccess{

  /**
   * Check if address is KYC admin or owner
   * @param account the address to verify
   */
  function test_isKYCAdmin(address account) public view returns (bool) {
      return super.isKYCAdmin(account);
  }

  /**
   * Remove a kyc admin
   * @param account the address to remove
   */
  function test_removeKYCAdmin(address account) public {
      super.removeKYCAdmin(account);
  }

  /**
   * Check if the investor is KYC approved and also accredited
   * @param _investorAddress the investor address
   */
  function test_isFreeInvestor(address _investorAddress) public view returns (bool) {
    return super.isFreeInvestor(_investorAddress);
  }

}
