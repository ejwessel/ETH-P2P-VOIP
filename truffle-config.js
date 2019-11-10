const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

module.exports = {
  networks: {
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },
     kovan: {
       provider: () => new HDWalletProvider(
         process.env.MNEMONIC,
         "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY),
       network_id: 42,
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
       version: "0.5.12",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
}
