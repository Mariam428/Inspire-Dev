import json

try:
    # Load the input files
    with open("temp_availability.json", "r") as f:
        availability = json.load(f)
    with open("temp_grades.json", "r") as f:
        grades = json.load(f)

    # TODO: Replace below with your dynamic schedule generation using availability & grades
    schedule_data = {
        "Monday": [
            {
                "subject": "Neural Networks",
                "hours": 2.0,
                "details": [
                    "Study lecture: 6 (PDF)",
                    "Rewatch lecture: 5 & take notes"
                ]
            }
        ],
        "Tuesday": [
            {
                "subject": "NLP",
                "hours": 2.0,
                "details": [
                    "Review notes and solve exercises"
                ]
            }
        ]
    }

    print(json.dumps(schedule_data))  # ✅ This should be the final printed output
except Exception as e:
    # Fail-safe: print error as JSON so Node.js can still parse it
    print(json.dumps({"error": f"Python script crashed: {str(e)}"}))
