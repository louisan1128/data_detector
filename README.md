# 블록체인 기반 파일 변경 이력 관리 시스템

## 시스템 구성도
[로컬 폴더 감시 (Python)] -> [변경 로그 전송 (Node.js API)] -> [IPFS에 메타데이터 업로드] -> [스마트컨트랙트에 CID 기록] -> [프론트엔드에서 로그 확인 및 다운로드]
<img width="1438" height="967" alt="image" src="https://github.com/user-attachments/assets/f6733c5a-c9ba-4019-9806-b054978d7010" />

## 주요 구성 요소

### 1. `hash.py` (Python)
- 감시 대상 폴더의 파일을 주기적으로 스캔
- SHA-256 해시값을 비교하여 변경 여부 판단
- MongoDB에 해시값 저장 및 변경 감지 시 Node.js API로 로그 전송

### 2. `serverAPI.js` (Node.js + Express)
- Python으로부터 로그를 수신
- 메타데이터(JSON) 생성 및 Pinata(IPFS) 업로드
- CID를 이더리움 스마트 컨트랙트에 기록

### 3. `dataDetector.sol` (Solidity)
- CID 배열을 기록하는 스마트 컨트랙트
- `addCID()` 함수를 통해 CID를 온체인에 등록
- `CIDAdd` 이벤트를 통해 변경 기록 발생 시점 추적 가능

### 4. `deploy.js` (Hardhat 배포 스크립트)
- 스마트 컨트랙트를 로컬 이더리움 환경에 배포

### 5. 프론트엔드 (`index.html`, `logs_li.html`)
- 변경 로그 목록 확인
- IPFS에서 메타데이터 직접 조회
- 모든 로그를 텍스트 파일로 다운로드 가능


## 실행 방법

### 1. 스마트 컨트랙트 배포 (Hardhat)
npx hardhat run scripts/deploy.js --network localhost

### 2. Node.js 서버 실행
node serverAPI.js

### 3. Python 감시 스크립트 실행
python hash.py

### 4. 웹 페이지 접속
http://localhost:3000


## 기술 스택
- Python
- Node.js + Express
- MongoDB
- IPFS (Pinata API)
- Solidity (Hardhat)
- Web3.js
- HTML + JavaScript



## 실행 결과

### Target Folder

<img width="760" height="386" alt="image" src="https://github.com/user-attachments/assets/a2543447-343b-43ef-960e-3558c38cbd57" />



### Hash.py

<img width="1064" height="315" alt="image" src="https://github.com/user-attachments/assets/080e582d-f373-4f6c-a91e-bb08513d19aa" />

### 변경 발생 시

<img width="1092" height="431" alt="image" src="https://github.com/user-attachments/assets/b9db4a24-48c2-41a3-807a-c0dabf181054" />



### 프론트엔드 홈페이지

<img width="711" height="283" alt="image" src="https://github.com/user-attachments/assets/80c2ea56-579f-4b86-bd7e-3059cd9e29bf" />

### 프론트엔드 로그 확인

<img width="1112" height="642" alt="image" src="https://github.com/user-attachments/assets/bf2c33f5-2f18-4e07-9307-3caac4aba49a" />


