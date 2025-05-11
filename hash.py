import hashlib
import time
import datetime
import requests

TARGET_FILE = 'target_file.txt'
API_URL = 'http://localhost:3000/alert'

#해시 생성
def get_hash(file):
    with open(file, 'rb') as f:
        data = f.read()
        hash_object = hashlib.sha256(data)
        return hash_object.hexdigest()
    
#로그 출력
def log(text):
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")  
    print(f"[{current_time}] {text}")

original_hash = get_hash(TARGET_FILE)
log("초기 해시값: " + original_hash[:12])

#감시 루프
while True:
    time.sleep(5) #대기시간
    current_hash = get_hash(TARGET_FILE)

    if current_hash != original_hash:
        current_time = datetime.datetime.now()
        log("!!변경 감지!!")
        print(f"이전 해시: {original_hash[:12]}...")
        print(f"현재 해시: {current_hash[:12]}...")

        res = requests.post(API_URL, json={
            'timestamp': current_time.isoformat(),
            'oldHash' : original_hash,
            'newHash' : current_hash
        })
        log(f"서버 응답: {res.text}")

        original_hash = current_hash
    else:
        log("변경없음. 해시 동일.")

