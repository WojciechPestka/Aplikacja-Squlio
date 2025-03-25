import React, { useEffect, useState } from 'react';
import './DailyQuestions.css';
import { useNavigate } from 'react-router-dom';

interface QuestionData {
  id_question: number;
  question: string;
  correct_answer: string;
  incorrect_answer_1: string;
  incorrect_answer_2: string;
  incorrect_answer_3: string;
}

const DailyQuestions: React.FC = () => {
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackClass, setFeedbackClass] = useState<string>(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  const fetchDailyQuestion = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setFeedbackClass(''); 
    setSelectedAnswer(null);

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('Brak autoryzacji. Zaloguj się ponownie.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://squlio.edu.pl/api/daily-question', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (
        response.ok &&
        data &&
        data.question &&
        data.correct_answer &&
        data.incorrect_answer_1 &&
        data.incorrect_answer_2 &&
        data.incorrect_answer_3
      ) {
        setQuestionData(data);

        const shuffledAnswers = [
          data.correct_answer,
          data.incorrect_answer_1,
          data.incorrect_answer_2,
          data.incorrect_answer_3,
        ].sort(() => Math.random() - 0.5);

        setAnswers(shuffledAnswers);
      } else {
        setQuestionData(null);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania pytania:', err);
      setError('Wystąpił błąd podczas pobierania pytania.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    setSelectedAnswer(answer);

    if (answer === questionData?.correct_answer) {
      setFeedback('Poprawna odpowiedź');
      setFeedbackClass('correct'); 
    } else {
      setFeedback('Błędna odpowiedź');
      setFeedbackClass('error'); 
    }

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError('Brak autoryzacji. Zaloguj się ponownie.');
        return;
      }

      const response = await fetch('https://squlio.edu.pl/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: questionData?.id_question,
          answer: answer,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Błąd przy przesyłaniu odpowiedzi.');
      }
    } catch (err) {
      console.error('Błąd przy przesyłaniu odpowiedzi:', err);
      setError('Wystąpił błąd podczas przesyłania odpowiedzi.');
    }
  };

  const handleAnswerSelect = (answer: string) => {
    submitAnswer(answer);
  };

  const handleNextQuestion = () => {
    fetchDailyQuestion();
  };

  const handleReturnToMainPage = () => {
    navigate('/'); 
  };

  return (
    <div className="daily-questions-container">
      <button onClick={handleReturnToMainPage} className="back-button">
        {"<"}
      </button>
      <h1>Codzienne Pytanie</h1>
      {loading ? (
        <p>Ładowanie pytania...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : questionData && questionData.question ? (
        <div className="question-box">
          <p>{questionData.question}</p>
          <div className="answers">
            {answers.map((answer) => (
              <button
                key={answer}
                onClick={() => handleAnswerSelect(answer)}
                className={`answer-button ${
                  selectedAnswer
                    ? answer === questionData.correct_answer
                      ? 'selected-correct'
                      : answer === selectedAnswer
                      ? 'selected-wrong'
                      : ''
                    : ''
                }`}
                disabled={!!selectedAnswer}
              >
                {answer}
              </button>
            ))}
          </div>
          {feedback && <p className={`feedback ${feedbackClass}`}>{feedback}</p>}
          {selectedAnswer && (
            <button onClick={handleNextQuestion} className="next-question-button">
              Kolejne pytanie
            </button>
          )}
        </div>
      ) : (
        <div className="question-box small">
          <p>Wyczerpano dzisiejsze pytania.</p>
          <button onClick={handleReturnToMainPage} className="return-mainmenu-button">
            Powrót na stronę główną
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyQuestions;
