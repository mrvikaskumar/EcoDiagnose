import sys
import cv2
import json
import logging
from ultralytics import YOLO

# Suppress YOLO's default printing so it doesn't mess up our JSON output
logging.getLogger("ultralytics").setLevel(logging.ERROR)

def run_analysis(image_path):
    # Default fallback response now includes "score"
    result_data = {
        "product": "Unknown",
        "condition": "Not Applicable",
        "viability": "Low - Cannot Identify",
        "score": 0
    }

    try:
        model_1 = YOLO('ewaste_detection_model.pt') 
        model_2 = YOLO('mobile_damage_model.pt') 
        
        img = cv2.imread(image_path)
        if img is None:
            print(json.dumps(result_data))
            return

        results_stage_1 = model_1(img, conf=0.25, verbose=False)
        
        if len(results_stage_1[0].boxes) > 0:
            box = results_stage_1[0].boxes[0]
            class_id = int(box.cls[0])
            raw_item_name = model_1.names[class_id].lower()
            clean_name = raw_item_name.replace(" ", "")
            
            if clean_name in ['mobile', 'smartphone', 'phone', 'cellphone', 'remote']:
                result_data["product"] = "Mobile Smartphone"
                
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cropped_phone = img[y1:y2, x1:x2]
                
                if cropped_phone.size != 0:
                    results_stage_2 = model_2(cropped_phone, conf=0.25, verbose=False)
                    
                    if len(results_stage_2[0].boxes) > 0:
                        damage_box = results_stage_2[0].boxes[0]
                        damage_condition = model_2.names[int(damage_box.cls[0])]
                        
                        # Calculate the confidence score out of 100
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

    except Exception as e:
        result_data["condition"] = "AI Error"
        # This will send the exact Python crash reason straight to your React screen!
        result_data["viability"] = f"CRASH REASON: {str(e)}"
        
    # Print ONLY the JSON string
    print(json.dumps(result_data))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        run_analysis(image_path)
    else:
        print(json.dumps({"error": "No image path provided"}))