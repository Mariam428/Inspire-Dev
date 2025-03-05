import React from 'react';

const StudySection = () => {
  const courses = [
    { name: 'OS', lecture: 'Lecture 1' },
    { name: 'Electronics', lecture: 'Lecture 2' },
    { name: 'English', lecture: 'Lecture 1' },
  ];

  return (
    <div >
      <div >
        <span >📺</span>
        <h2 >Study</h2>
      </div>
      <div >
        {courses.map((course, index) => (
          <div>
            <h3 >{course.name}</h3>
            <p>• {course.lecture}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudySection;