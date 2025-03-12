import json

schedule_data = {
    "Monday": [
        {
            "subject": "Neural Networks",
            "hours": 2.0,
            "details": [
                "Study lecture: 6 (PDF)",
                "Rewatch lecture: 5 & take notes"
            ]
        },
        {
            "subject": "Image Processing",
            "hours": 3.0,
            "details": [
                "Study lecture: 6 (PDF)"
            ]
        }
    ],
    "Tuesday": [
        {
            "subject": "Image Processing",
            "hours": 3.0,
            "details": [
                "Rewatch lecture: 5 & take notes"
            ]
        },
        {
            "subject": "Logic Programming",
            "hours": 2.0,
            "details": [
                "Study lecture: 6 (PDF)"
            ]
        }
    ],
    "Wednesday": [
        {
            "subject": "Logic Programming",
            "hours": 2.0,
            "details": [
                "Summarize key points from lecture: 5"
            ]
        },
        {
            "subject": "DSP",
            "hours": 3.0,
            "details": [
                "Study lecture: 6 (PDF)"
            ]
        }
    ]
}

print(json.dumps(schedule_data))
