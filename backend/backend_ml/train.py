from transformers import AutoImageProcessor, SiglipForImageClassification
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import torch, os

# --- Config ---
MODEL_NAME = "prithivMLmods/Hand-Gesture-19"
DATASET_DIR = "dataset"
EPOCHS = 10
BATCH_SIZE = 16
SAVE_PATH = "my_gesture_model"

# --- Build label map from your folders ---
gesture_classes = sorted(os.listdir(DATASET_DIR))
label2id = {g: i for i, g in enumerate(gesture_classes)}
id2label = {i: g for g, i in label2id.items()}
print("Classes:", gesture_classes)

# --- Dataset ---
class GestureDataset(Dataset):
    def __init__(self, root, processor):
        self.samples = []
        self.processor = processor
        for gesture in gesture_classes:
            folder = os.path.join(root, gesture)
            for fname in os.listdir(folder):
                self.samples.append((os.path.join(folder, fname), label2id[gesture]))

    def __len__(self): return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        image = Image.open(path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")
        return inputs["pixel_values"].squeeze(0), label

# --- Load model & processor ---
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = SiglipForImageClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(gesture_classes),
    ignore_mismatched_sizes=True  # replaces old classification head
)
model.config.id2label = id2label
model.config.label2id = label2id

# --- Train ---
dataset = GestureDataset(DATASET_DIR, processor)
loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
criterion = torch.nn.CrossEntropyLoss()

model.train()
for epoch in range(EPOCHS):
    total_loss = 0
    for pixels, labels in loader:
        labels = torch.tensor(labels)
        outputs = model(pixel_values=pixels)
        loss = criterion(outputs.logits, labels)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}/{EPOCHS} — Loss: {total_loss/len(loader):.4f}")

# --- Save ---
model.save_pretrained(SAVE_PATH)
processor.save_pretrained(SAVE_PATH)
print("Model saved to", SAVE_PATH)