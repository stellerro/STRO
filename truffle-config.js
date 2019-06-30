require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require("truffle-hdwallet-provider");

const FROM_ADDRESS = "0x80fc911aB7519903f94d88cca37e2f1411DdEda8";
const INFURA_API_KEY = "rLQZVqIZLyOt46hXERpc"
const INFURA_PROJECT_ID = "9f4ecd5bde3b41e28f8367e778ab5a78"

const MNEMONIC = "drum venture trash panel much pretty tornado tray aware easy degree cricket"

module.exports = {
  networks: {
    ganache: {
      host: "localhost",
      port: 7545,
      gas: 7988300,
      network_id: "5777" // Match any network id
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      // provider: () => {
      //   //return new HDWalletProvider(MNEMONIC, `https://rinkeby.infura.io/${INFURA_API_KEY}`)
      //   return new HDWalletProvider(MNEMONIC, `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`)
      // },
      provider: new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/9f4ecd5bde3b41e28f8367e778ab5a78"),
      //from: FROM_ADDRESS,
      gas: 6662655,
      gasPrice: 3000000000 * 70,
      network_id: "4"
    },
  },

  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },

  // mocha: {
  //   reporter: 'eth-gas-reporter',
  //   reporterOptions : {
  //     currency: 'USD',
  //     onlyCalledMethods: true,
  //     //showTimeSpent: true,
  //     //outputFile: './reports/gas-usage.txt'

  //   }
  // }

};
