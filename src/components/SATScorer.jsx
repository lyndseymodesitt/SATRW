import React, { useState, useEffect } from 'react';
import { Calculator, BookOpen, TrendingUp, RotateCcw, Info, Target, Award, AlertTriangle } from 'lucide-react';

const SATReadingWritingScorer = () => {
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // SAT Reading & Writing Configuration for non-adaptive test
  const CONFIG = {
    totalQuestions: 66,
    
    // Question difficulty distribution across all 66 questions
    difficultyDistribution: {
      easy: 28,    // ~42% - Questions 1-8, 34-53
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

  const getScoreLevel = (score) => {
    if (score >= 700) return { level: "Elite", icon: Award, color: "text-emerald-400" };
    if (score >= 600) return { level: "Strong", icon: TrendingUp, color: "text-blue-400" };
    if (score >= 480) return { level: "Ready", icon: Target, color: "text-amber-400" };
    return { level: "Building", icon: AlertTriangle, color: "text-red-400" };
  };

  // Interactive score reference data
  const scoreReference = [
    { score: 800, correct: 66, level: "Perfect", color: "from-emerald-400 to-green-500" },
    { score: 730, correct: 60, level: "High Scorer", color: "from-blue-400 to-cyan-500" },
    { score: 623, correct: 50, level: "Above Average", color: "from-purple-400 to-indigo-500" },
    { score: 530, correct: 40, level: "Average", color: "from-amber-400 to-orange-500" },
    { score: 436, correct: 30, level: "Below Average", color: "from-orange-400 to-red-500" },
    { score: 355, correct: 20, level: "Needs Work", color: "from-red-400 to-pink-500" }
  ];

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 min-h-screen">
        <div className="text-center py-8">
          <Calculator className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-400">Loading scorer...</p>
        </div>
      </div>
    );
  }

  const currentScoreLevel = getScoreLevel(results.scaledScore);
  const ScoreIcon = currentScoreLevel.icon;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <Calculator className="text-white" size={28} />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          SAT Reading & Writing Scorer
        </h1>
        <p className="text-gray-400 text-lg">Enter your correct answers to get your scaled score</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-gray-200">Your Answers</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Questions Correct (out of 66)
                </label>
                <input
                  type="number"
                  min="0"
                  max="66"
                  value={correctAnswers}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-700/50 text-center text-gray-100 placeholder-gray-400 transition-all"
                  placeholder="0"
                />
              </div>

              {/* Quick Score Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[33, 50, 60].map(score => (
                  <button
                    key={score}
                    onClick={() => setCorrectAnswers(score)}
                    className="px-3 py-2 text-sm font-medium bg-gray-700 hover:bg-blue-600 rounded-lg transition-all text-gray-300 hover:text-white"
                  >
                    {score}
                  </button>
                ))}
              </div>
              
              <button
                onClick={resetScore}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-gray-300 hover:text-white"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              {/* Pro Tip */}
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 mt-4">
                <p className="text-amber-300 text-xs">
                  <strong>SAT Tip:</strong> No penalty for guessing - always answer every question!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Score Display */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ScoreIcon size={24} />
                  <span className="text-lg font-semibold">{currentScoreLevel.level}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-75">Percentile</div>
                  <div className="text-xl font-bold">{getPercentile(results.scaledScore)}</div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl font-black mb-2">{results.scaledScore}</div>
                <div className="text-xl opacity-90">SAT Reading & Writing Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">{results.rawScore}</div>
                  <div className="text-sm opacity-75">Correct</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">{results.incorrectOrUnanswered}</div>
                  <div className="text-sm opacity-75">Wrong/Skip</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Reference Scale */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-4 text-center">Score Reference</h3>
            
            <div className="space-y-3">
              {scoreReference.map((item, index) => {
                const isCurrentRange = Math.abs(results.scaledScore - item.score) <= 30;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isCurrentRange 
                        ? 'bg-blue-900/30 border border-blue-500/30 ring-1 ring-blue-500/20' 
                        : 'bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold`}>
                        {item.correct}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-200">{item.level}</div>
                        <div className="text-sm text-gray-400">{item.correct}/66 correct</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-200">{item.score}</div>
                      {isCurrentRange && (
                        <div className="text-xs text-blue-400 font-medium">Your Range</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Analysis */}
          {showDetails && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Scoring Details</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Weighted Score</div>
                  <div className="text-lg font-semibold text-gray-200">{results.weightedScore}/{results.maxWeightedScore}</div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Percentage</div>
                  <div className="text-lg font-semibold text-gray-200">{results.percentageCorrect}%</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 space-y-2">
                <p>• Easy questions (1.0x weight): {results.correctByDifficulty.easy}/28</p>
                <p>• Medium questions (1.2x weight): {results.correctByDifficulty.medium}/26</p>
                <p>• Hard questions (1.5x weight): {results.correctByDifficulty.hard}/12</p>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Scoring Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SATReadingWritingScorer;
