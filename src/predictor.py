import numpy as np
from tensorflow.keras.preprocessing.sequence import pad_sequences

from src.config import max_sequence_length, emotion_labels
from src.preprocessing import preprocess_text
from src.schemas import PredictionResponse


def predict(text: str, BiGRU_model, tokenizer_model) -> PredictionResponse:
    # 2.. Clean the input sentences.
    cleaned_text = preprocess_text(text)

    # 2. Convert the words into numeric using tokenizer.
    # 3. Pad the sequences to ensure uniform length.
    tokenized_text = tokenizer_model.texts_to_sequences([cleaned_text])
    padded_sequence = pad_sequences(
        tokenized_text,
        maxlen=max_sequence_length,
        padding="post",
        truncating="post"
    )

    # 4. Run prediction using the BiGRU model.
    # Return the top emotion and full probability breakdown.
    probabilities     = BiGRU_model.predict(padded_sequence)[0]
    top_emotion_index = int(np.argmax(probabilities))
    all_probabilities = {
        label: float(prob) for prob, label in zip(probabilities, emotion_labels)
    }
    return PredictionResponse(
        text = text,
        predicted_emotion= emotion_labels[top_emotion_index],
        confidence=float(probabilities[top_emotion_index]),
        all_probabilities= all_probabilities
    )
