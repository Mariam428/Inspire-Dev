import sys
import io
import fitz  
import re
import numpy as np
import math
import json
import requests
import nltk
import pysbd
from fpdf import FPDF
from PIL import Image
import pytesseract
import torch
from transformers import pipeline, AutoTokenizer
from sentence_transformers import SentenceTransformer

# UTF-8 stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
nltk.download("punkt")

# Hugging Face login
from huggingface_hub import login
HUGGINGFACE_TOKEN = "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"
login(HUGGINGFACE_TOKEN)

# Model and tokenizer
flan_model = "mariam16elgohary/flan_on_arxiv_mit_lectures6_prompt3"
flan_tokenizer = AutoTokenizer.from_pretrained(flan_model)
flan_prompt = "Summarize the following technical lecture text. Ensure the output is structured, preserve keypoints and avoid repetition or factual errors."

# CLI args
if len(sys.argv) < 3:
    print("[ERROR] Usage: python summarize.py <pdf_path> <summary_path>")
    sys.exit(1)

pdf_path = sys.argv[1]
summary_path = sys.argv[2]
print(f"PDF Path: {pdf_path}")
print(f"Saving to: {summary_path}")

def extract_text_from_pdf(pdf_path):
    pdf_document = fitz.open(pdf_path)
    full_text = ""

    for page in pdf_document:
        text = page.get_text().strip()
        full_text += text + "\n"

        if not text:
            for img in page.get_images(full=True):
                xref = img[0]
                base_image = pdf_document.extract_image(xref)
                img_bytes = base_image["image"]
                img_pil = Image.open(io.BytesIO(img_bytes))
                text_from_img = pytesseract.image_to_string(img_pil, lang='eng')
                full_text += text_from_img + "\n"

    pdf_document.close()
    return full_text

def preprocess_lecture_text(text):
    text = re.sub(r'\b(?:Page|p|P)\s?\d+[a-zA-Z]*\b', '', text)
    text = re.sub(r'\b\d+\b', '', text)
    text = re.sub(r'\bDr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b', '', text)
    text = re.sub(r'\bDr\.?\s+[A-Z][a-z]+\b', '', text)
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', '', text)
    text = re.sub(r'Course Outline\b[\s\S]*?(?=\n\w)', '', text)
    text = re.sub(r'Grades\b[\s\S]*?(?=\n\w)', '', text)
    text = re.sub(r'[•–*]', '', text)
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r',\s*(?=\w)', '', text)
    return text

from nltk.tokenize import sent_tokenize
def semantic_chunk(text, tokenizer, max_tokens=512, reserve_tokens=5):
    adjusted_max = max_tokens - reserve_tokens
    sents = sent_tokenize(text)
    chunks, current = [], ""

    for sent in sents:
        if len(tokenizer.encode(current + " " + sent, add_special_tokens=False)) <= adjusted_max:
            current += " " + sent
        else:
            if current:
                chunks.append(current.strip())
            current = sent

    if current:
        chunks.append(current.strip())
    return chunks

def run_summarizer(model_name, input_chunks, prompt=None, **kwargs):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    summarizer = pipeline("summarization", model=model_name, tokenizer=tokenizer, truncation=True)

    summaries = []
    for chunk in input_chunks:
        input_text = prompt + " " + chunk if prompt else chunk
        result = summarizer(input_text, do_sample=False, **kwargs)
        summaries.append(result[0]['summary_text'])
    return " ".join(summaries)

def highlight_text(text):
    API_KEY = "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"
    MODEL = "deepseek/deepseek-r1-zero:free"
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""
    Process the following text and return it as HTML code:
    1. Bold the key points using HTML <b> tags.
    2. Chunk into topics, each topic is wrapped in <p> tags and with a title in <h> tags.
    3. Ensure the output is clean and ready to be displayed on a webpage.

    Here’s the text:

    {text}
    """

    response = requests.post(url, headers=headers, data=json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}]
    }))
    response.raise_for_status()
    raw_html = response.json()["choices"][0]["message"]["content"]

    raw_html = re.sub(r"```html\s*", "", raw_html)
    raw_html = re.sub(r"```", "", raw_html)
    return raw_html

def save_to_pdf(text, output_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font("DejaVu", "", "DejaVuSans.ttf", uni=True)
    pdf.set_font("DejaVu", size=12)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.multi_cell(0, 10, text)
    pdf.output(output_path)

def summarize_pdf(file_path, summary_path):
    raw_text = extract_text_from_pdf(file_path)
    preprocessed = preprocess_lecture_text(raw_text)
    chunks = semantic_chunk(preprocessed, flan_tokenizer)

    summary = run_summarizer(
        flan_model, chunks, prompt=flan_prompt,
        max_length=500, min_length=100,
        no_repeat_ngram_size=3,
        repetition_penalty=1.3,
        early_stopping=True,
        length_penalty=1.0
    )

    html_result = highlight_text(summary)

    with open(summary_path.replace(".pdf", ".html"), "w", encoding="utf-8") as f:
        f.write(html_result)

    save_to_pdf(summary, summary_path)
    print(f"[DONE] PDF + HTML summary saved.")

if __name__ == "__main__":
    summarize_pdf(pdf_path, summary_path)
