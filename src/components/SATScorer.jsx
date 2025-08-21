import React, { useState, useEffect } from 'react';
import { Calculator, BookOpen, TrendingUp, BarChart, Target, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Calculator className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SAT Reading & Writing Scorer
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200 shadow-lg">
            
            <div className="space-y-6">
              <div>
                <label className="block text-xl font-bold mb-4 text-slate-800">
                  Questions Correct (out of 66)
                </label>
                <input
                  type="number"
                  min="0"
                  max="66"
                  value={correctAnswers}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  className="w-full px-8 py-6 text-3xl font-bold text-center border-3 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
                  placeholder="0"
                />
                <div className="text-sm text-slate-600 mt-3 text-center">
                  Enter number of questions answered correctly (0-66)
                </div>
                <div className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-slate-700 p-4 mt-4 rounded-xl border border-blue-200 text-center font-medium">
                  <strong>SAT Scoring:</strong> No penalty for guessing - incorrect and unanswered questions count the same!
                </div>
              </div>

            </div>
          </div>


        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {results && (
            <>
              <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp size={28} />
                  </div>
                  <h2 className="text-3xl font-bold">Your R&W Score</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-black mb-3">{results.scaledScore}</div>
                    <div className="text-xl opacity-90 font-medium">{getPercentile(results.scaledScore)}th Percentile</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{results.rawScore}</div>
                      <div className="text-sm opacity-90 font-medium">Questions Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{results.incorrectOrUnanswered}</div>
                      <div className="text-sm opacity-90 font-medium">Wrong/Unanswered</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-8 rounded-2xl border border-slate-200 shadow-lg">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-3 text-slate-700 hover:text-slate-900 mb-6 font-semibold text-lg transition-colors duration-200"
                >
                  <span className="font-medium">
                    {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                  </span>
                </button>

                {showDetails && (
                  <div className="space-y-8">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="font-bold text-xl mb-4 text-slate-800">Scoring Breakdown</h3>
                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                          <div className="text-center">
                            <div className="text-2xl font-black text-slate-900 mb-1">{results.rawScore}/66</div>
                            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Raw Score</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                          <div className="text-center">
                            <div className="text-2xl font-black text-slate-900 mb-1">{results.weightedScore}/{results.maxWeightedScore}</div>
                            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Weighted Score</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                          <div className="text-center">
                            <div className="text-2xl font-black text-slate-900 mb-1">{results.scaledScore}/800</div>
                            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Scaled Score</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                          <div className="text-center">
                            <div className="text-2xl font-black text-slate-900 mb-1">{results.percentageCorrect}%</div>
                            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Percentage</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] col-span-2">
                          <div className="text-center">
                            <div className="text-2xl font-black text-slate-900 mb-1">{results.incorrectOrUnanswered}</div>
                            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Wrong/Unanswered</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="font-bold text-xl mb-4 text-slate-800">Estimated Performance by Difficulty</h3>
                      <div className="space-y-4 text-base">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-green-800 text-lg">Easy Questions</div>
                              <div className="text-sm text-green-600">28 total questions</div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black text-green-700">{results.correctByDifficulty.easy}</div>
                              <div className="text-sm font-semibold text-green-600">correct</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-blue-800 text-lg">Medium Questions</div>
                              <div className="text-sm text-blue-600">26 total questions</div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black text-blue-700">{results.correctByDifficulty.medium}</div>
                              <div className="text-sm font-semibold text-blue-600">correct</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-purple-800 text-lg">Hard Questions</div>
                              <div className="text-sm text-purple-600">12 total questions</div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black text-purple-700">{results.correctByDifficulty.hard}</div>
                              <div className="text-sm font-semibold text-purple-600">correct</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-lg mb-4 text-slate-800">How SAT Scoring Works:</h4>
                      <ul className="text-base space-y-3 list-none">
                        <li className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span><strong>No guessing penalty:</strong> Incorrect and unanswered questions count the same</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span><strong>Raw score:</strong> Total number of questions answered correctly</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span><strong>Weighted scoring:</strong> Easy (1.0x), Medium (1.2x), Hard (1.5x)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span><strong>Scale conversion:</strong> Raw score converted to 200-800 scale</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">💡</span>
                          <span><strong>Strategy tip:</strong> Always guess if you're unsure - no penalty!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Score Reference */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200 shadow-lg">
                <h3 className="font-bold text-xl mb-4 text-slate-800">Score Reference</h3>
                <div className="space-y-4">
                  {getSampleScores().map((sample, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-800 text-lg">{sample.correct}/66</div>
                          <div className="text-sm text-slate-600 font-medium">{sample.description}</div>
                        </div>
                        <div className={`text-right group-hover:scale-110 transition-transform duration-200`}>
                          <div className={`text-3xl font-black ${getScoreColor(sample.result.scaledScore)}`}>
                            {sample.result.scaledScore}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">score</div>
                        </div>
                      </div>
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

const SATPerformanceAnalyzer = ({ studentAnswers = [], totalQuestions = 66 }) => {
  const [analysis, setAnalysis] = useState(null);
  const [showDetails, setShowDetails] = useState({});

  // SAT R&W Question Classification based on actual practice test content
  const questionClassification = {
    // Standard English Conventions (20-22 questions)
    standardEnglishConventions: {
      name: "Standard English Conventions",
      description: "Grammar, punctuation, and sentence structure",
      questions: [20, 21, 22, 23, 24, 25, 26, 51, 52, 53, 54, 55, 56, 57, 58],
      subcategories: {
        "Verb tense/agreement": [21, 22, 51, 57, 58], // Past perfect, present/past tense, subject-verb agreement
        "Punctuation/mechanics": [23, 24, 25, 26, 52, 54, 55, 56], // Colons, commas, semicolons, dashes
        "Pronoun clarity/agreement": [20, 53], // Object pronouns, relative pronouns (who/whom)
      }
    },
    
    // Expression of Ideas (10-14 questions)
    expressionOfIdeas: {
      name: "Expression of Ideas",
      description: "Rhetorical skills, transitions, and sentence combining",
      questions: [27, 28, 29, 30, 59, 60, 61, 62],
      subcategories: {
        "Logical transitions": [27, 28, 29, 30, 59, 60, 61, 62], // Accordingly, consequently, for this reason, etc.
      }
    },
    
    // Information & Ideas (16-18 questions)
    informationAndIdeas: {
      name: "Information & Ideas",
      description: "Reading comprehension, inference, and analysis",
      questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 34, 35, 36, 37, 38, 39, 40, 42, 43, 44],
      subcategories: {
        "Vocabulary in context": [1, 2, 3, 4, 5, 34, 35, 36, 37, 38], // Precise word choice (rattled, clarified, etc.)
        "Reading comprehension": [6, 7, 42, 43, 44], // Main idea, author's purpose, cause/effect
        "Text structure/function": [8, 9, 10, 39, 40], // Function of sentences/passages in text
      }
    },
    
    // Command of Evidence (8-10 questions)
    commandOfEvidence: {
      name: "Command of Evidence",
      description: "Data interpretation and evidence analysis",
      questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 45, 47, 49],
      subcategories: {
        "Data interpretation": [14, 16, 45, 47, 49], // Charts, graphs, tables analysis
        "Evidence selection": [11, 12, 13, 15, 17, 18, 19], // Choosing supporting quotes/evidence
      }
    },
    
    // Comparative Analysis (2-4 questions)
    comparativeAnalysis: {
      name: "Comparative Analysis",
      description: "Analyzing relationships between texts",
      questions: [41, 48],
      subcategories: {
        "Text comparison": [41, 48], // How texts relate to each other, evidence selection
      }
    },

    // Goal-oriented writing (Research-based questions)
    goalOrientedWriting: {
      name: "Goal-Oriented Writing",
      description: "Research synthesis and academic writing",
      questions: [31, 32, 33, 46, 50, 63, 64, 65, 66],
      subcategories: {
        "Research synthesis": [31, 32, 33, 46, 50], // Combining data sources, meeting constraints
        "Academic/scientific writing": [63, 64, 65, 66], // Technical writing with precise language
      }
    }
  };

  // Difficulty mapping based on question numbers
  const difficultyMapping = {
    // Module 1 (Questions 1-33)
    easy: [1, 2, 3, 4, 5, 6, 7, 8],
    medium: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30, 31, 32, 33],
    hard: [21, 22, 23, 24, 25, 26, 27, 28, 29],
    
    // Module 2 (Questions 34-66)
    module2Easy: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
    module2Hard: [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66]
  };

  const analyzePerformance = () => {
    const categoryResults = {};
    let overallCorrect = 0;

    // Initialize category tracking
    Object.keys(questionClassification).forEach(category => {
      categoryResults[category] = {
        ...questionClassification[category],
        correct: 0,
        total: questionClassification[category].questions.length,
        percentage: 0,
        subcategoryResults: {}
      };

      // Initialize subcategories
      Object.keys(questionClassification[category].subcategories || {}).forEach(subcat => {
        categoryResults[category].subcategoryResults[subcat] = {
          correct: 0,
          total: questionClassification[category].subcategories[subcat].length,
          percentage: 0
        };
      });
    });

    // Analyze student answers
    studentAnswers.forEach((answer, index) => {
      const questionNumber = index + 1;
      const isCorrect = answer.isCorrect;
      
      if (isCorrect) overallCorrect++;

      // Find which categories this question belongs to
      Object.keys(questionClassification).forEach(category => {
        if (questionClassification[category].questions.includes(questionNumber)) {
          if (isCorrect) {
            categoryResults[category].correct++;
          }

          // Check subcategories
          Object.keys(questionClassification[category].subcategories || {}).forEach(subcat => {
            if (questionClassification[category].subcategories[subcat].includes(questionNumber)) {
              if (isCorrect) {
                categoryResults[category].subcategoryResults[subcat].correct++;
              }
            }
          });
        }
      });
    });

    // Calculate percentages
    Object.keys(categoryResults).forEach(category => {
      if (categoryResults[category].total > 0) {
        categoryResults[category].percentage = 
          (categoryResults[category].correct / categoryResults[category].total) * 100;
      }

      Object.keys(categoryResults[category].subcategoryResults).forEach(subcat => {
        if (categoryResults[category].subcategoryResults[subcat].total > 0) {
          categoryResults[category].subcategoryResults[subcat].percentage = 
            (categoryResults[category].subcategoryResults[subcat].correct / 
             categoryResults[category].subcategoryResults[subcat].total) * 100;
        }
      });
    });

    // Difficulty analysis
    const difficultyResults = {
      easy: { correct: 0, total: difficultyMapping.easy.length },
      medium: { correct: 0, total: difficultyMapping.medium.length },
      hard: { correct: 0, total: difficultyMapping.hard.length },
      module2Easy: { correct: 0, total: difficultyMapping.module2Easy.length },
      module2Hard: { correct: 0, total: difficultyMapping.module2Hard.length }
    };

    studentAnswers.forEach((answer, index) => {
      const questionNumber = index + 1;
      if (answer.isCorrect) {
        Object.keys(difficultyMapping).forEach(difficulty => {
          if (difficultyMapping[difficulty].includes(questionNumber)) {
            difficultyResults[difficulty].correct++;
          }
        });
      }
    });

    Object.keys(difficultyResults).forEach(difficulty => {
      difficultyResults[difficulty].percentage = 
        (difficultyResults[difficulty].correct / difficultyResults[difficulty].total) * 100;
    });

    return {
      overall: {
        correct: overallCorrect,
        total: totalQuestions,
        percentage: (overallCorrect / totalQuestions) * 100
      },
      categories: categoryResults,
      difficulty: difficultyResults
    };
  };

  useEffect(() => {
    if (studentAnswers.length > 0) {
      setAnalysis(analyzePerformance());
    }
  }, [studentAnswers]);

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRecommendations = (categoryKey, categoryData) => {
    const percentage = categoryData.percentage;
    
    const recommendations = {
      standardEnglishConventions: {
        weak: "Focus on verb tense consistency (especially past perfect vs. simple past) and punctuation rules. Practice identifying when to use colons vs. semicolons vs. commas, and review pronoun cases (who vs. whom).",
        moderate: "Review advanced punctuation scenarios and subject-verb agreement with complex phrases. Practice identifying correct pronoun cases in formal writing.",
        strong: "Continue practicing the most complex grammar scenarios. Focus on sophisticated punctuation in academic writing contexts."
      },
      expressionOfIdeas: {
        weak: "Work on logical flow between ideas. Practice identifying appropriate transitions like 'accordingly,' 'consequently,' 'nevertheless.' Study cause-effect relationships in text.",
        moderate: "Focus on subtle transition differences and understanding when to use contrasting vs. supporting transitions in complex arguments.",
        strong: "Master sophisticated transitions and continue practicing complex rhetorical relationships between ideas."
      },
      informationAndIdeas: {
        weak: "Practice vocabulary in context questions - focus on precise word choice. Work on identifying main ideas and understanding how text structure supports meaning.",
        moderate: "Focus on complex inference questions and understanding how specific sentences function within larger passages.",
        strong: "Challenge yourself with sophisticated vocabulary questions and complex text structure analysis."
      },
      commandOfEvidence: {
        weak: "Practice reading charts, tables, and data visualizations. Work on connecting data to claims and selecting the strongest evidence.",
        moderate: "Focus on complex data interpretation and choosing evidence that best supports specific arguments or conclusions.",
        strong: "Continue practicing with multi-step data analysis and sophisticated evidence selection."
      },
      comparativeAnalysis: {
        weak: "Practice comparing different texts' approaches to similar topics. Focus on identifying how authors use evidence differently.",
        moderate: "Work on subtle differences between texts and selecting evidence that shows relationships between passages.",
        strong: "Continue practicing sophisticated text comparison and evidence selection from multiple sources."
      },
      goalOrientedWriting: {
        weak: "Practice synthesis questions that combine multiple data sources. Work on meeting specific writing goals with constraints (budget, timeline, etc.).",
        moderate: "Focus on complex research scenarios that require precise academic language and scientific accuracy.",
        strong: "Challenge yourself with the most complex synthesis questions involving multiple constraints and technical precision."
      }
    };

    if (percentage < 50) return recommendations[categoryKey]?.weak || "Focus on fundamental skills in this area.";
    if (percentage < 75) return recommendations[categoryKey]?.moderate || "Continue practicing to strengthen this area.";
    return recommendations[categoryKey]?.strong || "Maintain your strong performance in this area.";
  };

  const toggleDetails = (category) => {
    setShowDetails(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (!analysis || studentAnswers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="text-center py-8">
          <BarChart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Complete the practice test to see your performance analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-blue-600" size={28} />
          <h1 className="text-3xl font-bold text-gray-800">Performance Analysis</h1>
        </div>
        <p className="text-gray-600">
          Detailed breakdown of your SAT Reading & Writing performance with targeted recommendations.
        </p>
      </div>

      {/* Overall Performance */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{analysis.overall.correct}</div>
            <div className="text-sm opacity-90">Questions Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{Math.round(analysis.overall.percentage)}%</div>
            <div className="text-sm opacity-90">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{analysis.overall.total - analysis.overall.correct}</div>
            <div className="text-sm opacity-90">Need Improvement</div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Performance by Skill Area</h2>
        <div className="space-y-4">
          {Object.entries(analysis.categories).map(([categoryKey, categoryData]) => (
            <div key={categoryKey} className={`border rounded-lg p-4 ${getPerformanceColor(categoryData.percentage)}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDetails(categoryKey)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {categoryData.percentage >= 70 ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-yellow-600" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{categoryData.name}</h3>
                      <p className="text-sm opacity-75">{categoryData.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(categoryData.percentage)}%</div>
                  <div className="text-sm">{categoryData.correct}/{categoryData.total}</div>
                </div>
              </div>

              {showDetails[categoryKey] && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Subcategory Breakdown:</h4>
                    <div className="space-y-2">
                      {Object.entries(categoryData.subcategoryResults).map(([subcat, subcatData]) => (
                        subcatData.total > 0 && (
                          <div key={subcat} className="flex justify-between text-sm">
                            <span>{subcat}</span>
                            <span className="font-medium">
                              {Math.round(subcatData.percentage)}% ({subcatData.correct}/{subcatData.total})
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-50 p-3 rounded">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen size={16} />
                      Recommendations:
                    </h4>
                    <p className="text-sm">{getRecommendations(categoryKey, categoryData)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Analysis */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={24} />
          Performance by Difficulty
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(analysis.difficulty).map(([difficulty, data]) => {
            const displayNames = {
              easy: 'Easy',
              medium: 'Medium', 
              hard: 'Hard',
              module2Easy: 'Module 2 Easy',
              module2Hard: 'Module 2 Hard'
            };
            
            return (
              <div key={difficulty} className="text-center p-4 bg-white rounded border">
                <div className="text-lg font-semibold">{displayNames[difficulty]}</div>
                <div className="text-2xl font-bold text-blue-600">{Math.round(data.percentage)}%</div>
                <div className="text-sm text-gray-600">{data.correct}/{data.total}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { SATReadingWritingScorer, SATPerformanceAnalyzer };
