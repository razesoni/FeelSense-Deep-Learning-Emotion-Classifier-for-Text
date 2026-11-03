from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from src.schemas import TextInput, PredictionResponse, HealthResponse
from src.model_loader import dl_model, lifespan
from src.predictor import predict

"""
1. Create the Fastapi app.
A. Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins.
B. Mount the static files (HTML, CSS, JS).
"""

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.mount('/static', StaticFiles(directory="static"), name="static")

"""
2. API Endpoints. 
A. Serve  UI at homepage ('/')
B. Health Check Endpoint ('/health')
C. Predict Emotion Endpoint ('/predict')
"""

# A. Server UI at homepage ('/')
@app.get('/', include_in_schema=False)
def serve_ui():
    return FileResponse('static/index.html')

# B. Health Check Endpoint ('/health')
@app.get('/health', response_model=HealthResponse)
def health_check():
    return HealthResponse(status="Server is running", model_loaded=bool(dl_model))

# C. Predict Emotion Endpoint ('/predict')
@app.post('/predict', response_model=PredictionResponse)
def predict_emotion(text_input: TextInput):
    # 1. Load the model
    BiGRU_model = dl_model.get("BiGRU")
    tokenizer_model = dl_model.get("tokenizer")

    if BiGRU_model is None or tokenizer_model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet. Please try again later.")

    return predict(text_input.text, BiGRU_model, tokenizer_model)
