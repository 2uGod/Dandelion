import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import sys

# --- 1. 모델 및 설정 불러오기 ---
try:
    model = tf.keras.models.load_model('best_chili_model.keras')

    # 클래스 이름 (학습 데이터 폴더 구조 순서대로)
    class_names = [
        'chili_disease', 'chili_normal',
        'cucumber_disease', 'cucumber_normal',
        'pumpkin_disease', 'pumpkin_normal',
        'tomato_disease', 'tomato_normal'
    ]


    IMG_SIZE = (224, 224)

except Exception as e:
    print(f"모델 또는 설정 로딩 중 오류 발생: {e}")
    sys.exit()


# --- 2. 예측할 이미지 경로 받기 ---
if len(sys.argv) < 2:
    print("사용법: python predict.py <이미지 파일 경로>")
    sys.exit()

image_path = sys.argv[1]


# --- 3. 이미지 전처리 ---
try:
    img = image.load_img(image_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_batch = np.expand_dims(img_array, axis=0)
except Exception as e:
    print(f"이미지 처리 중 오류 발생: {e}")
    sys.exit()


# --- 4. 예측 실행 및 결과 출력 ---
prediction = model.predict(img_batch)
predicted_class_index = np.argmax(prediction[0])
predicted_class_name = class_names[predicted_class_index]
confidence = np.max(prediction[0]) * 100

# 작물명 / 상태 분리
crop, status = predicted_class_name.split("_")

# 결과 출력
print("\n--- 예측 결과 ---")
print(f"작물 종류: {crop}")
print(f"상태: {status}")
print(f"확률: {confidence:.2f}%")

# 추가 메시지
if status == 'disease':
    print("질병이 의심됩니다.")
else:
    print("정상으로 보입니다.")
