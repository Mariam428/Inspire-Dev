import re
import sys
import PyPDF2
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

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

    **Format each question as follows:**
    1. Start with the question number and the question text.
    2. Add the difficulty level in parentheses, surrounded by asterisks, e.g., **(Easy)**, **(Medium)**, **(Hard)**.
    3. List the answer choices, each starting with A), B), C), D), etc., on separate lines.
    4. End with the correct answer in the format: **Answer:** X) Correct Answer.

    Example:
    **1. What does the IoT equation "Physical Object + Controller, Sensor and Actuator + Internet" represent? (Easy)**
    A) Traditional networking
    B) Internet of Things (IoT)
    C) Cloud computing architecture
    D) Ambient Intelligence (AmI)
    **Answer:** B) Internet of Things (IoT)

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
            return ""
    except requests.exceptions.RequestException as e:
        print(f"API Request Failed: {e}")
        return ""
    except ValueError as e:
        print(f"Failed to Parse JSON: {e}")
        return ""

def save_quiz_to_pdf(quiz_path, mcqs):
    # Create a PDF file
    c = canvas.Canvas(quiz_path, pagesize=letter)
    width, height = letter  # Get the dimensions of the page

    # Set font and size
    c.setFont("Helvetica", 12)

    # Split the MCQs into lines and write to PDF
    lines = mcqs.split("\n")
    y_position = height - 50  # Start 50 units from the top

    for line in lines:
        if y_position < 50:  # Add a new page if we run out of space
            c.showPage()
            y_position = height - 50
            c.setFont("Helvetica", 12)

        # Format the line based on its content
        if line.strip().startswith("**") and line.strip().endswith("**"):
            # Bold text for questions and answers
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, line.strip("**"))
            y_position -= 15
        elif line.strip().startswith("A)") or line.strip().startswith("B)") or line.strip().startswith("C)") or line.strip().startswith("D)"):
            # Regular text for answer choices
            c.setFont("Helvetica", 12)
            c.drawString(50, y_position, line.strip())
            y_position -= 15
        elif line.strip().startswith("**Answer:**"):
            # Bold text for the correct answer
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, line.strip())
            y_position -= 15
        else:
            # Regular text for other lines
            c.setFont("Helvetica", 12)
            c.drawString(50, y_position, line.strip())
            y_position -= 15

    # Save the PDF
    c.save()
    print(f"Quiz saved to {quiz_path}")

def main(pdf_path, quiz_path, api_key, num_questions=5):
    # Step 1: Extract text from PDF
    pdf_text = extract_text_from_pdf(pdf_path)

    # Step 2: Clean the text
    cleaned_text = clean_text(pdf_text)

    # Step 3: Generate MCQs
    mcqs = generate_mcqs(api_key, cleaned_text, num_questions)

    # Step 4: Save MCQs to a PDF file
    if mcqs:
        save_quiz_to_pdf(quiz_path, mcqs)
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