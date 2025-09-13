from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import base64
import io
from PIL import Image
import psycopg2
from psycopg2.extras import RealDictCursor


app = Flask(__name__)
CORS(app)

# Simulasi database face_data
stored_face_data = {
    "user123": [-0.123, 0.032, ..., 0.217]  # ganti ini dengan 128 angka float hasil encode wajah
}

def decode_base64_image(base64_string):
    image_data = base64_string.split(',')[1]
    image_bytes = base64.b64decode(image_data)
    return Image.open(io.BytesIO(image_bytes))

@app.route('/api/face/verify', methods=['POST'])
def verify_face():
    data = request.get_json()
    user_id = data.get("userId")
    image_base64 = data.get("faceImage")

    if not user_id or not image_base64:
        return jsonify({"error": "Missing data"}), 400

    known_descriptor = stored_face_data.get(user_id)
    if not known_descriptor:
        return jsonify({"error": "User face data not found"}), 404

    image = decode_base64_image(image_base64)
    image_np = np.array(image)

    encodings = face_recognition.face_encodings(image_np)
    if not encodings:
        return jsonify({"match": False, "reason": "No face detected"}), 200

    unknown_descriptor = encodings[0]
    distance = np.linalg.norm(np.array(known_descriptor) - unknown_descriptor)
    match = distance < 0.6

    return jsonify({"match": match, "distance": float(distance)}), 200

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/api/face/encode', methods=['POST'])
def encode_face():
    data = request.get_json()
    base64_img = data.get("imageBase64")
    if not base64_img:
        return jsonify({"error": "Image is required"}), 400

    image = decode_base64_image(base64_img)
    image_np = np.array(image)

    encodings = face_recognition.face_encodings(image_np)
    if not encodings:
        return jsonify({"encoding": None, "error": "No face found"}), 200

    return jsonify({ "encoding": encodings[0].tolist() })
