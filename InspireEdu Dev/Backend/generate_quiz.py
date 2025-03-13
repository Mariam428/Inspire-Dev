import re
import sys
import PyPDF2
import requests

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with a single space
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # Remove non-ASCII characters
    return text.strip()

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

def main(pdf_path, quiz_path, api_key, num_questions=5):
    # Step 1: Extract text from PDF
    pdf_text = extract_text_from_pdf(pdf_path)

    # Step 2: Clean the text
    cleaned_text = clean_text(pdf_text)

    # Step 3: Generate MCQs
    mcqs = generate_mcqs(api_key, cleaned_text, num_questions)

    # Step 4: Save MCQs to a file
    if mcqs:
        with open(quiz_path, "w") as quiz_file:
            quiz_file.write(mcqs)
        print(f"Quiz saved to {quiz_path}")
    else:
        print("No MCQs generated.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_quiz.py <pdf_path> <quiz_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    quiz_path = sys.argv[2]
    API_KEY = "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"  # Replace with your actual API key

    main(pdf_path, quiz_path, API_KEY)