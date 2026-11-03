from contextlib import asynccontextmanager
from fastapi import FastAPI
from keras.models import load_model
import pickle

from src.config import model_path, tokenizer_path



dl_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Model Loading and LifeSpan Management
    Load the model and tokenizer once the server starts up."""
    
    print("Loading the model and tokenizer...")
    dl_model["BiGRU"] = load_model(model_path)
    with open(tokenizer_path, 'rb') as file:
        dl_model["tokenizer"] = pickle.load(file)
    print("model are loaded successfully...")

    yield

    dl_model.clear()
