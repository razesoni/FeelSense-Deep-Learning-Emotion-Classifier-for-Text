import re

""" 
Preprocess the upcoming text
A. Convert raw text to lowercase.
B. Remove apostrophes (e.g can't -> cant)
C. Remove Special Characters and Punctuation
D. Remove extra spaces
"""

def preprocess_text(text: str) -> str:
    """Cleans the raw text to match the training format"""
    text = text.lower()
    text = re.sub(r"'","", text)
    text = re.sub(r"[^a-z0-9\s]"," ", text)
    text = re.sub(r"\s+"," ", text).strip()
    return text
