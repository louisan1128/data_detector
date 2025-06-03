require("dotenv").config();
const express = require('express');
const axios = require("axios");
const FormData = require("form-data");
const fs = require('fs');
const path = require('path');
const { Web3 } = require("web3");

const app = express();
const port = 3000;  


app.use(express.json());
app.use(express.static('public'));



// Web3 & 스마트 컨트랙트 설정
const web3 = new Web3('http://localhost:8545');
const contractABI = require('./contractABI.json');
const contractAddress = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';  
const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';          
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const contract = new web3.eth.Contract(contractABI, contractAddress);
web3.eth.accounts.wallet.add(account);


//CID 리스트
const CIDs = [];
 
//메타 데이터 생성 PINATA 업로드 함수
async function uploadMetadataToPinata(metadata) {
    const filePath = path.join(__dirname, "metadata.json");
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("name", "file-change.json");
    form.append("network", "public");

    const res = await axios.post("https://uploads.pinata.cloud/v3/files", form, {
        headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
        }
    });

    return res.data.data.cid;
}

//블록체인에 CID 기록
async function recordCIDOnBlockchain(cid) {
    const tx = await contract.methods.addCID(cid).send({
        from: account.address,
        gas: 200000,
    });
    return tx.transactionHash;
}


//post 요청
app.post('/alert', async (req, res) => {
    try {
        console.log("받은 데이터:", req.body);

        const { timestamp, oldHash, newHash, filename } = req.body;

        //메타 데이터 만들기
        let metadata = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://www.pdaas.com/vdb/v1"
            ],
            "id": "did:vdb:datadetector-001",
            "data_log": {
                "fileChangeLog": {
                    timestamp,
                    filename,
                    oldHash,
                    newHash,
                    ipfsCID: "",
                    blockchainTxHash: ""
                }
            }
        };

        //IPFS에 메타데이터 업로드
        const cid = await uploadMetadataToPinata(metadata);
        metadata.data_log.fileChangeLog.ipfsCID = cid;

        //블록체인에 CID 기록
        const txHash = await recordCIDOnBlockchain(cid);
        metadata.data_log.fileChangeLog.blockchainTxHash = txHash;

        //최종 메타데이터 넣기
        const finalCID = await uploadMetadataToPinata(metadata);
        //메타데이터 다시 작성
        const updatedPath = path.join(__dirname, "metadata.json");
        fs.writeFileSync(updatedPath, JSON.stringify(metadata, null, 2));

        console.log("IPFS CID:", finalCID);
        console.log("블록체인 TxHash:", txHash);

        res.json({
            message: "변경 로그 저장 완료",
            finalCID,
            txHash
        });

        //프론트용
        CIDs.push(finalCID)

    }catch (err) {
        console.error("오류 발생");
        res.status(500).send("서버 오류");
    }
});

// CID 목록 반환 API
app.get('/logs', (req, res) => {
    res.json(CIDs);
});




app.listen(port, () => {
    console.log(`서버 실행 중: http://localhost:${port}`);
});


