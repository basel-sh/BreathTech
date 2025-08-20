from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import numpy as np
import librosa
import io
import threading

app = FastAPI()

# Global variable for the model
model = None
model_lock = threading.Lock()  # Thread-safe loading


# Lazy model loading function
def get_model():
    global model
    if model is None:
        with model_lock:
            if model is None:  # Double-check locking
                from tensorflow.keras.models import load_model
                print("Loading AI model...")
                model = load_model("model/Final Predictor Prototype.keras")
                print("✅ Model loaded!")
    return model


# Function to extract audio features
def extract_audio_features(file_bytes, sr=22050, duration=5):
    try:
        y, _ = librosa.load(io.BytesIO(file_bytes), sr=sr, duration=duration)
        features = []

        # MFCC 0-19
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        features.extend(np.mean(mfccs, axis=1))

        # Spectral Poly Features 0-1
        poly = librosa.feature.poly_features(y=y, sr=sr)
        features.extend(np.mean(poly, axis=1))

        # Chroma 0-11
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        features.extend(np.mean(chroma, axis=1))

        # Spectral Centroid
        features.append(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))

        # Spectral Bandwidth
        features.append(
            np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr)))

        # Spectral Rolloff
        features.append(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))

        # Spectral Flatness
        features.append(np.mean(librosa.feature.spectral_flatness(y=y)))

        # Zero Crossing Rate
        features.append(np.mean(librosa.feature.zero_crossing_rate(y=y)))

        # RMS
        features.append(np.mean(librosa.feature.rms(y=y)))

        return np.array(features, dtype=np.float32)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Audio processing error: {str(e)}")


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    Age: float = Form(...),
    BMI: float = Form(...),
    Is_Adult: int = Form(...),
    Has_Crackles: int = Form(...),
    Has_Wheezes: int = Form(...),
    SBP: float = Form(...),
    DBP: float = Form(...),
    HR: float = Form(...),
    SpO2: float = Form(...),
    Sex_M: int = Form(...),
    Chest_Location_Al: int = Form(...),
    Chest_Location_Ar: int = Form(...),
    Chest_Location_Pl: int = Form(...),
    Chest_Location_Pr: int = Form(...),
    Chest_Location_Ll: int = Form(...),
    Chest_Location_Lr: int = Form(...)
):
    try:
        # Lazy-load model
        model = get_model()

        # Extract audio features
        audio_bytes = await file.read()
        audio_features = extract_audio_features(audio_bytes)

        # Patient features
        patient_features = np.array([
            Age, BMI, Is_Adult, Has_Crackles, Has_Wheezes,
            SBP, DBP, HR, SpO2,
            Sex_M, Chest_Location_Al, Chest_Location_Ar, Chest_Location_Pl,
            Chest_Location_Pr, Chest_Location_Ll, Chest_Location_Lr
        ], dtype=np.float32)

        # Combine patient + audio features → total ~56
        x_input = np.concatenate([patient_features, audio_features], axis=0)
        x_input = np.expand_dims(x_input, axis=0)

        # Predict
        prediction = model.predict(x_input)
        predicted_class = int(np.argmax(prediction, axis=1)[0])

        return {"prediction": predicted_class}

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Prediction error: {str(e)}")


@app.get("/")
def root():
    return {"status": "Pulmonary AI backend is running!"}
