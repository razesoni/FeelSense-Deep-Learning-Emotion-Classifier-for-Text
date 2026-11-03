<div align="center">

# FeelSense — Emotion Classifier for Text

**Turn a sentence into an emotion, confidence score, and visual response.**

FeelSense is a text-emotion classification demo powered by a trained bidirectional GRU (BiGRU), a FastAPI inference service, and an interactive browser interface called **Mood Mirror**.

[Notebook](emotion_detection.ipynb) · [API docs](#api) · [Run locally](#run-locally) · [Deploy on Render](#deploy-on-render)

</div>

---

## What it does

Enter a sentence and FeelSense predicts one of six emotion classes:

| Emotion | Interface cue |
| --- | --- |
| Sadness | 😢 |
| Joy | 😊 |
| Love | ❤️ |
| Anger | 😡 |
| Fear | 😨 |
| Surprise | 😲 |

The app returns the predicted class, its confidence, and the probability for every class. Mood Mirror presents the result with a matching illustrated face, color theme, and probability bars. The project is an educational text-classification demo; predictions are model estimates, not a psychological assessment.

## Model and notebook

The training and experimentation workflow is documented in [`emotion_detection.ipynb`](emotion_detection.ipynb). It loads the [`dair-ai/emotion` dataset on Hugging Face](https://huggingface.co/datasets/dair-ai/emotion), explores the six emotion labels, and compares recurrent neural network architectures before saving the BiGRU model and tokenizer used by the app.

### Training workflow

1. Load the dataset's training and test splits and map numeric labels to emotion names.
2. Inspect the distribution of the six classes.
3. Fit a Keras tokenizer with a 10,000-word limit and an `<unk>` out-of-vocabulary token; pad or truncate sequences to 50 tokens.
4. Calculate balanced class weights and use early stopping on validation loss (patience 3, restore best weights).
5. Train and compare stacked SimpleRNN, LSTM, and GRU baselines.
6. Build a stacked **bidirectional GRU** with a 300-dimensional embedding, GRU layers with 128 and 64 units, 0.5 dropout, and a six-class softmax output.

The notebook's stored tokenizer reports a vocabulary index size of 15,213. The deployed predictor uses the tokenizer and sequence length of 50 associated with the saved model artifact.

### Recorded baseline results

These are the test results recorded in the notebook for the three foundational, non-bidirectional models:

| Baseline | Test loss | Test accuracy |
| --- | ---: | ---: |
| Simple RNN | 1.7869 | 16.00% |
| LSTM | 1.7869 | 29.10% |
| GRU | 1.7920 | 11.65% |

These figures are for the baseline models only—not the deployed BiGRU. In the notebook, test data is also supplied as validation data for the LSTM and GRU runs, so these results should be treated as experiment notes rather than a strict, independent model comparison. No final BiGRU test metric is claimed here.

## Application architecture

```text
Browser (Mood Mirror)
       │  POST /predict { "text": "..." }
       ▼
FastAPI (main.py)
       ├── preprocess text       src/preprocessing.py
       ├── tokenize and pad      src/predictor.py
       ├── infer with BiGRU      Artifacts/BiGRU_model.keras
       └── return class scores  src/schemas.py
```

The model and tokenizer are loaded once at application startup using FastAPI's lifespan handler in `src/model_loader.py`. Input text is lowercased, apostrophes are removed, non-alphanumeric characters are replaced with spaces, and repeated whitespace is collapsed. The resulting text is converted to token IDs and post-padded or truncated to 50 tokens before inference.

### Repository layout

```text
.
├── emotion_detection.ipynb       Dataset exploration and model experiments
├── main.py                       FastAPI app, UI serving, and API routes
├── requirements.txt              Runtime Python dependencies
├── Dockerfile                    Container build and startup command
├── Artifacts/
│   ├── BiGRU_model.keras         Trained classifier (~39.6 MiB)
│   └── tokenizer.pkl             Fitted text tokenizer
├── src/
│   ├── config.py                 Artifact paths, labels, and sequence length
│   ├── model_loader.py           Startup loading and shutdown cleanup
│   ├── predictor.py              Tokenization, inference, and response mapping
│   ├── preprocessing.py          Input text normalization
│   └── schemas.py                Pydantic request and response models
├── static/
│   ├── index.html                Mood Mirror page
│   ├── css/style.css             Responsive styling and emotion themes
│   └── js/
│       ├── app.js                Health checks, API calls, and result rendering
│       └── faces.js              Hand-drawn SVG emotion faces
└── .github/workflows/
    └── render-deploy.yml         Docker build and optional Render deploy trigger
```

## Run locally

### Requirements

- Python 3.11 or newer
- The two model artifacts in `Artifacts/` (included in the repository and Docker image)

Install the application dependencies and start the API/web server:

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) for Mood Mirror, or [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for the interactive API documentation.

### Run the notebook

The notebook uses additional experimentation dependencies that are not in the web-app `requirements.txt`, including Jupyter, `datasets`, pandas, matplotlib, seaborn, and scikit-learn. Install those in a separate environment as needed, then open the notebook:

```bash
pip install jupyter datasets pandas matplotlib seaborn scikit-learn tensorflow
jupyter notebook emotion_detection.ipynb
```

The notebook downloads the dataset from Hugging Face when run. Reproducing the deployed artifacts requires saving the fitted tokenizer and the trained BiGRU model at the paths configured in `src/config.py`:

- `Artifacts/BiGRU_model.keras`
- `Artifacts/tokenizer.pkl`

## API

### `GET /health`

Returns the service status and whether the model is loaded:

```json
{
  "status": "Server is running",
  "model_loaded": true
}
```

### `POST /predict`

Request body (text must be 1–2,000 characters):

```json
{
  "text": "I feel so happy and excited about the trip"
}
```

Response:

```json
{
  "text": "I feel so happy and excited about the trip",
  "predicted_emotion": "joy",
  "confidence": 0.91,
  "all_probabilities": {
    "sadness": 0.01,
    "joy": 0.91,
    "love": 0.03,
    "anger": 0.01,
    "fear": 0.02,
    "surprise": 0.02
  }
}
```

The values above illustrate the response shape; actual scores depend on the input and model. If the model or tokenizer is unavailable, the endpoint responds with HTTP `503` until they are loaded. Invalid input is validated by Pydantic.

## Run with Docker

The root `Dockerfile` uses `python:3.11-slim`, installs `requirements.txt`, and copies the API, frontend, and model artifacts into the image. The server binds to `0.0.0.0` and uses the `PORT` environment variable (default `10000`).

```bash
docker build -t feelsense .
docker run --rm -p 10000:10000 feelsense
```

Visit [http://localhost:10000](http://localhost:10000). The container exposes port `10000`; `/health` is available for service health checks.

## Deploy on Render

1. Push the repository to GitHub with `Artifacts/BiGRU_model.keras` and `Artifacts/tokenizer.pkl` present.
2. In Render, create a **Web Service** from the repository and choose **Docker** as the runtime. Render will build the root `Dockerfile`.
3. Configure the health check path as `/health`. Select an instance with enough memory for TensorFlow and the model.
4. Deploy. The service reads Render's `PORT` environment variable (falling back to `10000`).

### Optional GitHub Actions deployment trigger

The workflow at `.github/workflows/render-deploy.yml` builds the Docker image on pushes, pull requests, and manual runs. It sends a deployment request only for a push to `main`, and only when the repository Actions secret `RENDER_DEPLOY_HOOK_URL` is set. Without that secret, the image build still runs and deployment is skipped.

## Configuration and notes

- Emotion labels and ordering are defined in `src/config.py`; the model output indices must match this order: `sadness`, `joy`, `love`, `anger`, `fear`, `surprise`.
- Maximum inference sequence length is 50 tokens. The browser allows up to 2,000 characters per input.
- The API currently enables CORS for all origins. If exposing the service beyond a demo, restrict `allow_origins` in `main.py` to the intended frontend origin(s).
- The model artifact and tokenizer are runtime requirements; keep them together and compatible when replacing or retraining the model.


