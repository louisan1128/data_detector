async function main() {
    const dataDetector = await ethers.getContractFactory("dataDetector");
    const datadetector = await dataDetector.deploy();
    await datadetector.deployed();
    console.log("deployed address:", datadetector.address);
}