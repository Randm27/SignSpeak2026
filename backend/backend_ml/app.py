from ml import from_base64_string
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


# @app.get("/gesture")
# def get_gesture_controller():
#     image_url = request.args.get("image_url")

#     return jsonify({"gesture":get_gesture(image_url)}), 200

cors = CORS(app) # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'


@app.post("/analyze-frame")
@cross_origin()
def analyze():
    data = request.json["image"]
    return jsonify({"gesture":from_base64_string(data)})