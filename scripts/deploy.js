async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🚀 Deploying contract with:", deployer.address);

    const DataDetector = await hre.ethers.getContractFactory("dataDetector");
    const contract = await DataDetector.deploy(deployer.address);
    await contract.deployed();

    console.log("✅ DataDetector deployed to:", contract.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});