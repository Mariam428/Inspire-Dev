import re
import requests
import PyPDF2
import sys
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")



# Step 1: Extract text from PDF
def extract_text_from_pdf(pdf_path):
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text

# Step 2: Clean the extracted text
def clean_text(text):
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with a single space
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # Remove non-ASCII characters
    return text.strip()

# Step 3: Generate MCQs using OpenRouter API
def generate_mcqs(api_key, text, num_questions=5):
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    prompt = f"""
    Generate {num_questions} multiple-choice questions (MCQs) based on the following text.
    The questions should be a mix of easy, medium, and hard difficulty levels:
    - Easy: Questions that test basic recall of facts.
    - Medium: Questions that require understanding of concepts.
    - Hard: Questions that require analysis, synthesis, or application of knowledge.
    Label each question with its difficulty level in parentheses, e.g., (Easy), (Medium), (Hard).
    Text: {text}
    """
    payload = {
        "model": "deepseek/deepseek-r1:free",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app-url.com",
        "X-Title": "MCQ Generator"
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        if "choices" in response_data:
            return response_data["choices"][0]["message"]["content"]
        else:
            print("Unexpected API response format.")
            return []
    except requests.exceptions.RequestException as e:
        print(f"API Request Failed: {e}")
        return []
    except ValueError as e:
        print(f"Failed to Parse JSON: {e}")
        return []

# Main function to run the entire workflow
def main(pdf_path, output_path, api_key, num_questions=5):
    # Step 1: Extract text from PDF
    print("Extracting text from PDF...")
    pdf_text = extract_text_from_pdf(pdf_path)

    # Step 2: Clean the text
    print("Cleaning text...")
    cleaned_text = clean_text(pdf_text)

    # Step 3: Generate MCQs
    print("Generating MCQs...")
    mcqs = generate_mcqs(api_key, cleaned_text, num_questions)

    # Step 4: Save MCQs to a file
    if mcqs:
        print("\nMCQs generated successfully!\n")
        with open(output_path, "w") as file:
            file.write(mcqs)
        print(f"Quiz saved to {output_path}")
    else:
        print("No MCQs generated.")

# Run the script
if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python main.py <pdf_path> <output_path> <api_key> [num_questions]")
        sys.exit(1)

    PDF_FILE_PATH = sys.argv[1]  # Path to your PDF file
    OUTPUT_PATH = sys.argv[2]    # Path to save the quiz
    API_KEY = sys.argv[3]        # Your OpenRouter API key
    NUM_QUESTIONS = int(sys.argv[4]) if len(sys.argv) > 4 else 5  # Number of MCQs to generate

    # Run the main function
    main(PDF_FILE_PATH, OUTPUT_PATH, API_KEY, NUM_QUESTIONS)