const hre = require("hardhat");
const { NTF_PRESALENFT_CONTRACT } = require("../constant");

//This contract was deployed to this address 0x032b956f6cDF26288fAb6EbDF9c86fd04A10DFfE

async function main() {
  const contract = await hre.ethers.getContractFactory("LifeToken");
  const deployedContract = await contract.deploy(NTF_PRESALENFT_CONTRACT);

  await deployedContract.deployed();

  console.log("Please Wait.... ");

  console.log(` This contract was deployed to ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
