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

  // Inline color styles to avoid Tailwind purging and ensure colorful UI
  const getColorStyles = (color, needsWork) => {
    const map = {
      blue: needsWork
        ? { backgroundColor: 'rgba(30, 58, 138, 0.25)', borderColor: 'rgba(29, 78, 216, 0.5)', color: 'rgb(191, 219, 254)' }
        : { backgroundColor: 'rgba(30, 58, 138, 0.4)', borderColor: 'rgb(59, 130, 246)', color: 'rgb(191, 219, 254)' },
      green: needsWork
        ? { backgroundColor: 'rgba(20, 83, 45, 0.25)', borderColor: 'rgba(21, 128, 61, 0.5)', color: 'rgb(187, 247, 208)' }
        : { backgroundColor: 'rgba(20, 83, 45, 0.4)', borderColor: 'rgb(34, 197, 94)', color: 'rgb(187, 247, 208)' },
      purple: needsWork
        ? { backgroundColor: 'rgba(88, 28, 135, 0.25)', borderColor: 'rgba(124, 58, 237, 0.5)', color: 'rgb(221, 214, 254)' }
        : { backgroundColor: 'rgba(88, 28, 135, 0.4)', borderColor: 'rgb(168, 85, 247)', color: 'rgb(221, 214, 254)' },
      indigo: needsWork
        ? { backgroundColor: 'rgba(49, 46, 129, 0.25)', borderColor: 'rgba(79, 70, 229, 0.5)', color: 'rgb(199, 210, 254)' }
        : { backgroundColor: 'rgba(49, 46, 129, 0.4)', borderColor: 'rgb(99, 102, 241)', color: 'rgb(199, 210, 254)' },
      amber: needsWork
        ? { backgroundColor: 'rgba(120, 53, 15, 0.25)', borderColor: 'rgba(217, 119, 6, 0.5)', color: 'rgb(253, 230, 138)' }
        : { backgroundColor: 'rgba(120, 53, 15, 0.4)', borderColor: 'rgb(217, 119, 6)', color: 'rgb(253, 230, 138)' },
      emerald: needsWork
        ? { backgroundColor: 'rgba(6, 78, 59, 0.25)', borderColor: 'rgba(16, 185, 129, 0.5)', color: 'rgb(167, 243, 208)' }
        : { backgroundColor: 'rgba(6, 78, 59, 0.4)', borderColor: 'rgb(16, 185, 129)', color: 'rgb(167, 243, 208)' },
      rose: needsWork
        ? { backgroundColor: 'rgba(159, 18, 57, 0.25)', borderColor: 'rgba(225, 29, 72, 0.5)', color: 'rgb(254, 205, 211)' }
        : { backgroundColor: 'rgba(159, 18, 57, 0.4)', borderColor: 'rgb(225, 29, 72)', color: 'rgb(254, 205, 211)' }
    };
    return map[color] || map.blue;
  };

  const getIconStyles = (color) => {
    const map = {
      blue:   { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.35)' },
      green:  { backgroundColor: 'rgba(34, 197, 94, 0.2)',  borderColor: 'rgba(34, 197, 94, 0.35)' },
      purple: { backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: 'rgba(168, 85, 247, 0.35)' },
      indigo: { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: 'rgba(99, 102, 241, 0.35)' },
      amber:  { backgroundColor: 'rgba(245, 158, 11, 0.2)',  borderColor: 'rgba(245, 158, 11, 0.35)' },
      emerald:{ backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.35)' },
      rose:   { backgroundColor: 'rgba(244, 63, 94, 0.2)',  borderColor: 'rgba(244, 63, 94, 0.35)' }
    };
    return map[color] || map.blue;
  };

  // Allocation cards: colored like summary, readable text
  const getAllocationCardStyles = (color, needsWork) => {
    const base = getColorStyles(color, needsWork);
    return {
      backgroundColor: base.backgroundColor,
      borderColor: base.borderColor,
      color: 'rgb(226, 232, 240)',
      borderRadius: 14,
      borderWidth: 2,
      borderStyle: 'solid',
      boxShadow: '0 8px 24px rgba(0,0,0,0.22)'
    };
  };

  const getSubtleIconStyles = (color) => {
    const base = getIconStyles(color);
    return {
      backgroundColor: base.backgroundColor,
      borderColor: base.borderColor,
      opacity: 0.6
    };
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
      <div className="mb-8" style={{ marginBottom: 48 }}>
        <h2 className="text-xl font-semibold text-gray-200 mb-4" style={{ textAlign: 'center' }}>Choose Your Timeline</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {/* 2 Weeks - Red */}
          <button
            onClick={() => setSelectedTimeframe('2weeks')}
            style={{
              padding: 20,
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: 'solid',
              backgroundColor: selectedTimeframe === '2weeks' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(127, 29, 29, 0.2)',
              borderColor: selectedTimeframe === '2weeks' ? 'rgb(239, 68, 68)' : 'rgba(185, 28, 28, 0.5)',
              color: selectedTimeframe === '2weeks' ? 'rgb(248, 113, 113)' : 'rgb(252, 165, 165)'
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>2 Weeks</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>90 min/day</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Intensive prep</div>
          </button>
          {/* 4 Weeks - Blue */}
          <button
            onClick={() => setSelectedTimeframe('4weeks')}
            style={{
              padding: 20,
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: 'solid',
              backgroundColor: selectedTimeframe === '4weeks' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(30, 58, 138, 0.2)',
              borderColor: selectedTimeframe === '4weeks' ? 'rgb(59, 130, 246)' : 'rgba(29, 78, 216, 0.5)',
              color: selectedTimeframe === '4weeks' ? 'rgb(147, 197, 253)' : 'rgb(191, 219, 254)'
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>4 Weeks</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>60 min/day</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Balanced approach</div>
          </button>
          {/* 8 Weeks - Green */}
          <button
            onClick={() => setSelectedTimeframe('8weeks')}
            style={{
              padding: 20,
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: 'solid',
              backgroundColor: selectedTimeframe === '8weeks' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(20, 83, 45, 0.2)',
              borderColor: selectedTimeframe === '8weeks' ? 'rgb(34, 197, 94)' : 'rgba(21, 128, 61, 0.5)',
              color: selectedTimeframe === '8weeks' ? 'rgb(134, 239, 172)' : 'rgb(187, 247, 208)'
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>8 Weeks</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>45 min/day</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Gradual improvement</div>
          </button>
        </div>
      </div>

      {/* Study Plan Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Study Plan Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div
            className="p-5 border text-center"
            style={{ backgroundColor: 'rgba(30, 58, 138, 0.35)', borderColor: 'rgb(59, 130, 246)', color: 'rgb(191, 219, 254)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}
          >
            <div className="font-bold" style={{ fontSize: 28 }}>{currentTimeframe.dailyTime}</div>
            <div className="text-sm" style={{ opacity: 0.8 }}>Minutes per day</div>
          </div>
          <div
            className="p-5 border text-center"
            style={{ backgroundColor: 'rgba(88, 28, 135, 0.35)', borderColor: 'rgb(168, 85, 247)', color: 'rgb(221, 214, 254)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}
          >
            <div className="font-bold" style={{ fontSize: 28 }}>{priorityAreas.length}</div>
            <div className="text-sm" style={{ opacity: 0.8 }}>Priority areas</div>
          </div>
          <div
            className="p-5 border text-center"
            style={{ backgroundColor: 'rgba(20, 83, 45, 0.35)', borderColor: 'rgb(34, 197, 94)', color: 'rgb(187, 247, 208)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}
          >
            <div className="font-bold" style={{ fontSize: 28 }}>{Object.keys(performance).length - priorityAreas.length}</div>
            <div className="text-sm" style={{ opacity: 0.8 }}>Strong areas</div>
          </div>
        </div>

        {/* Time Breakdown by Skill */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200" style={{ marginTop: 32, marginBottom: 16, textAlign: 'center' }}>Daily Time Allocation by Skill Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ gap: 24 }}>
            {Object.entries(performance)
              .sort((a, b) => a[1].percentage - b[1].percentage)
              .map(([key, area]) => {
                const baseTime = currentTimeframe.dailyTime;
                let timeAllocation;
                if (area.percentage < 50) timeAllocation = Math.round(baseTime * 0.25);
                else if (area.percentage < 70) timeAllocation = Math.round(baseTime * 0.18);
                else if (area.percentage < 85) timeAllocation = Math.round(baseTime * 0.12);
                else timeAllocation = Math.round(baseTime * 0.08);

                const IconComponent = area.icon;
                return (
                  <div key={key} className="p-6" style={{ ...getAllocationCardStyles(area.color, area.needsWork), textAlign: 'left', padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      {/* Left: icon on top, then title and current % */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <IconComponent size={20} style={{ opacity: 0.7, marginBottom: 6 }} />
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{area.name}</div>
                        <div style={{ fontSize: 14, opacity: 0.8 }}>Current: {area.percentage}% ({area.correct}/{area.total})</div>
                      </div>
                      {/* Right: minutes and priority */}
                      <div style={{ minWidth: 160, textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{timeAllocation} min</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
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
        <div className="mb-8">
          <div
            className="p-5 border"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.85)', borderColor: 'rgba(71, 85, 105, 0.45)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={20} style={{ color: 'rgb(252, 165, 165)' }} />
              <h2 className="text-base font-semibold" style={{ color: 'rgb(226, 232, 240)' }}>Priority Focus Areas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityAreas.slice(0, 3).map(([key, area]) => (
                <div
                  key={key}
                  className="p-5 border"
                  style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: 'rgba(185, 28, 28, 0.5)', color: 'rgb(252, 165, 165)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
                      <area.icon size={18} style={{ color: 'rgb(252, 165, 165)' }} />
                    </div>
                    <span className="font-semibold" style={{ color: 'rgb(226, 232, 240)', fontSize: 16 }}>{area.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ fontSize: 18, color: 'rgb(254, 205, 211)' }}>{area.percentage}%</div>
                    <div className="text-xs" style={{ color: 'rgb(252, 165, 165)' }}>{area.correct}/{area.total} correct</div>
                  </div>
                </div>
              ))}
            </div>
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
              className="p-5 border transition-colors"
              style={{ backgroundColor: 'rgba(2, 6, 23, 0.85)', borderColor: 'rgba(71, 85, 105, 0.45)', color: 'rgb(226, 232, 240)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection(key)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl border" style={{ ...getIconStyles(area.color), width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ fontSize: 18 }}>{area.name}</h3>
                    <p className="text-sm" style={{ opacity: 0.75 }}>{area.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs" style={{ color: area.needsWork ? 'rgb(252, 165, 165)' : 'rgb(134, 239, 172)' }}>
                    {area.needsWork ? 'Needs Work' : 'Strong'}
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ fontSize: 18 }}>{area.percentage}%</div>
                    <div className="text-sm" style={{ opacity: 0.75 }}>{area.correct}/{area.total}</div>
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