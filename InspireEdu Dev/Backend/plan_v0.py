import json
import math
def load_json_files():
    with open("temp_availability.json", "r") as f:
        availability = json.load(f)
    with open("temp_grades.json", "r") as f:
        grades = json.load(f)
    return availability, grades

def compute_total_hours(availability):
    return sum(hours for hours in availability.values() if hours > 0)

def calculate_mastery_levels(grades):
    # Convert grades to mastery levels but ensure a floor (e.g., 0.1) for allocation logic
    return {course: min(grade / 10.0, 1.0) for course, grade in grades.items()}


def map_mastery_to_needed_hours(mastery_levels, total_hours, min_weight=0.05):
    # Calculate raw inverse mastery (1 - mastery)
    raw_weights = {course: max((1 - mastery), min_weight) for course, mastery in mastery_levels.items()}
    total_weight = sum(raw_weights.values())

    mastery_to_hours = {
        course: round((weight / total_weight) * total_hours)
        for course, weight in raw_weights.items()
    }
    return mastery_to_hours


def categorize_courses(mastery_levels):
    categorized_courses = {}
    for course, mastery in mastery_levels.items():
        if mastery >= 0.8:
            categorized_courses[course] = "Mastered"
        elif mastery >= 0.5:
            categorized_courses[course] = "Intermediate"
        else:
            categorized_courses[course] = "Weak"
    return categorized_courses

def initialize_todo_list(current_week=3):  # change week if needed
    last_week = max(1, current_week - 1)
    return {
        "Mastered": [
            f"Study lecture: {current_week} (PDF)",
            "Explore advanced topics"
        ],
        "Intermediate": [
            f"Study lecture: {current_week} (PDF)",
            f"Summarize key points from lecture: {last_week}"
        ],
        "Weak": [
            f"Study lecture: {current_week} (PDF)",
            f"Rewatch lecture: {last_week} & take notes"
        ]
    }

def create_plan(availability, mastery_to_hours, categorized_courses, todo_list):
    study_schedule = {}

    # Only include non-zero availability days
    available_days = [day for day, hours in availability.items() if hours > 0]
    availability = {day: {"hours": hours} for day, hours in availability.items() if hours > 0}

    current_day_index = 0
    course_task_progress = {}

    for course, hours_needed in mastery_to_hours.items():
        category = categorized_courses[course]
        tasks = todo_list[category]
        task_count = len(tasks)
        course_task_progress[course] = tasks[:]

        assigned_days = 0
        total_needed = hours_needed

        while hours_needed > 0 and current_day_index < len(available_days):
            day = available_days[current_day_index]
            available_hours = availability[day]["hours"]

            if available_hours > 0:
                allocated_hours = min(available_hours, hours_needed)
                hours_needed -= allocated_hours
                availability[day]["hours"] -= allocated_hours
                assigned_days += 1

                if assigned_days == 1 and allocated_hours == total_needed:
                    task_allocation = course_task_progress[course]
                    course_task_progress[course] = []
                elif assigned_days == 1:
                    split = math.ceil(task_count / 2)
                    task_allocation = course_task_progress[course][:split]
                    course_task_progress[course] = course_task_progress[course][split:]
                elif assigned_days == 2:
                    task_allocation = course_task_progress[course]
                    course_task_progress[course] = []
                else:
                    task_allocation = ["General review & practice problems"]

                if day not in study_schedule:
                    study_schedule[day] = []

                study_schedule[day].append({
                    "subject": course,
                    "hours": int(round(allocated_hours)),
                    "details": task_allocation
                })

            if availability[day]["hours"] == 0:
                current_day_index += 1

    return study_schedule

def main():
    availability, grades = load_json_files()
    total_hours = compute_total_hours(availability)
    mastery_levels = calculate_mastery_levels(grades)
    mastery_to_hours = map_mastery_to_needed_hours(mastery_levels, total_hours)
    categorized_courses = categorize_courses(mastery_levels)
    todo_list = initialize_todo_list(current_week=5)

    schedule = create_plan(availability, mastery_to_hours, categorized_courses, todo_list)

    # Print final plan
    print(json.dumps(schedule))
if __name__ == "__main__":
    main()
