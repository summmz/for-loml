"""Local voice-cloning TTS server (Coqui XTTS v2).

Free alternative to ElevenLabs: clone a voice from a short recording and
synthesize any text with it. Runs entirely on your machine.

Setup (once):
    python -m venv .venv-tts
    .venv-tts\Scripts\pip install flask coqui-tts
    .venv-tts\Scripts\python tts_server.py

First run downloads the XTTS v2 model (~1.8 GB).

Voice sample: drop a 6-10 second clear recording in voice_samples/ and pass
its filename as the `voice` query param (default: nini.wav).

API:
    GET /tts?text=hello&voice=nini.wav  ->  audio/wav of the cloned voice
    GET /                                ->  status + available voices
"""
import os
import tempfile

from flask import Flask, jsonify, request, send_file

from TTS.api import TTS

MODEL_NAME = os.environ.get("XTTS_MODEL", "tts_models/multilingual/multi-dataset/xtts_v2")
LANGUAGE = os.environ.get("XTTS_LANGUAGE", "hi")
VOICE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voice_samples")
PORT = int(os.environ.get("PORT", "5001"))

app = Flask(__name__)
_tts = None


def get_tts():
    global _tts
    if _tts is None:
        print("Loading XTTS v2 model (first run downloads it)...")
        _tts = TTS(MODEL_NAME)
        _tts.to("cpu")
    return _tts


@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@app.route("/")
def index():
    voices = []
    if os.path.isdir(VOICE_DIR):
        voices = [f for f in os.listdir(VOICE_DIR) if f.endswith(".wav")]
    return jsonify({"status": "ok", "voices": voices})


@app.route("/tts")
def synthesize():
    text = request.args.get("text", "").strip()
    voice = request.args.get("voice", "nini.wav")
    if not text:
        return jsonify({"error": "text is required"}), 400

    speaker = os.path.join(VOICE_DIR, voice)
    if not os.path.isfile(speaker):
        return jsonify({"error": f"voice sample not found: {voice}"}), 404

    out_path = os.path.join(tempfile.gettempdir(), "nini_reply.wav")
    get_tts().tts_to_file(text=text, speaker_wav=speaker, language=LANGUAGE, file_path=out_path)
    return send_file(out_path, mimetype="audio/wav")


if __name__ == "__main__":
    os.makedirs(VOICE_DIR, exist_ok=True)
    app.run(host="127.0.0.1", port=PORT)
