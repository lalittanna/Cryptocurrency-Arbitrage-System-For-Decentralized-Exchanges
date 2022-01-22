const { ethers, network, hardhatArguments } = require("hardhat");
const hre = require("hardhat");
const { defaultNetwork, networks } = require("../hardhat.config");
const hardhatConfig = require("../hardhat.config");

const verify = async () => {
  await hre.run("verify:verify", {
    address: "0xf0FeD937F359c2a0cF32aa83DF4A74071e742EA3",
    constructorArguments: [
      network.config.UNISWAPV2_ROUTER02,
      network.config.SUSHISWAP_ROUTER,
      network.config.DYDX_SOLO,
    ],
  });
};

verify();
