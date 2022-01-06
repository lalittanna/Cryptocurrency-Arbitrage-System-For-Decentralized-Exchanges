require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "kovan",
  networks: {
    hardhat: {
      forking: {
      url: process.env.MAINNET_HTTP_URL,
      UNISWAPV2_ROUTER02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      SUSHISWAP_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
      DYDX_SOLO: "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e",
      WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      }
    },
    kovan: {
      url: process.env.KOVAN_HTTP_URL,
      accounts: [process.env.PRIVATE_KEY],
      UNISWAPV2_ROUTER02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      SUSHISWAP_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      DYDX_SOLO: "0x4EC3570cADaAEE08Ae384779B0f3A45EF85289DE",
      WETH: "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
    }
  },
  solidity: "0.8.4",
};
