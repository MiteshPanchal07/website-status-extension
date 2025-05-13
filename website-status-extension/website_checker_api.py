from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, time
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)  

def normalize_url(url):
    parsed = urlparse(url)
    if not parsed.scheme:
        return "https://" + url
    return url

@app.route('/analyze', methods=['POST'])
def analyze_website():
    data = request.get_json()
    raw_url = data.get('url')
    if not raw_url:
        return jsonify({"error": "Missing URL"}), 400

    url = normalize_url(raw_url)
    result = {
        "url": url,
        "status": "Down",
        "response_time": None,
        "http_code": None,
        "error": None
    }

    try:
        start_time = time.time()
        response = requests.get(url, timeout=5)
        duration = round(time.time() - start_time, 2)

        result.update({
            "status": "Up" if response.status_code == 200 else "Issue",
            "response_time": f"{duration} seconds",
            "http_code": response.status_code
        })

    except requests.exceptions.RequestException as e:
        result["error"] = str(e)

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
