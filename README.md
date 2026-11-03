# Emotion Detection (BiGRU)

## Structure
```
emotion-detection/
├── main.py              # FastAPI app + API endpoints only
├── requirements.txt
├── Artifacts/           # put BiGRU_model.keras and tokenizer.pkl here
├── src/
│   ├── config.py        # paths, max length, labels, emojis
│   ├── preprocessing.py # text cleaning
│   ├── schemas.py       # request/response models
│   ├── model_loader.py  # model + tokenizer loading (lifespan)
│   └── predictor.py     # inference logic
└── static/
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## Run
```
pip install -r requirements.txt
uvicorn main:app --reload
```
Open http://127.0.0.1:8000 for the web app, http://127.0.0.1:8000/docs for the API docs.

## Run with Docker
The Docker image includes the trained model and tokenizer from `Artifacts/`.

```
docker build -t emotion-detection .
docker run --rm -p 10000:10000 emotion-detection
```

Open http://localhost:10000. The container listens on Render's `PORT` environment
variable (defaulting to `10000`) and provides a health check at `/health`.

## Deploy on Render
1. Push this repository, including `Artifacts/BiGRU_model.keras` and
   `Artifacts/tokenizer.pkl`, to GitHub.
2. In Render, create a **Web Service** from the repository and select **Docker**
   as the runtime. Render will build the root `Dockerfile`.
3. Set the health check path to `/health` and deploy. Choose an instance with
   enough memory for TensorFlow and the model.
4. To let GitHub Actions trigger Render deployments after pushes to `main`,
   create a deploy hook for the service in Render and add its URL as the
   repository Actions secret `RENDER_DEPLOY_HOOK_URL`. The workflow builds the
   Docker image on pushes and pull requests; without this secret, it only builds
   and does not trigger a deployment.
