const { expect } = require("chai");

describe("Arbitrage Integration Test", () => {
  before(async () => {
    const ArbitrageContract = await hre.ethers.getContractFactory("Arbitrage");

    const arbitrage = await ArbitrageContract.deploy(
      network.config.UNISWAPV2_ROUTER02,
      network.config.SUSHISWAP_ROUTER,
      network.config.DYDX_SOLO
    );

    await arbitrage.deployed();
  });
});
