pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./WhiteListToken.sol";

contract StellerroESToken is WhiteListToken, ERC20Detailed{

    constructor(uint256 cap, string memory name, string memory symbol, uint8 decimals)
      WhiteListToken(cap)
      ERC20Detailed(name, symbol, decimals)
    public {
    }

}
