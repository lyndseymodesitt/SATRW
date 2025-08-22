import React, { useState } from 'react';
import { BookOpen, Target, CheckCircle, Clock, TrendingUp, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const SATStudyPlan = ({ studentAnswers = [], totalQuestions = 66 }) => {
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

  const getIconColorClasses = (color) => {
    // Use simple background colors that are guaranteed to be in Tailwind
    return 'bg-gray-600/40 border-gray-500/50';
  };

  const getColorClasses = (color, needsWork) => {
    // Simplify to basic gray styling that will always work
    if (needsWork) {
      return 'bg-gray-800/60 border-gray-600/50 text-gray-200 rounded-2xl';
    } else {
      return 'bg-gray-700/60 border-gray-500/50 text-gray-100 rounded-2xl';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-700/40 rounded-xl p-6 text-center border border-gray-600/50">
            <div className="text-3xl font-bold text-blue-400 mb-2">{currentTimeframe.dailyTime}</div>
            <div className="text-sm text-gray-300">Minutes per day</div>
          </div>
          <div className="bg-gray-700/40 rounded-xl p-6 text-center border border-gray-600/50">
            <div className="text-3xl font-bold text-purple-400 mb-2">{priorityAreas.length}</div>
            <div className="text-sm text-gray-300">Priority areas</div>
          </div>
          <div className="bg-gray-700/40 rounded-xl p-6 text-center border border-gray-600/50">
            <div className="text-3xl font-bold text-green-400 mb-2">{Object.keys(performance).length - priorityAreas.length}</div>
            <div className="text-sm text-gray-300">Strong areas</div>
          </div>
        </div>

        {/* Time Breakdown by Skill */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Daily Time Allocation by Skill Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(performance)
              .sort((a, b) => a[1].percentage - b[1].percentage) // Sort by performance, worst first
              .map(([key, area]) => {
                // Calculate time allocation based on performance
                // Worse performance = more time allocated
                const baseTime = currentTimeframe.dailyTime;
                let timeAllocation;
                
                if (area.percentage < 50) {
                  timeAllocation = Math.round(baseTime * 0.25); // 25% of total time for worst areas
                } else if (area.percentage < 70) {
                  timeAllocation = Math.round(baseTime * 0.18); // 18% of total time for medium areas
                } else if (area.percentage < 85) {
                  timeAllocation = Math.round(baseTime * 0.12); // 12% of total time for good areas
                } else {
                  timeAllocation = Math.round(baseTime * 0.08); // 8% of total time for strong areas
                }

                const IconComponent = area.icon;
                
                return (
                  <div key={key} className="bg-gray-700/40 rounded-xl p-4 border border-gray-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getIconColorClasses(area.color)}`}>
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-200">{area.name}</div>
                          <div className="text-sm text-gray-400">Current: {area.percentage}% ({area.correct}/{area.total})</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-400">{timeAllocation} min</div>
                        <div className="text-xs text-gray-400">
                          {area.percentage < 70 ? 'High Priority' : area.percentage < 85 ? 'Maintenance' : 'Review Only'}
                        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityAreas.slice(0, 3).map(([key, area]) => (
              <div key={key} className="bg-red-800/30 rounded-xl p-6 border border-red-600/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                    <area.icon size={20} className="text-red-400" />
                  </div>
                  <span className="font-semibold text-red-300 text-lg">{area.name}</span>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-200 mb-1">{area.percentage}%</div>
                  <div className="text-sm text-red-300">{area.correct}/{area.total} correct</div>
                  <div className="mt-3 bg-red-700/30 px-3 py-1 rounded-full text-xs text-red-200 font-medium">
                    Needs Work
                  </div>
                </div>
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
              className={`border border-gray-600 rounded-2xl p-6 transition-all bg-gray-800/50 text-gray-200`}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection(key)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${getIconColorClasses(area.color)}`}>
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


    </div>
  );
};

export default SATStudyPlan;