import hashlib
import time
import datetime
import requests
import pymongo
import os

# TARGET_FILE = 'target_file.txt'
TARGET_FOLDER = './target_folder'
API_URL = 'http://localhost:3000/alert'

#mongodb 연결
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['data_detector']
collection = db['data']

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

#초기 해시값 저장
# original_hash = get_hash(TARGET_FILE)
# log("초기 해시값: " + original_hash[:12])
collection.delete_many({})
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

#감시 루프
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

        #삭제된 파일

        #해시 비교
        original_hash = current_file['hash']
        if original_hash != current_hash:
            change = True
            log("!!변경 감지!!")
            print(f"파일 명: {file}...")
            print(f"이전 해시: {original_hash[:12]}...")
            print(f"현재 해시: {current_hash[:12]}...")


            res = requests.post(API_URL, json = {
                'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'oldHash' : original_hash,
                'newHash': current_hash,
                'filename': file
            })

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
            


    # current_hash = get_hash(TARGET_FILE)
    # if current_hash != original_hash:
    #     current_time = datetime.datetime.now()
    #     log("!!변경 감지!!")
    #     print(f"이전 해시: {original_hash[:12]}...")
    #     print(f"현재 해시: {current_hash[:12]}...")

    #     res = requests.post(API_URL, json={
    #         'timestamp': current_time.isoformat(),
    #         'oldHash' : original_hash,
    #         'newHash' : current_hash
    #     })
    #     log(f"서버 응답: {res.text}")

    #     original_hash = current_hash
    # else:
    #     log("변경없음. 해시 동일.")

