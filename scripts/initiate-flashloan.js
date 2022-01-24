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
    network.config.WETH
  );

  await wethContract.transfer(arbitrage.address, 1000000000000000);

  console.log(await wethContract.balanceOf(arbitrage.address));

  await arbitrage.initiateFlashLoan(
    network.config.WETH,
    network.config.DAI,
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
