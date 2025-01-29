from fastapi import FastAPI, File, UploadFile, HTTPException
import numpy as np
from typing import List
import uvicorn
import torch
import torch.nn as nn

# Initialize FastAPI app
app = FastAPI(title="Fake Stuttering Detection API", description="A mock API for detecting stuttering types from audio files. 😄")

# Define stuttering types
STUTTERING_TYPES = ["Prolongation", "Block", "SoundRep", "WordRep", "Interjection"]

# Fake LSTM model (same as before)
class FakeStutterDetector(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(FakeStutterDetector, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # Fake LSTM pass
        x, _ = self.lstm(x)
        x = self.fc(x[:, -1, :])  # Take the last time step's output
        return self.sigmoid(x)

# Load the fake model
input_size = 13  # Corresponding to your dataset columns
hidden_size = 64
output_size = 5  # Corresponding to the 5 stuttering types

model = FakeStutterDetector(input_size, hidden_size, output_size)
model.load_state_dict(torch.load("model.pth"))
model.eval()  # Set the model to evaluation mode

# Fake inference function
def predict_stuttering_type(audio_file_path: str) -> List[str]:
    """
    Fake inference function that pretends to predict stuttering types from an audio file.
    """
    # Generate random input data (since the model is fake)
    fake_input = torch.randn(1, 1, input_size)  # Batch size = 1, Sequence length = 1

    # Get fake predictions
    with torch.no_grad():
        predictions = model(fake_input)
        predictions = (predictions > 0.5).squeeze().numpy().astype(int)  # Convert to binary predictions

    # Map predictions to stuttering types
    detected_types = [stutter_type for stutter_type, pred in zip(STUTTERING_TYPES, predictions) if pred == 1]
    return detected_types

# API endpoint for stuttering detection
@app.post("/detect-stuttering/", response_model=dict)
async def detect_stuttering(audio_file: UploadFile = File(...)):
    """
    Endpoint to upload an audio file and get fake stuttering predictions.
    """
    # Check if the uploaded file is an audio file
    if not audio_file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an audio file.")

    # Pretend to save the file (but actually do nothing)
    print(f"🔊 Processing audio file: {audio_file.filename}...")
    print("🤖 Extracting fake features from the audio...")

    # Get fake predictions
    detected_types = predict_stuttering_type(audio_file.filename)

    # Prepare the response
    response = {
        "filename": audio_file.filename,
        "detected_stuttering_types": detected_types,
        "message": "🎉 Done! Remember, these predictions are completely random. 😄"
    }
    return response

# Run the FastAPI app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)