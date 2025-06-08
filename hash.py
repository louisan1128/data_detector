import hashlib
import time
import datetime
import requests
import pymongo
import os
from web3 import Web3
import requests

# TARGET_FILE = 'target_file.txt'
TARGET_FOLDER = './target_folder'
API_URL = 'http://localhost:3000/alert'



#mongodb 연결
client = pymongo.MongoClient("mongodb://admin:seunghwanan@localhost:27017/admin")
db = client['data_detector']
collection = db['data']

# MongoDB Change Stream 감시 함수



#mongod.log 추출
mongo_log_path = 'C:\Program Files\MongoDB\Server\8.0\bin'
temp_log_path = 'mongod.log.txt'

def accessed_failed_mongod():
    logs = []
    with open(mongo_log_path, 'r', encoding = 'utf-8') as f:
        for line in f:
            if 'Authentication failed' in line or 'Failed to authenticate' in line:
                    logs.append(line)
    return logs

def accessed_succeeded_mongod():
    logs = []
    with open(mongo_log_path, 'r', encoding = 'utf-8') as f:
        for line in f:
            if 'Authentication succeeded' in line or 'Successfully authenticated' in line:
                    logs.append(line)
    return logs

# Authentication failed
# Successfully authenticated


####함수########################
#해시 생성
def get_hash(file):
    with open(file, 'rb') as f:
        data = f.read()
        hash_object = hashlib.sha256(data)
        return hash_object.hexdigest()
        
#로그시간
def log(text):
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")  
    print(f"[{current_time}] {text}")




################################


#초기 해시값 저장
collection.delete_many({}) #초기화
for file in os.listdir(TARGET_FOLDER) :
    path = os.path.join(TARGET_FOLDER, file).replace("\\", "/")
    file_hash = get_hash(path)

    collection.insert_one({
        "filename": file,
        "path": path,
        "hash": file_hash,
        "last_modified": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    log(f"{file}등록됨. 해시값: {file_hash[:12]}")



#####################감시 루프##########################
while True:
    time.sleep(3) #대기시간
    change = False

    for file in os.listdir(TARGET_FOLDER):
        path = os.path.join(TARGET_FOLDER, file).replace("\\", "/")
        current_hash = get_hash(path)
        current_file = collection.find_one({"filename":file}) 

        # 추가된 파일
        if current_file is None:
            collection.insert_one({
                "filename": file,
                "path": path,
                "hash": current_hash,
                "last_modified": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
            log(f"{file}등록됨. 해시값: {current_hash[:12]}")


        #해시 비교
        original_hash = current_file['hash']
        if original_hash != current_hash:
            change = True
            log("!!변경 감지!!")

            print(f"파일 명: {file}...")
            print(f"이전 해시: {original_hash[:12]}...")
            print(f"현재 해시: {current_hash[:12]}...")

            #로그 기록
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            ##변경 로그 post 보내기
            post_data = {
              "timestamp": timestamp,
              "filename": file,
              "oldHash": original_hash,
              "newHash": current_hash,
            }
            res = requests.post(API_URL, json=post_data)
            log(f"서버 응답: {res.text}")


            #해시 없데이트
            collection.update_one(
                {"filename": file},
                {"$set": {
                    "hash": current_hash,
                    "last_modified": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }}
            )
        
    if not change:
        log("변경없음. 해시 동일.")
            

