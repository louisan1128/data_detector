const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const contractAddress = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9"; // 여기에 실제 주소 넣기
  const dataDetect = await hre.ethers.getContractAt("dataDetector", contractAddress);

  //IPFS 경로 넣기
  const tokenURI = "https://gateway.pinata.cloud/ipfs/bafkreihuocx7zrjhpcpmurdgk7v45g2jodurg47reyd2d5wv6qojk42r2i";

  const tx = await dataDetect.mint(deployer.address, tokenURI);
  await tx.wait();

  console.log("✅ NFT Minted!");
  console.log("👛 To:", deployer.address);
  console.log("🔗 tokenURI:", tokenURI);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});