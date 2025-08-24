import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import numpy as np
import librosa
import io
import threading
import onnxruntime as ort
import cv2
import uvicorn
import requests

app = FastAPI()

# ----------------- CLASS LABELS ----------------- #

PULMONARY_CLASSES = [
    "Healthy",
    "URTI",
    "Asthma",
    "COPD",
    "LRTI",
    "Bronchiectasis",
    "Pneumonia",
    "Bronchiolitis"
]

SKIN_CLASSES = [
    "acne",
    "bacterial_impetigo_cellulitis_flag",
    "bad_image",
    "eczema_dermatitis",
    "other_uncertain",
    "psoriasis",
    "suspicious_mole_flag",
    "tinea_ringworm",
    "urticaria_hives"
]

# ----------------- MODEL MANAGEMENT ----------------- #

models = {}
model_locks = {
    "predictor": threading.Lock(),
    "diagnostic": threading.Lock()
}

MODEL_DIR = "model"
PULMONARY_MODEL_PATH = os.path.join(MODEL_DIR, "pulmonary_model.keras")
SKIN_MODEL_PATH = os.path.join(MODEL_DIR, "skin_model.onnx")

# ✅ Replace with your actual Google Drive file ID
GOOGLE_DRIVE_FILE_ID = "1k7oNHlcNRwDUnzZoPq2A3O-f8gb0H5cw"
GDRIVE_URL = f"https://drive.google.com/uc?export=download&id={GOOGLE_DRIVE_FILE_ID}"

os.makedirs(MODEL_DIR, exist_ok=True)


def download_skin_model():
    """Download skin_model.onnx from Google Drive if not already present."""
    if not os.path.exists(SKIN_MODEL_PATH):
        print("📥 Downloading skin_model.onnx from Google Drive...")
        r = requests.get(GDRIVE_URL)
        if r.status_code == 200:
            with open(SKIN_MODEL_PATH, "wb") as f:
                f.write(r.content)
            print("✅ skin_model.onnx downloaded successfully!")
        else:
            raise RuntimeError(f"❌ Failed to download model: {r.status_code}")


def get_model(name: str, path: str, backend: str = "keras"):
    """Lazy-loads a model (Keras or ONNX) and caches it in memory."""
    if name not in models:
        with model_locks[name]:
            if name not in models:  # Double-check inside lock
                if backend == "keras":
                    from tensorflow.keras.models import load_model
                    print(f"⚡ Loading {name} model with Keras...")
                    models[name] = load_model(path)
                elif backend == "onnx":
                    print(f"⚡ Loading {name} model with ONNX Runtime...")
                    models[name] = ort.InferenceSession(path)
                print(f"✅ {name} model loaded!")
    return models[name]


# ----------------- AUDIO FEATURE EXTRACTOR ----------------- #

def extract_audio_features(file_bytes, sr=22050, duration=5):
    """Extracts numerical features from an audio file (wav/mp3)."""
    try:
        y, _ = librosa.load(io.BytesIO(file_bytes), sr=sr, duration=duration)
        features = []

        # MFCC
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        features.extend(np.mean(mfccs, axis=1))

        # Polynomial coefficients
        poly = librosa.feature.poly_features(y=y, sr=sr)
        features.extend(np.mean(poly, axis=1))

        # Chroma
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        features.extend(np.mean(chroma, axis=1))

        # Spectral features
        features.append(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
        features.append(
            np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr)))
        features.append(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))
        features.append(np.mean(librosa.feature.spectral_flatness(y=y)))
        features.append(np.mean(librosa.feature.zero_crossing_rate(y=y)))
        features.append(np.mean(librosa.feature.rms(y=y)))

        return np.array(features, dtype=np.float32)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Audio processing error: {str(e)}")


# ----------------- ENDPOINTS ----------------- #

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
    Chest_Location_Lr: int = Form(...),
):
    """Pulmonary disease prediction from audio + patient data."""
    try:
        model = get_model("predictor", PULMONARY_MODEL_PATH, backend="keras")

        audio_bytes = await file.read()
        audio_features = extract_audio_features(audio_bytes)

        patient_features = np.array([
            Age, BMI, Is_Adult, Has_Crackles, Has_Wheezes,
            SBP, DBP, HR, SpO2,
            Sex_M, Chest_Location_Al, Chest_Location_Ar,
            Chest_Location_Pl, Chest_Location_Pr,
            Chest_Location_Ll, Chest_Location_Lr
        ], dtype=np.float32)

        # Combine patient + audio features
        x_input = np.concatenate([patient_features, audio_features], axis=0)
        x_input = np.expand_dims(x_input, axis=0)

        prediction = model.predict(x_input)
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        predicted_label = PULMONARY_CLASSES[predicted_class]

        return {
            "model": "pulmonary",
            "prediction": predicted_class,
            "label": predicted_label
        }
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Prediction error: {str(e)}")


@app.post("/diagnose")
async def diagnose(file: UploadFile = File(...)):
    """Skin condition diagnosis from an uploaded image."""
    try:
        # Ensure model exists locally
        download_skin_model()
        model = get_model("diagnostic", SKIN_MODEL_PATH, backend="onnx")

        image_bytes = await file.read()
        img_array = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        img = cv2.resize(img, (224, 224))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0).transpose(0, 3, 1, 2)

        input_name = model.get_inputs()[0].name
        output_name = model.get_outputs()[0].name

        prediction = model.run([output_name], {input_name: img})[0]
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        predicted_label = SKIN_CLASSES[predicted_class]

        return {
            "model": "skin",
            "diagnosis": predicted_class,
            "label": predicted_label
        }
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Diagnosis error: {str(e)}")


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "Backend is running!", "endpoints": ["/predict", "/diagnose"]}


# ----------------- ENTRYPOINT (for Railway/Render/etc.) ----------------- #

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Railway/Render set $PORT
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
