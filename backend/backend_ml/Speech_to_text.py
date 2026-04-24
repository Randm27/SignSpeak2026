import os
import whisper
import time
import shutil

# --- PATH SETUP ---
# Ensures ffmpeg.exe can be found if it's in the same folder
current_dir = os.path.dirname(os.path.abspath(__file__))
os.environ["PATH"] += os.pathsep + current_dir

# --- MODEL LOADING ---
print("⏳ Зареждане на Whisper (английски модел)...")
try:
    # Using "medium" as requested. device="cpu" is safer for most PCs.
    model = whisper.load_model("medium", device="cpu")
    print("✅ Whisper е готов за английска реч!")
except Exception as e:
    print(f"❌ Грешка при зареждане на Whisper: {e}")
    model = None

def transcribe_audio_file(audio_path):
    """
    This function is called by the Flask app.py
    It takes a path to a saved audio file and returns the text.
    """
    if audio_path is None or model is None:
        return "Грешка: Моделът не е зареден или файлът липсва."

    try:
        # Give the OS a tiny moment to finish writing the file to disk
        time.sleep(0.1)
        
        print(f"🎙️ AI обработва английска реч...")
        
        # МАГИЯТА: language="en" ensures it doesn't try to guess the language
        # fp16=False is required for CPU processing
        result = model.transcribe(audio_path, fp16=False, language="en")
        
        recognized_text = result.get("text", "").strip()
        print(f"📝 Разпознат текст: {recognized_text}")
        
        return recognized_text

    except Exception as e:
        print(f"🚨 Грешка при транскрипция: {e}")
        return f"Грешка при обработка: {str(e)}"

# Note: No Gradio code here. 
# This file is now a "helper" for your main Flask server.