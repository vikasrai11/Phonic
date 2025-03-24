from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from typing import List
import uvicorn
import google.generativeai as genai

# Initialize FastAPI app
app = FastAPI(title="Stuttering Detection API", description="API for detecting stuttering types and providing speech therapy suggestions. 😄")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (update for production)
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define stuttering types
STUTTERING_TYPES = ["Prolongation", "Block", "SoundRep", "WordRep", "Interjection"]

# Configure Gemini API
GEMINI_API = "AIzaSyBa3u5k6ZmL0wa8k0oAHoesMeuWyl0Zdh8"  # Replace with your Gemini API key
genai.configure(api_key=GEMINI_API)
model = genai.GenerativeModel('gemini-2.0-flash')  # Use the Gemini Pro model

# Function to generate speech therapy suggestions using Gemini API
def generate_speech_therapy(detected_types: List[str]) -> str:
    """
    Generate speech therapy suggestions for the detected stuttering types using Gemini API.
    """
    if not detected_types:
        return "No stuttering types detected. No therapy suggestions available."

    # Create a prompt for Gemini
    prompt = (
        f"Provide speech therapy suggestions for the following stuttering types: {', '.join(detected_types)}. "
        "Keep the suggestions concise and practical."
    )

    # Call the Gemini API
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "Unable to generate therapy suggestions at the moment."

# Fake inference function (replace with your actual model logic)
def predict_stuttering_type(audio_file_path: str) -> List[str]:
    """
    Fake inference function that pretends to predict stuttering types from an audio file.
    """
    # Generate random predictions for the 5 stuttering types
    predictions = np.random.rand(len(STUTTERING_TYPES))  # Random probabilities
    predictions = (predictions > 0.5).astype(int)  # Convert to binary predictions

    # Map predictions to stuttering types
    detected_types = [stutter_type for stutter_type, pred in zip(STUTTERING_TYPES, predictions) if pred == 1]
    return detected_types

# API endpoint for stuttering detection
@app.post("/detect-stuttering/", response_model=dict)
async def detect_stuttering(audio_file: UploadFile = File(...)):
    """
    Endpoint to upload an audio file, detect stuttering types, and provide speech therapy suggestions.
    """
    # Check if the uploaded file is an audio file
    if not audio_file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an audio file.")

    # Pretend to save the file (but actually do nothing)
    print(f"🔊 Processing audio file: {audio_file.filename}...")
    print("🤖 Extracting from the audio...")

    # Get fake predictions
    detected_types = predict_stuttering_type(audio_file.filename)

    # Generate speech therapy suggestions using Gemini API
    therapy_suggestions = generate_speech_therapy(detected_types)

    # Prepare the response
    response = {
        "filename": audio_file.filename,
        "detected_stuttering_types": detected_types,
        "therapy_suggestions": therapy_suggestions,
        "message": "🎉 Done! Here are your results and therapy suggestions. 😄"
    }
    return response

# Run the FastAPI app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)