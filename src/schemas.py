from pydantic import BaseModel, Field

"""
Request and Response Schemas
A. Text Input -> the text sent by user
B. Predict Response
C. Health Response (Server health check)
"""

class TextInput(BaseModel):
    text: str = Field(
        ..., 
        min_length=1,
        max_length=2000,
        description="The sentence to analyze",
        json_schema_extra={"example": "I feel so happy and excited"}
        )

class PredictionResponse(BaseModel):
    text: str
    predicted_emotion: str
    confidence: float
    all_probabilities: dict[str, float]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
