from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from generate_etude import generate_etude
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        config = request.get_json()
        print("Received config:", config)
        etude = generate_etude(config)
        return jsonify({"etude": etude})
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
