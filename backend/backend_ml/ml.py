import gradio as gr
from transformers import AutoImageProcessor
from transformers import SiglipForImageClassification
from transformers.image_utils import load_image
from PIL import Image
import torch
import requests
from io import BytesIO
import numpy as np
import base64

# Load model and processor
model_name = "prithivMLmods/Hand-Gesture-19"
model = SiglipForImageClassification.from_pretrained(model_name)
processor = AutoImageProcessor.from_pretrained(model_name)

def hand_gesture_classification(image):
    """Predicts the hand gesture category from an image."""
    image = Image.fromarray(image).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
    
    labels = model.config.id2label
    predictions = {labels[str(i)]: round(probs[i], 3) for i in range(len(probs))}
    
    return predictions

def sort_predictions(predictions):
    print(predictions)
    return list(sorted(list(predictions.items()), key = lambda x:x[1], reverse=1))[0][0]


def from_base64_string(base64_string):
    if "data:image" in base64_string:
        base64_string = base64_string.split(",")[1]
    return sort_predictions(hand_gesture_classification(np.asarray(Image.open(BytesIO(base64.b64decode(base64_string))))))