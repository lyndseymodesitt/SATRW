import React, { useState } from 'react';
import { BookOpen, Target, CheckCircle, Clock, TrendingUp, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const SATStudyPlan = ({ studentAnswers = [], totalQuestions = 66, onBack }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('4weeks');

  // Detailed question classification based on your actual SAT Practice Test
  const questionClassification = {
    vocabularyInContext: {
      name: "Vocabulary in Context",
      icon: BookOpen,
      color: "blue",
      questions: [1, 2, 3, 4, 5, 34, 35, 36, 37, 38],
      description: "Choosing precise words that fit the context",
      studyMaterials: [
        "Practice with context clues from real SAT passages",
        "Learn word families and root meanings",
        "Study connotation differences (rattled vs. demolished)",
        "Practice precision questions (clarified vs. confirmed)"
      ],
      practiceActivities: [
        "Read 20 minutes daily, noting unfamiliar words in context",
        "Complete 5 vocabulary-in-context questions daily",
        "Create flashcards for nuanced word differences",
        "Practice with Khan Academy vocabulary modules"
      ]
    },

    grammarAndConventions: {
      name: "Grammar & Conventions",
      icon: Target,
      color: "green",
      questions: [20, 21, 22, 23, 24, 25, 26, 51, 52, 53, 54, 55, 56, 57, 58],
      description: "Verb tenses, punctuation, pronouns, and sentence structure",
      studyMaterials: [
        "Master past perfect vs. simple past (had submitted vs. submitted)",
        "Learn colon usage after 'as follows' and similar phrases",
        "Practice pronoun cases (who vs. whom, I vs. me)",
        "Study subject-verb agreement with complex phrases"
      ],
      practiceActivities: [
        "Complete 10 grammar questions daily",
        "Review one grammar rule per day with examples",
        "Practice punctuation rules with real sentences",
        "Use grammar apps like Grammarly for daily writing"
      ]
    },

    logicalTransitions: {
      name: "Logical Transitions",
      icon: TrendingUp,
      color: "purple",
      questions: [27, 28, 29, 30, 59, 60, 61, 62],
      description: "Connecting ideas with appropriate transition words",
      studyMaterials: [
        "Learn cause-effect transitions (accordingly, consequently)",
        "Master contrast transitions (nevertheless, however)",
        "Practice time-sequence transitions (next, meanwhile)",
        "Study addition transitions (furthermore, moreover)"
      ],
      practiceActivities: [
        "Identify transition types in newspaper articles",
        "Practice choosing between similar transitions",
        "Write paragraphs focusing on logical flow",
        "Complete 5 transition questions daily"
      ]
    },

    readingComprehension: {
      name: "Reading Comprehension",
      icon: BookOpen,
      color: "indigo",
      questions: [6, 7, 8, 9, 10, 39, 40, 42, 43, 44],
      description: "Main ideas, text function, and passage analysis",
      studyMaterials: [
        "Practice identifying main purposes of passages",
        "Learn to analyze function of specific sentences",
        "Study cause-and-effect relationships in texts",
        "Master inference from context clues"
      ],
      practiceActivities: [
        "Read complex articles daily with purpose questions",
        "Practice summarizing main ideas in one sentence",
        "Analyze sentence functions in academic texts",
        "Complete reading comprehension passages daily"
      ]
    },

    evidenceAndData: {
      name: "Evidence & Data Analysis",
      icon: TrendingUp,
      color: "amber",
      questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 45, 47, 49],
      description: "Interpreting charts, selecting evidence, analyzing data",
      studyMaterials: [
        "Practice reading tables and conversion rate data",
        "Learn to calculate percentage changes from charts",
        "Study evidence selection from passage quotes",
        "Master data interpretation with constraints"
      ],
      practiceActivities: [
        "Analyze news articles with data and charts",
        "Practice calculating changes from before/after data",
        "Complete data interpretation questions daily",
        "Study graphs and tables from various sources"
      ]
    },

    researchSynthesis: {
      name: "Research Synthesis",
      icon: Target,
      color: "emerald",
      questions: [31, 32, 33, 46, 50, 63, 64, 65, 66],
      description: "Goal-oriented writing with multiple constraints",
      studyMaterials: [
        "Practice combining data from multiple sources",
        "Learn to meet specific writing goals with constraints",
        "Study academic writing with precise requirements",
        "Master budget/timeline constraint problems"
      ],
      practiceActivities: [
        "Practice synthesis questions with real research notes",
        "Write goal-oriented sentences with multiple constraints",
        "Analyze complex scenarios with competing priorities",
        "Complete advanced research-based questions"
      ]
    },

    textComparison: {
      name: "Text Comparison",
      icon: BookOpen,
      color: "rose",
      questions: [41, 48],
      description: "Analyzing relationships between different texts",
      studyMaterials: [
        "Practice comparing authors' different approaches",
        "Learn to identify contrasting viewpoints",
        "Study evidence selection across multiple texts",
        "Master relationship analysis between passages"
      ],
      practiceActivities: [
        "Compare news articles on the same topic",
        "Practice identifying author agreements/disagreements",
        "Analyze paired passages weekly",
        "Complete comparative analysis exercises"
      ]
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getColorClasses = (color, needsWork) => {
    const colors = {
      blue: needsWork ? 'bg-blue-900/20 border-blue-700/50 text-blue-300' : 'bg-blue-900/40 border-blue-600 text-blue-200',
      green: needsWork ? 'bg-green-900/20 border-green-700/50 text-green-300' : 'bg-green-900/40 border-green-600 text-green-200',
      purple: needsWork ? 'bg-purple-900/20 border-purple-700/50 text-purple-300' : 'bg-purple-900/40 border-purple-600 text-purple-200',
      indigo: needsWork ? 'bg-indigo-900/20 border-indigo-700/50 text-indigo-300' : 'bg-indigo-900/40 border-indigo-600 text-indigo-200',
      amber: needsWork ? 'bg-amber-900/20 border-amber-700/50 text-amber-300' : 'bg-amber-900/40 border-amber-600 text-amber-200',
      emerald: needsWork ? 'bg-emerald-900/20 border-emerald-700/50 text-emerald-300' : 'bg-emerald-900/40 border-emerald-600 text-emerald-200',
      rose: needsWork ? 'bg-rose-900/20 border-rose-700/50 text-rose-300' : 'bg-rose-900/40 border-rose-600 text-rose-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        {onBack && (
          <div className="text-left mb-6">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-all"
            >
              ← Back to Results
            </button>
          </div>
        )}
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

      {/* Study Sections */}
      <div className="space-y-6">
        {Object.entries(performance).map(([key, area]) => {
          const IconComponent = area.icon;
          const isExpanded = expandedSections[key];
          
          return (
            <div
              key={key}
              className={`border rounded-2xl p-6 transition-all ${getColorClasses(area.color, area.needsWork)}`}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection(key)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-${area.color}-500/20 border border-${area.color}-500/30`}>
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
                    <div className="text-lg font-bold">{area.percentage}%</div>
                    <div className="text-sm opacity-75">{area.correct}/{area.total}</div>
                  </div>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-current border-opacity-20">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Study Materials
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {area.studyMaterials.map((material, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Daily Practice ({Math.round(currentTimeframe.dailyTime * (area.needsWork ? 0.3 : 0.15))} min)
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {area.practiceActivities.map((activity, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target size={14} className="mt-0.5 flex-shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {area.needsWork && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
                      <h5 className="font-semibold text-yellow-300 mb-2">Weekly Goal</h5>
                      <p className="text-yellow-200 text-sm">
                        Improve accuracy to 80%+ by practicing {Math.ceil(area.total * 0.5)} similar questions this week.
                        Focus on your weakest question types first.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Study Plan Summary</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{currentTimeframe.dailyTime}</div>
            <div className="text-sm text-gray-400">Minutes per day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{priorityAreas.length}</div>
            <div className="text-sm text-gray-400">Priority areas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{Object.keys(performance).length - priorityAreas.length}</div>
            <div className="text-sm text-gray-400">Strong areas</div>
          </div>
        </div>
        <div className="mt-6 text-center text-gray-400">
          <p>Stick to your plan and you'll see improvement in 2-3 practice tests!</p>
        </div>
      </div>
    </div>
  );
};

export default SATStudyPlan;
