from flask import Flask, request, jsonify
from flask_cors import CORS
from generate_etude import generate_etude
import os

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    print("Received config:", data)

    try:
        etude = generate_etude(data)
        return jsonify({"etude": etude})
    except Exception as e:
        print("Error during etude generation:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
