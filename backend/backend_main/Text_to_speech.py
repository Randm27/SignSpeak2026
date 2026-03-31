from flask import Flask, request, send_file, render_template_string
import io
from gtts import gTTS

app = Flask(__name__)

HTML = """
<audio controls id="player"></audio>
<input type="text" id="text" placeholder="Enter English text" style="width:300px;">
<button onclick="speak()">Speak</button>

<script>
async function speak() {
    const text = document.getElementById('text').value;

    if (!text) { alert('Enter text!'); return; }

    try {
        const res = await fetch('/tts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text})
        });

        if (!res.ok) {
            const data = await res.json();
            alert('Error: ' + (data.error || res.status));
            return;
        }

        const blob = await res.blob();
        document.getElementById('player').src = URL.createObjectURL(blob);
    } catch (e) {
        alert('Connection error: ' + e.message);
    }
}
</script>
"""

@app.route("/")
def index():
    return render_template_string(HTML)

@app.route("/tts", methods=["POST"])
def tts():
    data = request.json
    text = data.get("text")
    if not text:
        return {"error": "No text provided"}, 400

    try:
        # English voice
        tts = gTTS(text=text, lang="en")
        audio_bytes = io.BytesIO()
        tts.write_to_fp(audio_bytes)
        audio_bytes.seek(0)
        return send_file(audio_bytes, mimetype="audio/mpeg")
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)