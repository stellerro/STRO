pragma solidity ^0.5.7;

import "../WhiteListToken.sol";

/**
 * A testable version for WhiteListToken
 */
contract WhiteListTokenTestable is WhiteListToken{

  constructor(uint256 cap) WhiteListToken(cap) public {
  }

  function test_canInvestorBuy(address _investorAddress)  public view returns (bool){
    return super.canInvestorBuy(_investorAddress);
  }

  function test_canInvestorSell(address _investorAddress) public view returns (bool){
    return super.canInvestorSell(_investorAddress);
  }

}
