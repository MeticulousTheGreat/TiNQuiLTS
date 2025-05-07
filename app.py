from flask import Flask, request, jsonify
from flask_cors import CORS
from generate_etude import generate_etude
import os

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    print("Received data:", data)

    etude = generate_etude(data)  # Pass the whole config dict
    return jsonify({"etude": etude})
