// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, network, hardhatArguments } = require("hardhat");
const hre = require("hardhat");
const { defaultNetwork, networks } = require("../hardhat.config");
const hardhatConfig = require("../hardhat.config");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await ethers.getSigners();

  console.log(`Deploying with the address ${deployer.address}`);

  // We get the contract to deploy
  const ArbitrageContract = await hre.ethers.getContractFactory("Arbitrage");

  //Add addresses of contracts according to the network
  const arbitrage = await ArbitrageContract.deploy(network.config.UNISWAPV2_ROUTER02, 
    network.config.SUSHISWAP_ROUTER, 
    network.config.DYDX_SOLO, 
    network.config.WETH);

  await arbitrage.deployed();

  console.log("Arbitrage contract deployed to:", arbitrage.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
