require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");


async function uploadJSONToPinataV3() {
  const url = "https://uploads.pinata.cloud/v3/files"; // V3 파일 업로드용

  // JSON 파일 생성
  const metadata = 
  {
    "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.pdaas.com/vdb/v1"
    ],
    "id": "did:vdb:datadetector-001",
    "data_log": {
        "fileChangeLog": {
        "timestamp": "2025-06-03T15:24:00Z",
        "filename": "example.txt",
        "oldHash": "a1b2c3d4e5f6g7h8i9j0",
        "newHash": "z9y8x7w6v5u4t3s2r1q0",
        "ipfsCID": "QmExampleCID1234567890",
        "blockchainTxHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        }
    }
}

  const filePath = path.join(__dirname, "metadata.json");
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));

  //  FormData 구성
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("name", "nft-metadata.json");
  form.append("network", "public");

  try {
    const res = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(), // 자동으로 multipart 헤더 구성
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    const cid = res.data.data.cid;
    console.log("✅ Uploaded JSON to IPFS (V3)");
    console.log("🔗 IPFS URI:", `ipfs://${cid}`);
    console.log("🌐 Gateway URL:", `https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log("📦 Full response:", res.data);
  } catch (err) {
    console.error("❌ Upload failed:", err.response?.status, err.response?.data || err.message);
  }
}

uploadJSONToPinataV3();