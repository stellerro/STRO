let WhiteListTokenAccess = artifacts.require("./WhiteListTokenAccess.sol");
let WhiteListToken = artifacts.require("./WhiteListToken.sol");
let StellerroToken = artifacts.require("./StellerroToken.sol");

module.exports = async (deployer, network, accounts) => {

  if (network == "development") {
    let admin = accounts[0];

    deployer.deploy(WhiteListTokenAccess,{from:admin});
    //deployer.deploy(RegulationDToken,{from:admin});
    //deployer.deploy(MerkspaceToken,{from:admin});

  }else{
    let admin = accounts[0];
    deployer.deploy(StellerroToken,8000000,'Stellerro spain token', 'STRO', 0);
  }

}
