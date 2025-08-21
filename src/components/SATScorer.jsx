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
                      <span className="choice-text">{choice}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="quiz-controls">
            <button onClick={calculateScore} className="btn btn-primary">
              Calculate Score
            </button>
            <button onClick={resetQuiz} className="btn btn-secondary">
              Reset Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <h3>Your Results</h3>
          <div className="score-summary">
            <div className="score-item">
              <span className="score-label">Correct:</span>
              <span className="score-value">{score.correct}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Total:</span>
              <span className="score-value">{score.total}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Percentage:</span>
              <span className="score-value">{score.percentage}%</span>
            </div>
          </div>

          <div className="difficulty-breakdown">
            <h4>Performance by Difficulty</h4>
            {Object.entries(difficultyBreakdown).map(([difficulty, stats]) => (
              <div key={difficulty} className={`difficulty-stats ${difficulty.toLowerCase()}`}>
                <span className="difficulty-name">{difficulty}</span>
                <span className="difficulty-score">{stats.correct}/{stats.total}</span>
              </div>
            ))}
          </div>

          <button onClick={resetQuiz} className="btn btn-primary">
            Take Test Again
          </button>
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
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 min-h-screen">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <Calculator className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SAT Reading & Writing Scorer
            </h1>
          </div>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
          Calculate your SAT Reading & Writing scaled score (200-800) based on the number of questions answered correctly out of 66 total questions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 shadow-2xl p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-100">Question Score</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  Questions Correct (out of 66)
                </label>
                <input
                  type="number"
                  min="0"
                  max="66"
                  value={correctAnswers}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  className="w-full px-6 py-4 text-2xl border-2 border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-gray-700/50 backdrop-blur-sm transition-all duration-200 text-gray-100 placeholder-gray-400"
                  placeholder="Enter number correct..."
                />
                <div className="text-sm text-gray-400 mt-2">
                  Enter number of questions answered correctly (0-66)
                </div>
                <div className="text-sm bg-amber-900/30 text-amber-300 p-3 mt-3 rounded-xl border border-amber-700/50">
                  <strong>SAT Scoring:</strong> Incorrect and unanswered questions are treated the same - no penalty for guessing!
                </div>
              </div>

              {/* Quick Score Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {[33, 50, 60].map(score => (
                  <button
                    key={score}
                    onClick={() => setCorrectAnswers(score)}
                    className="px-4 py-3 text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg text-gray-200 hover:text-white"
                  >
                    {score}/66
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={resetScore}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-2xl transition-all duration-200 mt-6 font-medium hover:scale-105 hover:shadow-lg text-gray-200 hover:text-white"
            >
              <RotateCcw size={16} />
              Reset Score
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results && (
            <>
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <TrendingUp size={28} />
                    </div>
                    <h2 className="text-3xl font-bold">Your R&W Score</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl font-black mb-3 tracking-tight">{results.scaledScore}</div>
                      <div className="text-xl font-semibold opacity-90">{getPercentile(results.scaledScore)}th Percentile</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/20">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{results.rawScore}</div>
                        <div className="text-sm opacity-90">Questions Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{results.incorrectOrUnanswered}</div>
                        <div className="text-sm opacity-90">Wrong/Unanswered</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 shadow-2xl p-8 rounded-3xl">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 font-semibold text-lg transition-colors"
                >
                  <span>
                    {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                  </span>
                </button>

                {showDetails && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-l-4 border-blue-500 pl-6 pr-4 py-4 rounded-r-2xl">
                      <h3 className="font-bold text-xl mb-4 text-gray-100">Scoring Breakdown</h3>
                      <div className="grid grid-cols-2 gap-6 text-base">
                        <div className="bg-gray-700/60 p-4 rounded-xl border border-gray-600/50">
                          <span className="font-semibold text-gray-300">Raw Score:</span>
                          <span className="ml-2 font-bold text-blue-400">{results.rawScore}/66</span>
                        </div>
                        <div className="bg-gray-700/60 p-4 rounded-xl border border-gray-600/50">
                          <span className="font-semibold text-gray-300">Weighted Score:</span>
                          <span className="ml-2 font-bold text-purple-400">{results.weightedScore}/{results.maxWeightedScore}</span>
                        </div>
                        <div className="bg-gray-700/60 p-4 rounded-xl border border-gray-600/50">
                          <span className="font-semibold text-gray-300">Scaled Score:</span>
                          <span className="ml-2 font-bold text-green-400">{results.scaledScore}/800</span>
                        </div>
                        <div className="bg-gray-700/60 p-4 rounded-xl border border-gray-600/50">
                          <span className="font-semibold text-gray-300">Percentage Correct:</span>
                          <span className="ml-2 font-bold text-amber-400">{results.percentageCorrect}%</span>
                        </div>
                        <div className="bg-gray-700/60 p-4 rounded-xl border border-gray-600/50 col-span-2">
                          <span className="font-semibold text-gray-300">Wrong/Unanswered:</span>
                          <span className="ml-2 font-bold text-red-400">{results.incorrectOrUnanswered}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-2xl border border-gray-600/50">
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-100">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <BookOpen size={20} className="text-white" />
                        </div>
                        How SAT Scoring Works:
                      </h4>
                      <ul className="space-y-3 text-gray-300 leading-relaxed">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span><strong className="text-blue-400">No guessing penalty:</strong> Incorrect and unanswered questions count the same</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span><strong className="text-purple-400">Raw score:</strong> Total number of questions answered correctly</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span><strong className="text-green-400">Weighted scoring:</strong> Easy (1.0x), Medium (1.2x), Hard (1.5x)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span><strong className="text-amber-400">Scale conversion:</strong> Raw score converted to 200-800 scale</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span><strong className="text-red-400">Strategy tip:</strong> Always guess if you're unsure - no penalty!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
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
      description: "Supporting claims with textual evidence",
      questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 31, 32, 33, 41, 45, 46, 47, 48, 49, 50, 63, 64, 65, 66],
      subcategories: {
        "Supporting evidence": [11, 12, 13, 14, 15, 16, 17, 18, 19, 31, 32, 33, 41, 45, 46, 47, 48, 49, 50, 63, 64, 65, 66], // Which choice best supports the claim?
      }
    }
  };

  // Calculate performance by category
  const calculateCategoryPerformance = () => {
    const categoryStats = {};
    
    Object.entries(questionClassification).forEach(([categoryKey, category]) => {
      const categoryQuestions = category.questions;
      const answeredQuestions = studentAnswers.filter(answer => 
        categoryQuestions.includes(answer.questionId)
      );
      
      const correctAnswers = answeredQuestions.filter(answer => answer.isCorrect);
      const totalAnswered = answeredQuestions.length;
      const totalInCategory = categoryQuestions.length;
      
      categoryStats[categoryKey] = {
        name: category.name,
        description: category.description,
        totalQuestions: totalInCategory,
        answeredQuestions: totalAnswered,
        correctAnswers: correctAnswers.length,
        accuracy: totalAnswered > 0 ? Math.round((correctAnswers.length / totalAnswered) * 100) : 0,
        subcategories: {}
      };
      
      // Calculate subcategory performance
      Object.entries(category.subcategories).forEach(([subKey, subQuestions]) => {
        const subAnswered = answeredQuestions.filter(answer => 
          subQuestions.includes(answer.questionId)
        );
        const subCorrect = subAnswered.filter(answer => answer.isCorrect);
        
        categoryStats[categoryKey].subcategories[subKey] = {
          totalQuestions: subQuestions.length,
          answeredQuestions: subAnswered.length,
          correctAnswers: subCorrect.length,
          accuracy: subAnswered.length > 0 ? Math.round((subCorrect.length / subAnswered.length) * 100) : 0
        };
      });
    });
    
    return categoryStats;
  };

  useEffect(() => {
    if (studentAnswers.length > 0) {
      const categoryPerformance = calculateCategoryPerformance();
      setAnalysis(categoryPerformance);
    }
  }, [studentAnswers]);

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          <Info size={48} className="mx-auto mb-4 opacity-50" />
          <p>No student answers available for analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">SAT Performance Analysis</h2>
        <p className="text-gray-600">Detailed breakdown of your performance by question category</p>
      </div>

      <div className="space-y-6">
        {Object.entries(analysis).map(([categoryKey, category]) => (
          <div key={categoryKey} className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              <p className="text-blue-100 text-sm">{category.description}</p>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{category.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{category.answeredQuestions}</div>
                  <div className="text-sm text-gray-600">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{category.accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 mb-3">Subcategory Performance</h4>
                {Object.entries(category.subcategories).map(([subKey, subStats]) => (
                  <div key={subKey} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{subKey}</span>
                      <span className="text-sm text-gray-500">
                        {subStats.answeredQuestions}/{subStats.totalQuestions} answered
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${subStats.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{subStats.accuracy}%</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {subStats.correctAnswers} correct
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { SATReadingWritingScorer, SATPerformanceAnalyzer };
