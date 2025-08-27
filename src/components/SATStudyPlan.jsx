import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Award,
  Zap,
  Brain,
  Eye,
  BarChart3,
  Users,
  ArrowRight,
  Star,
  PlayCircle
} from "lucide-react";

/**
 * SATStudyPlan
 * Props:
 *  - studentAnswers: [{ isCorrect: boolean }, ...]
 *  - totalQuestions: number (default 66)
 */
export default function SATStudyPlan({ studentAnswers = [], totalQuestions = 66 }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState("4weeks");

  // --- Classification (adjust to match your test) ---
  const questionClassification = useMemo(
    () => ({
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
          "Practice precision questions (clarified vs. confirmed)",
        ],
        practiceActivities: [
          "Read 20 minutes daily, noting unfamiliar words in context",
          "Complete 5 vocabulary-in-context questions daily",
          "Create flashcards for nuanced word differences",
          "Practice with Khan Academy vocabulary modules",
        ],
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
          "Study subject-verb agreement with complex phrases",
        ],
        practiceActivities: [
          "Complete 10 grammar questions daily",
          "Review one grammar rule per day with examples",
          "Practice punctuation rules with real sentences",
          "Use grammar apps like Grammarly for daily writing",
        ],
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
          "Study addition transitions (furthermore, moreover)",
        ],
        practiceActivities: [
          "Identify transition types in newspaper articles",
          "Practice choosing between similar transitions",
          "Write paragraphs focusing on logical flow",
          "Complete 5 transition questions daily",
        ],
      },

      readingComprehension: {
        name: "Reading Comprehension",
        icon: Eye,
        color: "indigo",
        questions: [6, 7, 8, 9, 10, 39, 40, 42, 43, 44],
        description: "Main ideas, text function, and passage analysis",
        studyMaterials: [
          "Practice identifying main purposes of passages",
          "Learn to analyze function of specific sentences",
          "Study cause-and-effect relationships in texts",
          "Master inference from context clues",
        ],
        practiceActivities: [
          "Read complex articles daily with purpose questions",
          "Practice identifying text function (introduce, support, conclude)",
          "Analyze author's tone and purpose in editorials",
          "Complete 3 reading comprehension passages weekly",
        ],
      },

      evidenceAndData: {
        name: "Evidence & Data Analysis",
        icon: BarChart3,
        color: "amber",
        questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 45, 46, 47, 48, 49, 50],
        description: "Interpreting charts, graphs, and supporting evidence",
        studyMaterials: [
          "Practice reading bar charts, line graphs, and tables",
          "Learn to identify trends and patterns in data",
          "Study how to connect data to text claims",
          "Master evidence-based reasoning questions",
        ],
        practiceActivities: [
          "Analyze charts from news articles daily",
          "Practice connecting data points to conclusions",
          "Complete 5 evidence questions daily",
          "Create your own charts from data sets",
        ],
      },

      researchSynthesis: {
        name: "Research Synthesis",
        icon: Brain,
        color: "emerald",
        questions: [31, 32, 33, 63, 64, 65, 66],
        description: "Comparing multiple sources and synthesizing information",
        studyMaterials: [
          "Practice identifying agreements and disagreements between sources",
          "Learn to evaluate source credibility and bias",
          "Study how to synthesize information from multiple texts",
          "Master questions about source relationships",
        ],
        practiceActivities: [
          "Compare editorials on the same topic",
          "Practice identifying source agreements/disagreements",
          "Complete 3 synthesis questions daily",
          "Read multiple perspectives on current events",
        ],
      },

      textComparison: {
        name: "Text Comparison",
        icon: Users,
        color: "rose",
        questions: [41],
        description: "Comparing and contrasting different texts",
        studyMaterials: [
          "Practice identifying similarities and differences between texts",
          "Learn to analyze author perspectives and approaches",
          "Study how different authors handle the same topic",
          "Master comparison-based reasoning questions",
        ],
        practiceActivities: [
          "Compare two editorials on the same topic",
          "Practice identifying author differences in approach",
          "Complete 2 comparison questions daily",
          "Analyze how different sources present information",
        ],
      },
    }),
    []
  );

  // --- Performance calculation ---
  const performance = useMemo(() => {
    const results = {};
    Object.entries(questionClassification).forEach(([key, category]) => {
      const categoryQuestions = category.questions;
      const total = categoryQuestions.length;
      const correct = categoryQuestions.filter((qNum) => {
        const answer = studentAnswers[qNum - 1];
        return answer?.isCorrect;
      }).length;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const needsWork = percentage < 70;

      results[key] = {
        ...category,
        total,
        correct,
        percentage,
        needsWork,
      };
    });
    return results;
  }, [studentAnswers, questionClassification]);

  const priorityAreas = useMemo(
    () =>
      Object.entries(performance)
        .filter(([, d]) => d.needsWork)
        .sort((a, b) => a[1].percentage - b[1].percentage),
    [performance]
  );

  // --- Timeframes & fallback ---
  const timeframes = {
    "2weeks": { name: "2 Weeks", dailyTime: 90, description: "Intensive prep", color: "red" },
    "4weeks": { name: "4 Weeks", dailyTime: 60, description: "Balanced approach", color: "blue" },
    "8weeks": { name: "8 Weeks", dailyTime: 45, description: "Gradual improvement", color: "green" },
  };
  const DEFAULT_TIMEFRAME = "4weeks";
  const currentTimeframe = timeframes[selectedTimeframe] ?? timeframes[DEFAULT_TIMEFRAME];

  // --- Overall stats ---
  const answered = Math.min(totalQuestions, studentAnswers?.length ?? 0);
  const totalCorrect = (studentAnswers || []).filter((a) => a?.isCorrect).length;
  const overallPct = answered ? Math.round((totalCorrect / answered) * 100) : 0;

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  // Get color utility functions
  const getColorClasses = (color, type = "card") => {
    const colorMap = {
      blue: {
        card: "from-blue-50 to-blue-100 border-blue-200",
        text: "text-blue-700",
        accent: "bg-blue-500",
        icon: "bg-blue-100 text-blue-600",
        button: "bg-blue-500 hover:bg-blue-600"
      },
      green: {
        card: "from-green-50 to-green-100 border-green-200",
        text: "text-green-700",
        accent: "bg-green-500",
        icon: "bg-green-100 text-green-600",
        button: "bg-green-500 hover:bg-green-600"
      },
      purple: {
        card: "from-purple-50 to-purple-100 border-purple-200",
        text: "text-purple-700",
        accent: "bg-purple-500",
        icon: "bg-purple-100 text-purple-600",
        button: "bg-purple-500 hover:bg-purple-600"
      },
      indigo: {
        card: "from-indigo-50 to-indigo-100 border-indigo-200",
        text: "text-indigo-700",
        accent: "bg-indigo-500",
        icon: "bg-indigo-100 text-indigo-600",
        button: "bg-indigo-500 hover:bg-indigo-600"
      },
      amber: {
        card: "from-amber-50 to-amber-100 border-amber-200",
        text: "text-amber-700",
        accent: "bg-amber-500",
        icon: "bg-amber-100 text-amber-600",
        button: "bg-amber-500 hover:bg-amber-600"
      },
      emerald: {
        card: "from-emerald-50 to-emerald-100 border-emerald-200",
        text: "text-emerald-700",
        accent: "bg-emerald-500",
        icon: "bg-emerald-100 text-emerald-600",
        button: "bg-emerald-500 hover:bg-emerald-600"
      },
      rose: {
        card: "from-rose-50 to-rose-100 border-rose-200",
        text: "text-rose-700",
        accent: "bg-rose-500",
        icon: "bg-rose-100 text-rose-600",
        button: "bg-rose-500 hover:bg-rose-600"
      },
      red: {
        card: "from-red-50 to-red-100 border-red-200",
        text: "text-red-700",
        accent: "bg-red-500",
        icon: "bg-red-100 text-red-600",
        button: "bg-red-500 hover:bg-red-600"
      }
    };
    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  // Dev guardrails
  useEffect(() => {
    const map = new Map();
    Object.values(questionClassification).forEach((cat) =>
      cat.questions.forEach((q) => map.set(q, (map.get(q) || 0) + 1))
    );
    const dups = [...map.entries()].filter(([, count]) => count > 1);
    const missing = Array.from({ length: totalQuestions }, (_, i) => i + 1).filter((n) => !map.has(n));
    if (dups.length) console.warn("Questions in multiple categories:", dups);
    if (missing.length) console.warn("Unclassified questions:", missing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6">
            <Award className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Your Personalized SAT Study Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your SAT performance with AI-powered insights and personalized recommendations
          </p>
        </div>

        {/* Quick Stats Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <BarChart3 className="text-white" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{overallPct}%</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Overall Score</h3>
            <p className="text-sm text-gray-500">{totalCorrect}/{answered} questions correct</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                <AlertCircle className="text-white" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{priorityAreas.length}</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Focus Areas</h3>
            <p className="text-sm text-gray-500">Areas needing improvement</p>
            <div className="flex items-center mt-3">
              <div className="flex -space-x-1">
                {priorityAreas.slice(0, 3).map(([key, area], index) => (
                  <div key={key} className={`w-8 h-8 rounded-full border-2 border-white ${getColorClasses(area.color, 'accent')} flex items-center justify-center`}>
                    <area.icon size={16} className="text-white" />
                  </div>
                ))}
              </div>
              {priorityAreas.length > 3 && (
                <span className="ml-2 text-xs text-gray-500">+{priorityAreas.length - 3} more</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <CheckCircle className="text-white" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{Object.keys(performance).length - priorityAreas.length}</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Strong Areas</h3>
            <p className="text-sm text-gray-500">Skills you've mastered</p>
            <div className="flex items-center mt-3">
              <Star className="text-yellow-500" size={16} />
              <span className="ml-1 text-sm text-gray-600">Keep practicing!</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <Clock className="text-white" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{currentTimeframe.dailyTime}</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Daily Minutes</h3>
            <p className="text-sm text-gray-500">{currentTimeframe.description}</p>
            <div className="flex items-center mt-3">
              <Calendar className="text-purple-500" size={16} />
              <span className="ml-1 text-sm text-gray-600">{currentTimeframe.name} plan</span>
            </div>
          </div>
        </div>

        {/* Timeline Selection */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Study Timeline</h2>
            <p className="text-gray-600">Select the timeframe that works best for your schedule</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(timeframes).map(([key, timeframe]) => {
              const isSelected = selectedTimeframe === key;
              const colorClasses = getColorClasses(timeframe.color, 'card');
              const buttonClasses = getColorClasses(timeframe.color, 'button');
              
              return (
                <div
                  key={key}
                  onClick={() => setSelectedTimeframe(key)}
                  className={`
                    relative cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl
                    ${isSelected 
                      ? `bg-gradient-to-br ${colorClasses} shadow-xl border-opacity-50` 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute -top-3 -right-3">
                      <div className={`w-8 h-8 ${getColorClasses(timeframe.color, 'accent')} rounded-full flex items-center justify-center shadow-lg`}>
                        <CheckCircle className="text-white" size={20} />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${isSelected ? getColorClasses(timeframe.color, 'icon') : 'bg-gray-100'}`}>
                      <Clock className={isSelected ? '' : 'text-gray-600'} size={32} />
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${isSelected ? getColorClasses(timeframe.color, 'text') : 'text-gray-900'}`}>
                      {timeframe.name}
                    </h3>
                    <div className={`text-3xl font-bold mb-2 ${isSelected ? getColorClasses(timeframe.color, 'text') : 'text-gray-600'}`}>
                      {timeframe.dailyTime} min
                    </div>
                    <p className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-500'} mb-6`}>
                      {timeframe.description}
                    </p>
                    
                    <div className={`px-6 py-2 rounded-full text-sm font-medium ${isSelected ? `text-white ${buttonClasses}` : 'bg-gray-100 text-gray-600'}`}>
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Areas Spotlight */}
        {priorityAreas.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">🎯 Your Focus Areas</h2>
              <p className="text-gray-600">These areas need the most attention in your study plan</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {priorityAreas.slice(0, 3).map(([key, area], index) => {
                const IconComponent = area.icon;
                const priority = index === 0 ? "High Priority" : index === 1 ? "Medium Priority" : "Low Priority";
                const priorityColor = index === 0 ? "red" : index === 1 ? "orange" : "yellow";
                
                return (
                  <div key={key} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${getColorClasses(area.color, 'icon')}`}>
                        <IconComponent size={24} />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{area.percentage}%</div>
                        <div className="text-sm text-gray-500">{area.correct}/{area.total}</div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{area.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{area.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        priorityColor === 'red' ? 'bg-red-100 text-red-700' :
                        priorityColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {priority}
                      </span>
                      <ArrowRight className="text-gray-400" size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Study Sections */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">📚 Detailed Study Guide</h2>
            <p className="text-gray-600">Click on any section to see specific study materials and practice activities</p>
          </div>
          
          <div className="space-y-6">
            {Object.entries(performance).map(([key, area]) => {
              const IconComponent = area.icon;
              const isExpanded = expandedSections[key];
              
              return (
                <div key={key} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${getColorClasses(area.color, 'icon')}`}>
                          <IconComponent size={24} />
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{area.name}</h3>
                          <p className="text-gray-600">{area.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{area.percentage}%</div>
                          <div className="text-sm text-gray-500">{area.correct}/{area.total} correct</div>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                          area.needsWork ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {area.needsWork ? 'Needs Work' : 'Strong'}
                        </div>
                        
                        {isExpanded ? (
                          <ChevronDown className="text-gray-400" size={24} />
                        ) : (
                          <ChevronRight className="text-gray-400" size={24} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <BookOpen size={20} className="text-blue-600" />
                            <span>Study Materials</span>
                          </h4>
                          <div className="space-y-3">
                            {area.studyMaterials.map((material, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">{material}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <PlayCircle size={20} className="text-green-600" />
                            <span>Practice Activities</span>
                          </h4>
                          <div className="space-y-3">
                            {area.practiceActivities.map((activity, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">{activity}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Study Plan */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">📅 Your Daily Study Plan</h2>
            <p className="text-gray-600">Optimized time allocation based on your performance</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <div key={key} className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className={`p-3 rounded-xl ${getColorClasses(area.color, 'icon')}`}>
                        <IconComponent size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{area.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Current: {area.percentage}%</span>
                          <span>•</span>
                          <span>{area.correct}/{area.total} correct</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{timeAllocation} min</div>
                        <div className="text-xs text-gray-500">
                          {area.percentage < 70 ? 'Focus Time' : area.percentage < 85 ? 'Practice' : 'Review'}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6">
              <Zap className="text-blue-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Your personalized study plan is ready! Start with your highest priority areas and watch your scores improve.
            </p>
            <button 
              onClick={() => window.open('https://www.varsitytutors.com/classes/search?f_grades=9th-grade&f_grades=10th-grade&f_grades=11th-grade&f_grades=12th-grade&f_subjects=test-prep', '_blank')}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
            >
              Choose Your Classes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
