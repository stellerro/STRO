pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "./WhiteListTokenAccess.sol";

/**
 * The token adhering a WhiteList rules.
 */
contract WhiteListToken is WhiteListTokenAccess, ERC20Capped, ERC20Burnable{

    bool public mintingFinished = false;

    event MintFinished();
    event Restore(address indexed from, address indexed to, uint256 value);

    modifier canMint() {
      require(!mintingFinished);
      _;
    }

    modifier canTransfer() {
      require(mintingFinished);
      _;
    }

    constructor(uint256 cap) ERC20Capped(cap) public {
    }

    /**
     * Check if the investor is allowed to buy tokens
     * @param investorAddress the investor address
     */
    function canInvestorBuy(address investorAddress)  internal view returns (bool){
      return isFreeInvestor(investorAddress);
    }

    /**
     * Check if the investor is allowed to sell tokens
     * @param investorAddress the investor address
     */
    function canInvestorSell(address investorAddress) internal view returns (bool){
      return isFreeInvestor(investorAddress);
    }

    /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
    function finishMinting() onlyOwner canMint public returns (bool) {
      mintingFinished = true;
      emit MintFinished();
      return true;
    }

    function mint(address to, uint256 value) public onlyMinter canMint returns (bool) {
        super.mint(to, value);
        return true;
    }

    function approveAndMint(address to, uint256 value) public onlyMinter canMint returns (bool) {
        super.addKYClisted(to);
        super.mint(to, value);
        return true;
    }

    /**
    * @dev Transfer tokens from one address to another
    * @param from address The address which you want to send tokens from
    * @param to address The address which you want to transfer to
    * @param value uint256 the amount of tokens to be transferred
    */
    function transferFrom(
        address from,
        address to,
        uint256 value
    )
        public
        canTransfer
        returns (bool)
    {
        require(canInvestorBuy(to), "Buying investor is not allowed to buy");
        require(canInvestorSell(from), "Selling investor is not allowed to sell");
        return super.transferFrom(from,to,value);
    }

    /**
    * @dev Transfer token for a specified address
    * @param to The address to transfer to.
    * @param value The amount to be transferred.
    */
    function transfer(address to, uint256 value) public canTransfer returns (bool) {
        require(canInvestorBuy(to), "Buying investor is not allowed to buy");
        require(canInvestorSell(msg.sender), "Selling investor is not allowed to sell");
        return super.transfer(to,value);
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param value The amount of token to be burned.
     */
    function burn(uint256 value) onlyOwner public {
        super.burn(value);
    }

    /**
     * @dev Burns a specific amount of tokens from the target address and decrements allowance
     * @param from address The address which you want to send tokens from
     * @param value uint256 The amount of token to be burned
     */
    function burnFrom(address from, uint256 value) onlyOwner public {
        super.burnFrom(from, value);
    }

    /**
    * @dev restore tokens from one address to another.
    * to use only in case a user cannot access its token.
    * @param from address The old user's address
    * @param to address The new user's address
    */
    function restoreTokens(address from, address to) onlyOwner public returns (bool)
    {
        require(to != address(0));

        if(!isKYClisted(to)) {
          addKYClisted(to);
        }
        
        uint256 value = balanceOf(from);
        _transfer(from, to, value);

        emit Restore(from, to, value);
        return true;
    }

}
