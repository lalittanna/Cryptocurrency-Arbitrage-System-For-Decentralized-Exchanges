const { Interface } = require("@ethersproject/abi");
const { ethers, network, hardhatArguments } = require("hardhat");
const hre = require("hardhat");
const { defaultNetwork, networks } = require("../hardhat.config");
const hardhatConfig = require("../hardhat.config");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying with the address ${deployer.address}`);

  // We get the contract to deploy
  const ArbitrageContract = await hre.ethers.getContractFactory("Arbitrage");

  //Add addresses of contracts according to the network
  const arbitrage = await ArbitrageContract.deploy(
    network.config.UNISWAPV2_ROUTER02,
    network.config.SUSHISWAP_ROUTER,
    network.config.DYDX_SOLO
  );

  await arbitrage.deployed();

  console.log("Arbitrage contract deployed to:", arbitrage.address);

  // transfer weth to deployed address first.

  const wethContract = await hre.ethers.getContractAt(
    "IERC20",
    "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
  );

  await wethContract.transfer(arbitrage.address, 1000000000000000);

  console.log(await wethContract.balanceOf(arbitrage.address));

  await arbitrage.initiateFlashLoan(
    "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
    1000000000000000,
    0
  );

  console.log(await wethContract.balanceOf(arbitrage.address));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
