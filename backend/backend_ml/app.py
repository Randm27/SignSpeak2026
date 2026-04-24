from ml import from_base64_string
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv
import base64

# --- NEW IMPORT FOR SPEECH ---
# Make sure Speech_to_text.py is in the same folder!
try:
    from Speech_to_text import transcribe_audio_file
except ImportError:
    print("⚠️ Warning: Speech_to_text.py not found in this directory.")

load_dotenv()

app = Flask(__name__)

# Path to dataset folder
DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset")

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# --- NEW ROUTE: SPEECH TO TEXT ---
@app.route("/speech-to-text", methods=["POST"])
@cross_origin()
def handle_speech():
    """Receives audio file and returns transcribed text using Whisper"""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    # Create a temporary path to save the audio for Whisper to read
    temp_path = os.path.join(os.getcwd(), f"temp_{audio_file.filename}")
    
    try:
        audio_file.save(temp_path)
        
        # Call the transcription function from your other file
        recognized_text = transcribe_audio_file(temp_path)
        
        return jsonify({"text": recognized_text}), 200
    
    except Exception as e:
        print("ERROR in speech-to-text:", e)
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Always delete the temporary audio file
        if os.path.exists(temp_path):
            os.remove(temp_path)

# --- EXISTING ROUTE: ANALYZE GESTURE ---
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

# --- EXISTING ROUTE: TEXT TO IMAGES ---
@app.route("/get-images-for-text/<text>", methods=["GET"])
@cross_origin()
def get_images_for_text(text):
    """
    Returns first image for each character in the text as base64.
    Supports letters and spaces.
    """
    try:
        clean_text = text.lower()
        characters = list(clean_text)

        if not characters:
            return jsonify({"error": "No characters found in text"}), 400

        images_data = []

        for char in characters:
            if char == " ":
                continue
            elif char.isalpha():
                char_folder = os.path.join(DATASET_PATH, char)
                char_label = char
            else:
                continue

            if not os.path.isdir(char_folder):
                continue

            image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp')
            images = sorted([
                f for f in os.listdir(char_folder)
                if os.path.isfile(os.path.join(char_folder, f))
                and f.lower().endswith(image_extensions)
            ])

            if not images:
                continue

            first_image = images[0]
            img_path = os.path.join(char_folder, first_image)

            with open(img_path, 'rb') as f:
                img_base64 = base64.b64encode(f.read()).decode('utf-8')
                images_data.append({
                    "letter": char_label,
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

if __name__ == "__main__":
    # Server runs on Port 5001
    app.run(host="0.0.0.0", port=5001, debug=True, use_reloader=False)