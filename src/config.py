"""
Constants used across the application:
A. Model Path (BiGRU)
B. Tokenizer Path
C. Max Sequence Length
D. Emotion Labels
E. Emotion Emojis
"""

# model path
model_path = "Artifacts/BiGRU_model.keras"

# tokenizer path
tokenizer_path = "Artifacts/tokenizer.pkl"

# Max Sequence Length
max_sequence_length = 50

# Emotion Labels
emotion_labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']

# Emotion emojis
EMOTION_EMOJIS = {
    "sadness": "😢",
    "joy": "😊",
    "love": "❤️",
    "anger": "😡",
    "fear": "😨",
    "surprise": "😲"
}
