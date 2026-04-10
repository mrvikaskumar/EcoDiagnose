from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import json
import logging
import os
from ultralytics import YOLO

# 1. Initialize Flask and CORS
app = Flask(__name__)
CORS(app)

# Suppress YOLO's default printing
logging.getLogger("ultralytics").setLevel(logging.ERROR)

# 2. Load Models ONCE (at the top so they stay in memory)
print("Loading AI Models...")
try:
    model_1 = YOLO('ewaste_detection_model.pt') 
    model_2 = YOLO('mobile_damage_model.pt') 
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    # A. Check if an image was sent
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    # B. Default fallback response
    result_data = {
        "product": "Unknown",
        "condition": "Not Applicable",
        "viability": "Low - Cannot Identify",
        "score": 0
    }

    try:
        # C. Convert uploaded file to OpenCV format
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"error": "Invalid image format"}), 400

        # D. STAGE 1: Detection
        results_stage_1 = model_1(img, conf=0.25, verbose=False)
        
        if len(results_stage_1[0].boxes) > 0:
            box = results_stage_1[0].boxes[0]
            class_id = int(box.cls[0])
            raw_item_name = model_1.names[class_id].lower()
            clean_name = raw_item_name.replace(" ", "")
            
            # E. STAGE 2: Damage Analysis (Mobiles only)
            if clean_name in ['mobile', 'smartphone', 'phone', 'cellphone', 'remote']:
                result_data["product"] = "Mobile Smartphone"
                
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cropped_phone = img[y1:y2, x1:x2]
                
                if cropped_phone.size != 0:
                    results_stage_2 = model_2(cropped_phone, conf=0.25, verbose=False)
                    
                    if len(results_stage_2[0].boxes) > 0:
                        damage_box = results_stage_2[0].boxes[0]
                        damage_condition = model_2.names[int(damage_box.cls[0])]
                        confidence = int(float(damage_box.conf[0]) * 100)
                        
                        if damage_condition.lower() in ['good', 'intact']:
                            result_data["condition"] = "Perfect / Intact"
                            result_data["viability"] = "High - Ready for Refurbishment"
                            result_data["score"] = 0
                        else:
                            result_data["condition"] = damage_condition.title()
                            result_data["viability"] = "High - Ready for Material Extraction"
                            result_data["score"] = confidence
                    else:
                        result_data["condition"] = "No Visible Damage"
                        result_data["viability"] = "High - Ready for Refurbishment"
                        result_data["score"] = 0
            else:
                result_data["product"] = raw_item_name.title()
                result_data["condition"] = "Not Applicable (Only supported for mobiles)"
                result_data["viability"] = "Manual Inspection Required"
                result_data["score"] = 0

        return jsonify(result_data)

    except Exception as e:
        return jsonify({
            "product": "AI Error",
            "condition": "Error",
            "viability": f"CRASH REASON: {str(e)}",
            "score": 0
        }), 500

# 3. Start the Flask Server
if __name__ == "__main__":
    # Render assigns a port via environment variable
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)