// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");

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

  // Add addresses of contracts according to the network
  const arbitrage = await ArbitrageContract.deploy("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", "0x4EC3570cADaAEE08Ae384779B0f3A45EF85289DE", "0xd0a1e359811322d97991e03f863a0c30c2cf029c");

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
