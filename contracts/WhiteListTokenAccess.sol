pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./KYCListedRole.sol";

/**
 * contains roles for regular whitelisted token
 */
contract WhiteListTokenAccess is Ownable, KYCListedRole{

  /**
   * Add a kyc admin
   * @param account the address to add
   */
  function addKYCAdmin(address account) public onlyOwner{
      super.addKYCAdmin(account);
  }

  /**
   * Remove a kyc admin
   * @param account the address to remove
   */
  function removeKYCAdmin(address account) public onlyOwner{
      super.removeKYCAdmin(account);
  }

  /**
   * Check if the investor is KYC approved and also accredited
   * @param investorAddress the investor address
   */
  function isFreeInvestor(address investorAddress) public view returns (bool) {
    return isKYClisted(investorAddress);
    /* if(!isKYClisted(_investorAddress)){
        return false;
    }

    return true; */
  }
}
