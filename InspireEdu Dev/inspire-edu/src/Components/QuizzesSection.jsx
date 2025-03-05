import React from 'react';

const QuizzesSection = () => {
  const quizzes = [
    { subject: 'DSP', quiz: 'Quiz on lecture 1' },
    { subject: 'Neural Networks', quiz: 'Quiz on lecture 2' },
  ];

  return (
    <div >
      <div>
        <span >💡</span>
        <h2 >Quizzes</h2>
      </div>
      <div>
        {quizzes.map((quiz, index) => (
          <div key={index} >
            <h3 >{quiz.subject}</h3>
            <p >• {quiz.quiz}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesSection;