from ml import from_base64_string
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv
import base64

load_dotenv()

app = Flask(__name__)

# Path to dataset folder
DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset")

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/analyze-frame", methods=["POST"])
@cross_origin()
def analyze():
    try:
        data = request.json.get("image")
        print("Received frame:", "None" if data is None else len(data))

        if not data:
            return jsonify({"error": "No frame received"}), 400

        gesture = from_base64_string(data)
        return jsonify({"gesture": gesture})

    except Exception as e:
        print("ERROR in analyze():", e)
        return jsonify({"error": str(e)}), 500


@app.route("/get-images-for-text/<text>", methods=["GET"])
@cross_origin()
def get_images_for_text(text):
    """
    Returns first image for each letter in the text as base64.
    Removes spaces and converts to lowercase.
    """
    try:
        clean_text = text.replace(" ", "").lower()
        letters = [char for char in clean_text if char.isalpha()]
        
        if not letters:
            return jsonify({"error": "No letters found in text"}), 400
        
        images_data = []
        
        for letter in letters:
            letter_folder = os.path.join(DATASET_PATH, letter)
            
            if not os.path.isdir(letter_folder):
                continue
            
            image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp')
            images = sorted([f for f in os.listdir(letter_folder) 
                           if os.path.isfile(os.path.join(letter_folder, f)) 
                           and f.lower().endswith(image_extensions)])
            
            if not images:
                continue
            
            first_image = images[0]
            img_path = os.path.join(letter_folder, first_image)
            
            with open(img_path, 'rb') as f:
                img_base64 = base64.b64encode(f.read()).decode('utf-8')
                images_data.append({
                    "letter": letter,
                    "filename": first_image,
                    "data": f"data:image/jpeg;base64,{img_base64}"
                })
        
        return jsonify({
            "original_text": text,
            "clean_text": clean_text,
            "count": len(images_data),
            "images": images_data
        }), 200
    
    except Exception as e:
        print("ERROR in get_images_for_text():", e)
        return jsonify({"error": str(e)}), 500


@app.route("/ping", methods=["POST"])
@cross_origin()
def ping():
    return jsonify({"status": "ok", "message": "server is running"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)