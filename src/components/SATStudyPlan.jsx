import React, { useState, useEffect } from 'react';
import { BookOpen, Target, TrendingUp, AlertCircle } from 'lucide-react';

const SATStudyPlan = ({ studentAnswers = [], totalQuestions = 66 }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('4weeks');
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render when timeframe changes to update all calculations
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [selectedTimeframe]);

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

  const getColorStyles = (color, needsWork) => {
    const colors = {
      blue: needsWork ? { backgroundColor: 'rgba(30, 58, 138, 0.2)', borderColor: 'rgba(29, 78, 216, 0.5)', color: 'rgb(147, 197, 253)' } : { backgroundColor: 'rgba(30, 58, 138, 0.4)', borderColor: 'rgb(37, 99, 235)', color: 'rgb(191, 219, 254)' },
      green: needsWork ? { backgroundColor: 'rgba(20, 83, 45, 0.2)', borderColor: 'rgba(21, 128, 61, 0.5)', color: 'rgb(134, 239, 172)' } : { backgroundColor: 'rgba(20, 83, 45, 0.4)', borderColor: 'rgb(22, 163, 74)', color: 'rgb(187, 247, 208)' },
      purple: needsWork ? { backgroundColor: 'rgba(88, 28, 135, 0.2)', borderColor: 'rgba(109, 40, 217, 0.5)', color: 'rgb(196, 181, 253)' } : { backgroundColor: 'rgba(88, 28, 135, 0.4)', borderColor: 'rgb(147, 51, 234)', color: 'rgb(221, 214, 254)' },
      indigo: needsWork ? { backgroundColor: 'rgba(49, 46, 129, 0.2)', borderColor: 'rgba(67, 56, 202, 0.5)', color: 'rgb(165, 180, 252)' } : { backgroundColor: 'rgba(49, 46, 129, 0.4)', borderColor: 'rgb(99, 102, 241)', color: 'rgb(199, 210, 254)' },
      amber: needsWork ? { backgroundColor: 'rgba(120, 53, 15, 0.2)', borderColor: 'rgba(146, 64, 14, 0.5)', color: 'rgb(252, 211, 77)' } : { backgroundColor: 'rgba(120, 53, 15, 0.4)', borderColor: 'rgb(217, 119, 6)', color: 'rgb(253, 230, 138)' },
      emerald: needsWork ? { backgroundColor: 'rgba(6, 78, 59, 0.2)', borderColor: 'rgba(4, 120, 87, 0.5)', color: 'rgb(110, 231, 183)' } : { backgroundColor: 'rgba(6, 78, 59, 0.4)', borderColor: 'rgb(5, 150, 105)', color: 'rgb(167, 243, 208)' },
      rose: needsWork ? { backgroundColor: 'rgba(159, 18, 57, 0.2)', borderColor: 'rgba(190, 18, 60, 0.5)', color: 'rgb(251, 113, 133)' } : { backgroundColor: 'rgba(159, 18, 57, 0.4)', borderColor: 'rgb(225, 29, 72)', color: 'rgb(252, 165, 165)' }
    };
    return colors[color] || colors.blue;
  };

  const getIconStyles = (color) => {
    const colors = {
      blue: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' },
      green: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)' },
      purple: { backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: 'rgba(168, 85, 247, 0.3)' },
      indigo: { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: 'rgba(99, 102, 241, 0.3)' },
      amber: { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.3)' },
      emerald: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.3)' },
      rose: { backgroundColor: 'rgba(244, 63, 94, 0.2)', borderColor: 'rgba(244, 63, 94, 0.3)' }
    };
    return colors[color] || colors.blue;
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
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Choose Your Timeline</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(timeframes).map(([key, timeframe]) => (
            <button
              key={key}
              onClick={() => setSelectedTimeframe(key)}
              className="p-6 rounded-2xl transition-all border-2"
              style={{
                backgroundColor: selectedTimeframe === key ? 'rgba(59, 130, 246, 0.3)' : 'rgba(55, 65, 81, 0.5)',
                borderColor: selectedTimeframe === key ? 'rgb(59, 130, 246)' : 'rgba(75, 85, 99, 0.5)',
                color: selectedTimeframe === key ? 'rgb(147, 197, 253)' : 'rgb(209, 213, 219)'
              }}
            >
              <div className="text-lg font-semibold">{timeframe.name}</div>
              <div className="text-sm opacity-75">{timeframe.dailyTime} min/day</div>
              <div className="text-xs opacity-60">{timeframe.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Study Plan Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Study Plan Summary</h2>
        
        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border-2 p-6 text-center" style={{ backgroundColor: 'rgba(30, 58, 138, 0.3)', borderColor: 'rgba(29, 78, 216, 0.6)', color: 'rgb(147, 197, 253)' }}>
            <div className="text-3xl font-bold mb-2">{currentTimeframe.dailyTime}</div>
            <div className="text-sm opacity-75">Minutes per day</div>
          </div>
          <div className="rounded-2xl border-2 p-6 text-center" style={{ backgroundColor: 'rgba(88, 28, 135, 0.3)', borderColor: 'rgba(109, 40, 217, 0.6)', color: 'rgb(196, 181, 253)' }}>
            <div className="text-3xl font-bold mb-2">{priorityAreas.length}</div>
            <div className="text-sm opacity-75">Priority areas</div>
          </div>
          <div className="rounded-2xl border-2 p-6 text-center" style={{ backgroundColor: 'rgba(20, 83, 45, 0.3)', borderColor: 'rgba(21, 128, 61, 0.6)', color: 'rgb(134, 239, 172)' }}>
            <div className="text-3xl font-bold mb-2">{Object.keys(performance).length - priorityAreas.length}</div>
            <div className="text-sm opacity-75">Strong areas</div>
          </div>
        </div>
      </div>

      {/* Daily Time Allocation by Skill Area */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Daily Time Allocation by Skill Area</h2>
        <div className="space-y-4">
          {Object.entries(performance)
            .sort((a, b) => a[1].percentage - b[1].percentage)
            .map(([key, area]) => {
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
                <div key={key} className="flex items-center justify-between p-4 rounded-xl border" style={getColorStyles(area.color, area.needsWork)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border" style={getIconStyles(area.color)}>
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

      {/* Priority Areas */}
      {priorityAreas.length > 0 && (
        <div className="mb-8">
          <div className="rounded-2xl border-2 p-6" style={{ backgroundColor: 'rgba(153, 27, 27, 0.3)', borderColor: 'rgba(220, 38, 38, 0.6)' }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-400" size={24} />
              <h2 className="text-xl font-semibold text-red-300">Priority Focus Areas</h2>
            </div>
            <p className="text-red-200 mb-4">These areas need the most attention based on your practice test:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {priorityAreas.slice(0, 3).map(([key, area]) => (
                <div key={key} className="rounded-xl p-4 border-2" style={{ backgroundColor: 'rgba(127, 29, 29, 0.3)', borderColor: 'rgba(185, 28, 28, 0.6)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <area.icon size={16} className="text-red-400" />
                    <span className="font-semibold text-red-300">{area.name}</span>
                  </div>
                  <div className="text-sm text-red-200">{area.correct}/{area.total} correct ({area.percentage}%)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skill Categories - Clean Summary View */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Skill Categories Overview</h2>
        <div className="space-y-4">
          {Object.entries(performance).map(([key, area]) => {
            const IconComponent = area.icon;
            
            return (
              <div
                key={key}
                className="border rounded-2xl p-6 transition-all"
                style={getColorStyles(area.color, area.needsWork)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl border" style={getIconStyles(area.color)}>
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

    </div>
  );
};

export default SATStudyPlan;