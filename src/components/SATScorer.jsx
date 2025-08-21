import React, { useState, useEffect } from 'react';
import { Calculator, BookOpen, TrendingUp, RotateCcw, Info } from 'lucide-react';

const SATScorer = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [difficultyBreakdown, setDifficultyBreakdown] = useState({});

  useEffect(() => {
    // Load questions from the JSON file
    fetch('/data/questions.json')
      .then(response => response.json())
      .then(data => {
        setQuestions(data);
        // Initialize user answers object
        const initialAnswers = {};
        data.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setUserAnswers(initialAnswers);
      })
      .catch(error => console.error('Error loading questions:', error));
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;
    const difficultyStats = { Easy: { correct: 0, total: 0 }, Medium: { correct: 0, total: 0 }, Hard: { correct: 0, total: 0 } };

    questions.forEach(question => {
      if (userAnswers[question.id]) {
        total++;
        const userAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(userAnswers[question.id]);
        if (userAnswerIndex === question.correct) {
          correct++;
          difficultyStats[question.difficulty].correct++;
        }
        difficultyStats[question.difficulty].total++;
      }
    });

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    setScore({ correct, total, percentage });
    setDifficultyBreakdown(difficultyStats);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setScore(null);
    setShowResults(false);
    setDifficultyBreakdown({});
  };

  const getAnswerLabel = (index) => {
    return ['A', 'B', 'C', 'D'][index];
  };

  if (questions.length === 0) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div className="sat-scorer">
      <h2>SAT Practice Test</h2>
      
      {!showResults ? (
        <div className="quiz-section">
          <div className="instructions">
            <p>Answer the questions below. You can skip questions and come back to them later.</p>
            <p>Questions answered: {Object.values(userAnswers).filter(a => a !== '').length} / {questions.length}</p>
          </div>

          <div className="questions-container">
            {questions.map((question, index) => (
              <div key={question.id} className={`question-card ${question.difficulty.toLowerCase()}`}>
                <div className="question-header">
                  <span className="question-number">Question {question.id}</span>
                  <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                    {question.difficulty}
                  </span>
                </div>
                
                <div className="question-stem" dangerouslySetInnerHTML={{ __html: question.stem }} />
                
                <div className="choices">
                  {question.choices.map((choice, choiceIndex) => (
                    <label key={choiceIndex} className="choice-option">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={getAnswerLabel(choiceIndex)}
                        checked={userAnswers[question.id] === getAnswerLabel(choiceIndex)}
                        onChange={() => handleAnswerChange(question.id, getAnswerLabel(choiceIndex))}
                      />
                      <span className="choice-label">{getAnswerLabel(choiceIndex)}.</span>
                      <span className="choice-text">{choice}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="quiz-controls">
            <button 
              className="submit-btn"
              onClick={calculateScore}
              disabled={Object.values(userAnswers).filter(a => a !== '').length === 0}
            >
              Calculate Score
            </button>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <h3>Your Results</h3>
          
          <div className="overall-score">
            <h4>Overall Score</h4>
            <div className="score-display">
              <span className="score-number">{score.percentage}%</span>
              <span className="score-detail">
                {score.correct} out of {score.total} questions correct
              </span>
            </div>
          </div>

          <div className="difficulty-breakdown">
            <h4>Performance by Difficulty</h4>
            {Object.entries(difficultyBreakdown).map(([difficulty, stats]) => (
              stats.total > 0 && (
                <div key={difficulty} className={`difficulty-performance ${difficulty.toLowerCase()}`}>
                  <span className="difficulty-name">{difficulty}</span>
                  <span className="difficulty-score">
                    {Math.round((stats.correct / stats.total) * 100)}% ({stats.correct}/{stats.total})
                  </span>
                </div>
              )
            ))}
          </div>

          <div className="answer-review">
            <h4>Review Your Answers</h4>
            {questions.map(question => {
              if (userAnswers[question.id]) {
                const userAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(userAnswers[question.id]);
                const isCorrect = userAnswerIndex === question.correct;
                
                return (
                  <div key={question.id} className={`answer-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="answer-header">
                      <span>Question {question.id}</span>
                      <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <div className="answer-details">
                      <p>Your answer: {userAnswers[question.id]}</p>
                      <p>Correct answer: {getAnswerLabel(question.correct)}</p>
                      {!isCorrect && (
                        <div className="explanation">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="results-controls">
            <button className="retake-btn" onClick={resetQuiz}>
              Take Test Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SATScorer;

const SATReadingWritingScorer = ({ initialCorrectAnswers = 0, showDetailedResults = false }) => {
  const [correctAnswers, setCorrectAnswers] = useState(initialCorrectAnswers);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(showDetailedResults);

  // SAT Reading & Writing Configuration for non-adaptive test
  const CONFIG = {
    totalQuestions: 66,
    
    // Question difficulty distribution across all 66 questions
    difficultyDistribution: {
      easy: 28,    // ~42% - Questions 1-8, 34-53 (from your blueprint)
      medium: 26,  // ~40% - Questions 9-20, 30-33, 54-63
      hard: 12     // ~18% - Questions 21-29, 64-66
    },

    // Question weights for scoring
    questionWeights: {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5
    }
  };

  const distributeCorrectAnswers = (totalCorrect) => {
    let remaining = Math.min(totalCorrect, CONFIG.totalQuestions);
    
    // Students typically get easier questions right first
    const easy = Math.min(remaining, CONFIG.difficultyDistribution.easy);
    remaining -= easy;
    
    const medium = Math.min(remaining, CONFIG.difficultyDistribution.medium);
    remaining -= medium;
    
    const hard = Math.min(remaining, CONFIG.difficultyDistribution.hard);
    
    return { easy, medium, hard };
  };

  const calculateWeightedScore = (correct) => {
    return (
      correct.easy * CONFIG.questionWeights.easy +
      correct.medium * CONFIG.questionWeights.medium +
      correct.hard * CONFIG.questionWeights.hard
    );
  };

  const calculateMaxWeightedScore = () => {
    return (
      CONFIG.difficultyDistribution.easy * CONFIG.questionWeights.easy +
      CONFIG.difficultyDistribution.medium * CONFIG.questionWeights.medium +
      CONFIG.difficultyDistribution.hard * CONFIG.questionWeights.hard
    );
  };

  const calculateSectionScore = (totalCorrect) => {
    // Distribute correct answers by difficulty
    const correctByDifficulty = distributeCorrectAnswers(totalCorrect);
    
    // Calculate weighted score
    const weightedScore = calculateWeightedScore(correctByDifficulty);
    const maxWeightedScore = calculateMaxWeightedScore();
    
    // Convert to scaled score (200-800)
    const scaledScore = 200 + (weightedScore / maxWeightedScore) * 600;
    
    // Calculate percentage correct and incorrect/unanswered
    const percentageCorrect = (totalCorrect / CONFIG.totalQuestions) * 100;
    const incorrectOrUnanswered = CONFIG.totalQuestions - totalCorrect;
    
    return {
      scaledScore: Math.round(scaledScore),
      weightedScore: weightedScore.toFixed(2),
      maxWeightedScore: maxWeightedScore.toFixed(2),
      correctByDifficulty,
      rawScore: totalCorrect,
      totalPossible: CONFIG.totalQuestions,
      percentageCorrect: percentageCorrect.toFixed(1),
      incorrectOrUnanswered
    };
  };

  useEffect(() => {
    const result = calculateSectionScore(correctAnswers);
    setResults(result);
  }, [correctAnswers]);

  const handleScoreChange = (value) => {
    const numValue = Math.max(0, Math.min(66, parseInt(value) || 0));
    setCorrectAnswers(numValue);
  };

  const resetScore = () => {
    setCorrectAnswers(0);
  };

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-blue-600';
    if (score >= 550) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentile = (score) => {
    if (score >= 780) return '99+';
    if (score >= 750) return '99';
    if (score >= 710) return '97';
    if (score >= 670) return '94';
    if (score >= 640) return '90';
    if (score >= 610) return '85';
    if (score >= 580) return '78';
    if (score >= 550) return '70';
    if (score >= 520) return '60';
    if (score >= 490) return '50';
    if (score >= 460) return '40';
    if (score >= 430) return '30';
    return '< 30';
  };

  // Sample score ranges for reference
  const getSampleScores = () => {
    const samples = [
      { correct: 66, description: "Perfect Score" },
      { correct: 60, description: "High Scorer" },
      { correct: 50, description: "Above Average" },
      { correct: 40, description: "Average" },
      { correct: 30, description: "Below Average" },
      { correct: 20, description: "Needs Improvement" }
    ];
    
    return samples.map(sample => ({
      ...sample,
      result: calculateSectionScore(sample.correct)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="text-blue-600" size={28} />
          <h1 className="text-3xl font-bold text-gray-800">SAT Reading & Writing Scorer</h1>
        </div>
        <p className="text-gray-600">
          Calculate your SAT Reading & Writing scaled score (200-800) based on the number of questions answered correctly out of 66 total questions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-blue-600" size={20} />
              <h2 className="text-xl font-semibold">Question Score</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Questions Correct (out of 66)
                </label>
                <input
                  type="number"
                  min="0"
                  max="66"
                  value={correctAnswers}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number correct..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  Enter number of questions answered correctly (0-66)
                </div>
                <div className="text-xs bg-yellow-50 text-yellow-700 p-2 mt-2 rounded border border-yellow-200">
                  <strong>SAT Scoring:</strong> Incorrect and unanswered questions are treated the same - no penalty for guessing!
                </div>
              </div>

              {/* Quick Score Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[33, 50, 60].map(score => (
                  <button
                    key={score}
                    onClick={() => setCorrectAnswers(score)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {score}/66
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={resetScore}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mt-4"
            >
              <RotateCcw size={16} />
              Reset Score
            </button>
          </div>

          {/* Question Distribution Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-gray-600" size={16} />
              <h3 className="font-medium">Test Structure</h3>
            </div>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">Total Questions:</span> 66
              </div>
              <div>
                <span className="font-medium">Easy Questions:</span> 28 (1.0x weight)
              </div>
              <div>
                <span className="font-medium">Medium Questions:</span> 26 (1.2x weight)
              </div>
              <div>
                <span className="font-medium">Hard Questions:</span> 12 (1.5x weight)
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results && (
            <>
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={24} />
                  <h2 className="text-2xl font-bold">Your R&W Score</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{results.scaledScore}</div>
                    <div className="text-lg opacity-90">{getPercentile(results.scaledScore)}th Percentile</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.rawScore}</div>
                      <div className="text-sm opacity-90">Questions Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.incorrectOrUnanswered}</div>
                      <div className="text-sm opacity-90">Wrong/Unanswered</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                >
                  <span className="font-medium">
                    {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                  </span>
                </button>

                {showDetails && (
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg mb-3">Scoring Breakdown</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Raw Score:</span>
                          <span className="ml-2">{results.rawScore}/66</span>
                        </div>
                        <div>
                          <span className="font-medium">Weighted Score:</span>
                          <span className="ml-2">{results.weightedScore}/{results.maxWeightedScore}</span>
                        </div>
                        <div>
                          <span className="font-medium">Scaled Score:</span>
                          <span className="ml-2">{results.scaledScore}/800</span>
                        </div>
                        <div>
                          <span className="font-medium">Percentage Correct:</span>
                          <span className="ml-2">{results.percentageCorrect}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Wrong/Unanswered:</span>
                          <span className="ml-2">{results.incorrectOrUnanswered}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-lg mb-3">Estimated Performance by Difficulty</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Easy Questions (28 total):</span>
                          <span className="font-medium">{results.correctByDifficulty.easy} correct</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medium Questions (26 total):</span>
                          <span className="font-medium">{results.correctByDifficulty.medium} correct</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hard Questions (12 total):</span>
                          <span className="font-medium">{results.correctByDifficulty.hard} correct</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">How SAT Scoring Works:</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li><strong>No guessing penalty:</strong> Incorrect and unanswered questions count the same</li>
                        <li><strong>Raw score:</strong> Total number of questions answered correctly</li>
                        <li><strong>Weighted scoring:</strong> Easy (1.0x), Medium (1.2x), Hard (1.5x)</li>
                        <li><strong>Scale conversion:</strong> Raw score converted to 200-800 scale</li>
                        <li><strong>Strategy tip:</strong> Always guess if you're unsure - no penalty!</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Score Reference */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Score Reference</h3>
                <div className="space-y-2 text-sm">
                  {getSampleScores().map((sample, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{sample.correct}/66 ({sample.description})</span>
                      <span className={`font-medium ${getScoreColor(sample.result.scaledScore)}`}>
                        {sample.result.scaledScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { SATReadingWritingScorer };
