# --- 필요한 라이브러리들을 불러옵니다 ---
import os
import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

# --- Flask 앱을 생성하고 CORS 설정을 합니다 ---
app = Flask(__name__)
CORS(app)

# --- AI 모델 및 클래스 이름 설정 ---
MODEL_PATH = '/Users/leeyushin/Desktop/Dandelion/SW_FE(MAIN)/ai/best_chili_model.keras'

# predict2.py와 동일하게, 모델이 학습한 영문 클래스 이름을 순서대로 정의합니다.
CLASS_NAMES_ENG = [
    'chili_disease', 'chili_normal',
    'cucumber_disease', 'cucumber_normal',
    'pumpkin_disease', 'pumpkin_normal',
    'tomato_disease', 'tomato_normal'
]

# 영문 이름을 한글로 변환하기 위한 변환표(Dictionary)
TRANSLATION_MAP = {
    'chili': '고추',
    'cucumber': '오이',
    'pumpkin': '호박',
    'tomato': '토마토',
    'disease': '질병',
    'normal': '정상'
}

# --- 서버가 시작될 때 AI 모델을 미리 불러옵니다 ---
try:
    model = load_model(MODEL_PATH)
    print(f"✅ AI 모델을 성공적으로 불러왔습니다: {MODEL_PATH}")
except Exception as e:
    print(f"❌ AI 모델을 불러오는 중 오류가 발생했습니다: {e}")
    model = None


# --- 이미지 전처리 함수 ---
def preprocess_image(image_bytes):
    """
    전달받은 이미지 데이터를 AI 모델이 이해할 수 있는 형태로 변환하는 함수입니다.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)
    
    # --- 수정된 부분 ---
    # 모델이 0~255 범위의 픽셀 값으로 학습되었으므로, 0~1로 바꾸는 정규화 코드를 제거합니다.
    # img_array = img_array / 255.0
    
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


# --- API 엔드포인트(요청을 받는 주소)를 정의합니다 ---
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': '모델이 로드되지 않았습니다!'}), 500

    if 'file' not in request.files:
        return jsonify({'error': '요청에 파일이 없습니다.'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '파일이 선택되지 않았습니다.'}), 400

    if file:
        try:
            # 1. 이미지 읽기 및 전처리
            image_bytes = file.read()
            processed_image = preprocess_image(image_bytes)

            # 2. 모델로 예측 수행
            prediction = model.predict(processed_image)
            
            # 3. 예측 결과 해석 (predict2.py 로직 적용)
            confidence = float(np.max(prediction))
            predicted_class_index = np.argmax(prediction)
            
            # 모델이 예측한 영문 클래스 이름 가져오기
            predicted_class_name_eng = CLASS_NAMES_ENG[predicted_class_index]
            
            # 작물명과 상태 분리 (예: 'chili_disease' -> 'chili', 'disease')
            crop_eng, status_eng = predicted_class_name_eng.split('_')
            
            # 한글로 변환
            crop_kor = TRANSLATION_MAP.get(crop_eng, crop_eng)
            status_kor = TRANSLATION_MAP.get(status_eng, status_eng)
            
            # 프론트엔드에 보여줄 최종 라벨
            final_label = f"{crop_kor} {status_kor}"

            # 4. 프론트엔드에 전달할 결과 데이터를 JSON 형식으로 구성
            result = {
                "crop": crop_kor,
                "status": status_kor,
                "label": final_label,
                "confidence": confidence,
                "tips": [ # 작물과 상태에 따라 다른 팁을 제공할 수 있습니다.
                    f"{crop_kor}의 {status_kor}이(가) 의심됩니다.",
                    "의심되는 잎과 열매는 즉시 제거하여 확산을 방지하세요.",
                    "정확한 진단과 처방을 위해 전문가와 상담하세요."
                ]
            }

            return jsonify(result)

        except Exception as e:
            print(f"- 예측 중 오류 발생: {e}")
            return jsonify({'error': '이미지를 처리하는 데 실패했습니다.'}), 500


# --- Flask 서버를 시작합니다 ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
