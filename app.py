from flask import Flask, request, jsonify
from flask_cors import CORS
from generate_etude import generate_etude
import os

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    selected_keys = data.get("keys", [])
    selected_rhythms = data.get("rhythms", [])
    use_intervals = data.get("intervals", False)
    num_measures = data.get("measures", 4)

    etude = generate_etude(selected_keys, selected_rhythms, use_intervals, num_measures)
    return jsonify(etude)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
