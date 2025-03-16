import json

def load_json_files():
    with open("temp_availability.json", "r") as f:
        availability = json.load(f)

    with open("temp_enrolled.json", "r") as f:
        courses_data = json.load(f)
        courses = courses_data["enrolledCourses"]  # ✅ Adjusted here

    return availability, courses

def generate_schedule(availability, enrolled_courses):
    schedule = {day: [] for day in availability}
    total_hours = sum(hours for hours in availability.values() if hours > 0)

    if total_hours == 0 or not enrolled_courses:
        return {}

    hours_per_course = total_hours // len(enrolled_courses)
    extra_hours = total_hours % len(enrolled_courses)

    course_hours_needed = {
        course.lower(): hours_per_course + (1 if i < extra_hours else 0)
        for i, course in enumerate(enrolled_courses)
    }

    course_iter = iter(course_hours_needed.items())

    current_course, remaining = next(course_iter)

    for day, day_hours in availability.items():
        if day_hours == 0:
            continue

        while day_hours > 0:
            allocated = min(day_hours, remaining)

            schedule[day].append({
                "subject": current_course,
                "hours": allocated,
                "details": [f"Study lecture: 1 (PDF)"]
            })

            day_hours -= allocated
            remaining -= allocated

            if remaining == 0:
                try:
                    current_course, remaining = next(course_iter)
                except StopIteration:
                    break  # All courses done

    return schedule


if __name__ == "__main__":
    availability, enrolled_courses = load_json_files()
    schedule = generate_schedule(availability, enrolled_courses)
    print(json.dumps(schedule))
