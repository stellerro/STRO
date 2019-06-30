let WhiteListTokenAccess = artifacts.require("./WhiteListTokenAccess.sol");
let WhiteListToken = artifacts.require("./WhiteListToken.sol");
let StellerroESToken = artifacts.require("./StellerroESToken.sol");

module.exports = async (deployer, network, accounts) => {

  if (network == "development") {
    let admin = accounts[0];

    deployer.deploy(WhiteListTokenAccess,{from:admin});
    //deployer.deploy(RegulationDToken,{from:admin});
    //deployer.deploy(MerkspaceToken,{from:admin});

  }else{
    let admin = accounts[0];
    deployer.deploy(StellerroESToken,8000000,'Stellerro spain token', 'STRO', 0);
  }

}
