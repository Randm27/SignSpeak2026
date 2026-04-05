# from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# # BART е много по-добър в запазването на смисъла
# model_name = "facebook/bart-large-cnn"
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# def simplify_text(text):
#     # При BART често не ни трябва промпт, той знае какво да прави
#     inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    
#     outputs = model.generate(
#         **inputs, 
#         max_length=100, 
#         min_length=30, 
#         do_sample=False # Тук искаме точност, а не креативност
#     )
    
#     return tokenizer.decode(outputs[0], skip_special_tokens=True)

# complex_text = ("In order to facilitate a more integrated approach toward our strategic objectives, we must leverage our core competencies to synergize diverse departmental workstreams. The implementation of this multifaceted framework will necessitate a paradigm shift in our operational methodology, ensuring that our deliverables align with the overarching mission of global scalability. Furthermore, by optimizing our resource allocation and fostering a culture of agile innovation, we can mitigate potential fiscal redundancies while simultaneously maximizing our competitive advantage in an increasingly volatile market landscape.")

# print(f"--- BART RESULT ---\n{simplify_text(complex_text)}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from Speech_to_text import transcribe_audio
from fastapi import FastAPI, File, UploadFile
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5000/","singspeak.org","*"],  # или ["http://127.0.0.1:5000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# model_name = "sshleifer/distilbart-cnn-12-6"
model_name = "sshleifer/distilbart-cnn-12-3"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

class TextRequest(BaseModel):
    text: str

def simplify_text(text):
    inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    outputs = model.generate(
        **inputs,
        max_length=100,
        min_length=30,
        do_sample=False
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

@app.post("/simplify")
def simplify(req: TextRequest):
    result = simplify_text(req.text)
    return {"simplified": result}

@app.post("/tts")
async def receive_audio(audio_data: UploadFile = File(...)):
    print(audio_data)
    file_path=f"./uploads/{audio_data.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio_data.file, buffer)
    
    return transcribe_audio(file_path)

@app.post("/ping")
def ping():
    return {"status": "ok", "message": "server is running"}
