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
        "You are an experienced Speech-Language Pathologist (SLP) and an expert in diagnosing and treating stuttering disorders. "
        "Your task is to provide **precise, structured, and evidence-based speech therapy suggestions** "
        f"for the following stuttering types: {', '.join(detected_types)}. "
        "Your response should be **professionally structured**, well-organized, and directly applicable to therapy sessions.\n\n"

        "### Formatting Guidelines:\n"
        "1. **First, provide a brief explanation of each detected stuttering type** (causes, symptoms, and impact on speech fluency).\n"
        "2. **After the explanation, provide structured therapy techniques**, categorized under:\n"
        "   - **Fluency Shaping Techniques** (strategies to promote smooth speech)\n"
        "   - **Stuttering Modification Techniques** (methods to reduce tension and gain control over speech blocks)\n"
        "   - **Behavioral and Psychological Strategies** (ways to manage anxiety, confidence-building exercises)\n"
        "   - **Assistive Technology (if applicable)** (devices or software that aid in fluency improvement)\n\n"
        
        "### Output Formatting:\n"
        "1. **Use bold headings for each stuttering type**.\n"
        "2. **Use bullet points for therapy techniques to enhance readability**.\n"
        "3. **Do NOT include any introductory or concluding statements**—only provide explanations and therapy suggestions.\n"
        "4. **Ensure proper line spacing for clarity and easy reading**.\n\n"

        "Now, generate **concise and well-structured** therapy suggestions tailored to the detected stuttering types."
    )

    # Call the Gemini API
    try:
        response = model.generate_content(prompt)
        return response.text.replace("\n", "\n\n")  # Ensure line breaks for readability
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
    therapy_suggestions_text = generate_speech_therapy(detected_types)
    therapy_suggestions = []
    for stutter in detected_types:
        suggestions_list = [line.strip() for line in therapy_suggestions_text.split("\n") if line.strip()]
        therapy_suggestions.append({"type": stutter, "suggestions": suggestions_list})
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