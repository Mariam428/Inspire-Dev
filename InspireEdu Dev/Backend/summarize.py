import sys
import io
import fitz  
import re
import numpy as np
import pysbd
import math
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.signal import argrelextrema
from fpdf import FPDF
import torch

# Force UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("[OK] Script started")
print(torch.cuda.is_available())  # Should print True if CUDA is available
print(torch.cuda.device_count())  # Should print the number of GPUs available

if len(sys.argv) < 3:
    print("[ERROR] Incorrect arguments. Usage: python summarize.py <pdf_path> <summary_path>")
    sys.exit(1)

pdf_path = sys.argv[1]
summary_path = sys.argv[2]
print(f"PDF Path: {pdf_path}")


def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text

def clean_text(text):
    patterns = [r'^\d+\.\d{4}\s+LECTURE\s+\d+$', r'^\d+$']  # Page numbers, headers
    for pattern in patterns:
        text = re.sub(pattern, '', text, flags=re.MULTILINE)
    return text

def preprocess_text(text):
    text = re.sub(r'[^a-zA-Z0-9\s.,•\t-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def activate_similarities(similarities, p_size=10):
    x = np.linspace(-10, 10, p_size)
    y = np.vectorize(lambda x: 1 / (1 + math.exp(0.5 * x)))
    activation_weights = np.pad(y(x), (0, similarities.shape[0] - p_size))
    diagonals = [np.pad(similarities.diagonal(each), (0, similarities.shape[0] - len(similarities.diagonal(each))))
                 for each in range(0, similarities.shape[0])]
    activated_similarities = np.sum(np.stack(diagonals) * activation_weights.reshape(-1, 1), axis=0)
    return activated_similarities

def chunk_text(text, max_length=500):
    words = text.split()
    return [" ".join(words[i:i + max_length]) for i in range(0, len(words), max_length)]

def summarize_pdf(file_path, summary_file_path):
    raw_text = extract_text_from_pdf(file_path)
    raw_text = clean_text(raw_text)
    cleaned_text = preprocess_text(raw_text)

    segmenter = pysbd.Segmenter(language="en", clean=False)
    sentences = segmenter.segment(cleaned_text)
    sentences = [s for s in sentences if len(s.split()) > 3]

    model = SentenceTransformer('all-mpnet-base-v2')
    embeddings = model.encode(sentences)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / norms
    similarities = cosine_similarity(embeddings)
    activated_similarities = activate_similarities(similarities, p_size=10)
    minimas = argrelextrema(activated_similarities, np.less, order=2)

    split_points = list(minimas[0])
    topic_chunks = []
    chunk = []
    for i, sentence in enumerate(sentences):
        if i in split_points:
            topic_chunks.append(" ".join(chunk))
            chunk = [sentence]
        else:
            chunk.append(sentence)
    if chunk:
        topic_chunks.append(" ".join(chunk))

    summarizer = pipeline("summarization", model="t5-small", device=-1)
    summaries = []
    for chunk in topic_chunks:
        for sub_chunk in chunk_text(chunk):
            summary = summarizer(sub_chunk, max_length=150, min_length=50, do_sample=False)[0]['summary_text']
            summaries.append(summary)

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, "\n\n".join(summaries))
    pdf.output(summary_file_path)

if __name__ == "__main__":
    summarize_pdf(pdf_path, summary_path)
