const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const { MongoClient } = require('mongodb')
const port = 3000;

//mongodb 연결
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'data_detector'

const collectionPromise = client.connect().then(() => {
    console.log("DB 연결");
    return client.db(dbName).collection('change_logs');
});

app.use(express.json());

//post 요청
app.post('/alert', async (req, res) => {
    const { timestamp, oldHash, newHash, filename } = req.body;
    console.log("변경감지");

    const log = `!!변경 감지!!\n[${timestamp}]\n
        파일명: ${filename}\n
        이전 해시: ${oldHash}\n
        현재 해시: ${newHash}\n\n`
    fs.appendFileSync('change_log.txt', log);

    const collection = await collectionPromise;
    await collection.insertOne({
        filename: filename,
        oldHash: oldHash,
        newHash: newHash,
        timestamp: timestamp,
        currentTime: new Date()
    });

    res.send('알림 수신 완료');
});

//로그파일 다운로드
app.get('/logs', (req, res) => {
    const filePath = path.join(__dirname, 'change_log.txt');
    if(fs.existsSync(filePath)) {
        res.download(filePath, 'change_log.txt');
    } else {
        res.send('로그 파일이 없습니다');
    }
});

//로그 표시
app.get('/logs_record', (req, res) => {
    const filePath = path.join(__dirname, 'change_log.txt');
    if(fs.existsSync(filePath)) {
        const logs = fs.readFileSync(filePath, 'utf-8');
        res.send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>로그 기록</title>
                </head>
                <body>
                    <h1>로그 기록</h1>
                    <pre>${logs}</pre>
                    <p><a href="/"> 돌아가기 </a></p>
                </body>
            </html>`);
    } else {
        res.send('로그 파일이 없습니다.');
    }
});

//홈페이지
app.get('/', (req, res) => {
    res.send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>API서버</title>
                </head>
                <body>
                    <h1>서버 실행중</h1>
                    <p><a href="/logs_record/"> 로그 기록 보기 </a></p>
                    <p><a href="/logs"> 로그 기록 다운로드 </a></p>
                </body>
            </html>`);
});

app.listen(port, () => {
    console.log(`서버 실행 중: http://localhost:${port}`);
});
