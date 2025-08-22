import React, { useState } from 'react';
import { BookOpen, Target, TrendingUp, AlertCircle } from 'lucide-react';

const SATStudyPlan = ({ studentAnswers = [], totalQuestions = 66 }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('4weeks');

  // Detailed question classification based on your actual SAT Practice Test
  const questionClassification = {
    vocabularyInContext: {
      name: "Vocabulary in Context",
      icon: BookOpen,
      color: "blue",
      questions: [1, 2, 3, 4, 5, 34, 35, 36, 37, 38],
      description: "Choosing precise words that fit the context"
    },

    grammarAndConventions: {
      name: "Grammar & Conventions",
      icon: Target,
      color: "green",
      questions: [20, 21, 22, 23, 24, 25, 26, 51, 52, 53, 54, 55, 56, 57, 58],
      description: "Verb tenses, punctuation, pronouns, and sentence structure"
    },

    logicalTransitions: {
      name: "Logical Transitions",
      icon: TrendingUp,
      color: "purple",
      questions: [27, 28, 29, 30, 59, 60, 61, 62],
      description: "Connecting ideas with appropriate transition words"
    },

    readingComprehension: {
      name: "Reading Comprehension",
      icon: BookOpen,
      color: "indigo",
      questions: [6, 7, 8, 9, 10, 39, 40, 42, 43, 44],
      description: "Main ideas, text function, and passage analysis"
    },

    evidenceAndData: {
      name: "Evidence & Data Analysis",
      icon: TrendingUp,
      color: "amber",
      questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 45, 47, 49],
      description: "Interpreting charts, selecting evidence, analyzing data"
    },

    researchSynthesis: {
      name: "Research Synthesis",
      icon: Target,
      color: "emerald",
      questions: [31, 32, 33, 46, 50, 63, 64, 65, 66],
      description: "Goal-oriented writing with multiple constraints"
    },

    textComparison: {
      name: "Text Comparison",
      icon: BookOpen,
      color: "rose",
      questions: [41, 48],
      description: "Analyzing relationships between different texts"
    }
  };

  // Analyze student performance
  const analyzePerformance = () => {
    if (!studentAnswers || studentAnswers.length === 0) {
      return Object.keys(questionClassification).reduce((acc, key) => {
        acc[key] = {
          ...questionClassification[key],
          correct: 0,
          total: questionClassification[key].questions.length,
          percentage: 0,
          needsWork: true
        };
        return acc;
      }, {});
    }

    const analysis = {};
    
    Object.keys(questionClassification).forEach(categoryKey => {
      const category = questionClassification[categoryKey];
      let correct = 0;
      
      category.questions.forEach(questionNum => {
        const answerIndex = questionNum - 1;
        if (studentAnswers[answerIndex] && studentAnswers[answerIndex].isCorrect) {
          correct++;
        }
      });
      
      const total = category.questions.length;
      const percentage = total > 0 ? (correct / total) * 100 : 0;
      
      analysis[categoryKey] = {
        ...category,
        correct,
        total,
        percentage: Math.round(percentage),
        needsWork: percentage < 75
      };
    });
    
    return analysis;
  };

  const performance = analyzePerformance();
  const priorityAreas = Object.entries(performance)
    .filter(([_, data]) => data.needsWork)
    .sort((a, b) => a[1].percentage - b[1].percentage);

  const timeframes = {
    '2weeks': { name: '2 Weeks', dailyTime: 90, description: 'Intensive prep' },
    '4weeks': { name: '4 Weeks', dailyTime: 60, description: 'Balanced approach' },
    '8weeks': { name: '8 Weeks', dailyTime: 45, description: 'Gradual improvement' }
  };

  const currentTimeframe = timeframes[selectedTimeframe];

  const getColorClasses = (color, needsWork) => {
    if (needsWork) {
      switch (color) {
        case 'blue': return 'bg-blue-900/20 border-blue-700/50 text-blue-300';
        case 'green': return 'bg-green-900/20 border-green-700/50 text-green-300';
        case 'purple': return 'bg-purple-900/20 border-purple-700/50 text-purple-300';
        case 'indigo': return 'bg-indigo-900/20 border-indigo-700/50 text-indigo-300';
        case 'amber': return 'bg-amber-900/20 border-amber-700/50 text-amber-300';
        case 'emerald': return 'bg-emerald-900/20 border-emerald-700/50 text-emerald-300';
        case 'rose': return 'bg-rose-900/20 border-rose-700/50 text-rose-300';
        default: return 'bg-blue-900/20 border-blue-700/50 text-blue-300';
      }
    } else {
      switch (color) {
        case 'blue': return 'bg-blue-900/40 border-blue-600 text-blue-200';
        case 'green': return 'bg-green-900/40 border-green-600 text-green-200';
        case 'purple': return 'bg-purple-900/40 border-purple-600 text-purple-200';
        case 'indigo': return 'bg-indigo-900/40 border-indigo-600 text-indigo-200';
        case 'amber': return 'bg-amber-900/40 border-amber-600 text-amber-200';
        case 'emerald': return 'bg-emerald-900/40 border-emerald-600 text-emerald-200';
        case 'rose': return 'bg-rose-900/40 border-rose-600 text-rose-200';
        default: return 'bg-blue-900/40 border-blue-600 text-blue-200';
      }
    }
  };

  const getIconBackgroundClasses = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 border border-blue-500/30';
      case 'green': return 'bg-green-500/20 border border-green-500/30';
      case 'purple': return 'bg-purple-500/20 border border-purple-500/30';
      case 'indigo': return 'bg-indigo-500/20 border border-indigo-500/30';
      case 'amber': return 'bg-amber-500/20 border border-amber-500/30';
      case 'emerald': return 'bg-emerald-500/20 border border-emerald-500/30';
      case 'rose': return 'bg-rose-500/20 border border-rose-500/30';
      default: return 'bg-blue-500/20 border border-blue-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="text-blue-400" size={32} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your SAT Study Plan
          </h1>
        </div>
        <p className="text-gray-400 text-lg">Personalized recommendations based on your practice test performance</p>
      </div>

      {/* Timeframe Selection */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Choose Your Timeline</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(timeframes).map(([key, timeframe]) => (
            <button
              key={key}
              onClick={() => setSelectedTimeframe(key)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTimeframe === key
                  ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                  : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-lg font-semibold">{timeframe.name}</div>
              <div className="text-sm opacity-75">{timeframe.dailyTime} min/day</div>
              <div className="text-xs opacity-60">{timeframe.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Study Plan Summary */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6">Study Plan Summary</h2>
        
        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
          <div>
            <div className="text-2xl font-bold text-blue-400 bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">{currentTimeframe.dailyTime}</div>
            <div className="text-sm text-gray-400">Minutes per day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400 bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">{priorityAreas.length}</div>
            <div className="text-sm text-gray-400">Priority areas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 bg-green-900/20 border border-green-700/50 rounded-lg p-3">{Object.keys(performance).length - priorityAreas.length}</div>
            <div className="text-sm text-gray-400">Strong areas</div>
          </div>
        </div>

        {/* Time Breakdown by Skill */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Daily Time Allocation by Skill Area</h3>
          <div className="space-y-3">
            {Object.entries(performance)
              .sort((a, b) => a[1].percentage - b[1].percentage) // Sort by performance, worst first
              .map(([key, area]) => {
                // Calculate time allocation based on performance
                const baseTime = currentTimeframe.dailyTime;
                let timeAllocation;
                
                if (area.percentage < 50) {
                  timeAllocation = Math.round(baseTime * 0.25);
                } else if (area.percentage < 70) {
                  timeAllocation = Math.round(baseTime * 0.18);
                } else if (area.percentage < 85) {
                  timeAllocation = Math.round(baseTime * 0.12);
                } else {
                  timeAllocation = Math.round(baseTime * 0.08);
                }

                const IconComponent = area.icon;
                
                return (
                  <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${getColorClasses(area.color, area.needsWork)}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getIconBackgroundClasses(area.color)}`}>
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <div className="font-medium">{area.name}</div>
                        <div className="text-sm opacity-75">Current: {area.percentage}% ({area.correct}/{area.total})</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">{timeAllocation} min</div>
                      <div className="text-xs opacity-75">
                        {area.percentage < 70 ? 'High Priority' : area.percentage < 85 ? 'Maintenance' : 'Review Only'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-400">
          <p>Time allocation adjusts based on your current performance. Focus more time on weaker areas!</p>
        </div>
      </div>

      {/* Priority Areas */}
      {priorityAreas.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-400" size={24} />
            <h2 className="text-xl font-semibold text-red-300">Priority Focus Areas</h2>
          </div>
          <p className="text-red-200 mb-4">These areas need the most attention based on your practice test:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {priorityAreas.slice(0, 3).map(([key, area]) => (
              <div key={key} className="bg-red-800/20 rounded-xl p-4 border border-red-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <area.icon size={16} className="text-red-400" />
                  <span className="font-semibold text-red-300">{area.name}</span>
                </div>
                <div className="text-sm text-red-200">{area.correct}/{area.total} correct ({area.percentage}%)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Categories - Clean Summary View */}
      <div className="space-y-4">
        {Object.entries(performance).map(([key, area]) => {
          const IconComponent = area.icon;
          
          return (
            <div
              key={key}
              className={`border rounded-2xl p-6 transition-all ${getColorClasses(area.color, area.needsWork)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${getIconBackgroundClasses(area.color)}`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{area.name}</h3>
                    <p className="text-sm opacity-75">{area.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {area.needsWork ? (
                    <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                      Needs Work
                    </div>
                  ) : (
                    <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      Strong
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{area.percentage}%</div>
                    <div className="text-sm opacity-75">{area.correct}/{area.total}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default SATStudyPlan;

