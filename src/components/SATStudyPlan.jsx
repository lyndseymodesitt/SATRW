// src/components/SATStudyPlan.jsx
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
        icon: BookOpen,
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
        icon: TrendingUp,
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
        icon: Target,
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
        icon: BookOpen,
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
    "2weeks": { name: "2 Weeks", dailyTime: 90, description: "Intensive prep" },
    "4weeks": { name: "4 Weeks", dailyTime: 60, description: "Balanced approach" },
    "8weeks": { name: "8 Weeks", dailyTime: 45, description: "Gradual improvement" },
  };
  const DEFAULT_TIMEFRAME = "4weeks";
  const currentTimeframe = timeframes[selectedTimeframe] ?? timeframes[DEFAULT_TIMEFRAME];

  // --- Overall stats (actually uses totalQuestions) ---
  const answered = Math.min(totalQuestions, studentAnswers?.length ?? 0);
  const totalCorrect = (studentAnswers || []).filter((a) => a?.isCorrect).length;
  const overallPct = answered ? Math.round((totalCorrect / answered) * 100) : 0;

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  // --- Dev guardrails: find overlaps / gaps once ---
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
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="text-blue-400" size={32} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your SAT Study Plan
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Personalized recommendations based on your practice test performance
        </p>
      </div>

      {/* Timeframe Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-4 text-center">Choose Your Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(timeframes).map(([key, timeframe]) => (
            <button
              key={key}
              onClick={() => setSelectedTimeframe(key)}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedTimeframe === key
                  ? "border-blue-500 bg-gradient-to-br from-blue-600/20 to-blue-800/20 text-blue-300 shadow-lg shadow-blue-500/25"
                  : key === "2weeks"
                  ? "border-red-500 bg-gradient-to-br from-red-600/20 to-red-800/20 text-red-300 hover:border-red-400"
                  : key === "4weeks"
                  ? "border-blue-500 bg-gradient-to-br from-blue-600/20 to-blue-800/20 text-blue-300 hover:border-blue-400"
                  : "border-green-500 bg-gradient-to-br from-green-600/20 to-green-800/20 text-green-300 hover:border-green-400"
              }`}
            >
              <div className="text-xl font-bold mb-2">{timeframe.name}</div>
              <div className="text-lg opacity-90">{timeframe.dailyTime} min/day</div>
              <div className="text-sm opacity-75">{timeframe.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Study Plan Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Study Plan Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl p-6 text-center border border-blue-500/30 shadow-lg">
            <div className="text-3xl font-bold text-blue-300 mb-2">
              {currentTimeframe.dailyTime}
            </div>
            <div className="text-sm text-blue-200">Minutes per day</div>
          </div>

          <div className="bg-gradient-to-br from-teal-600/20 to-teal-800/20 rounded-2xl p-6 text-center border border-teal-500/30 shadow-lg">
            <div className="text-3xl font-bold text-teal-300 mb-2">{overallPct}%</div>
            <div className="text-sm text-teal-200">Overall accuracy</div>
            <div className="text-xs text-teal-300 mt-1">
              {totalCorrect}/{answered} correct
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-6 text-center border border-purple-500/30 shadow-lg">
            <div className="text-3xl font-bold text-purple-300 mb-2">{priorityAreas.length}</div>
            <div className="text-sm text-purple-200">Priority areas</div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-2xl p-6 text-center border border-green-500/30 shadow-lg">
            <div className="text-3xl font-bold text-green-300 mb-2">{Object.keys(performance).length - priorityAreas.length}</div>
            <div className="text-sm text-green-200">Strong areas</div>
          </div>
        </div>
      </div>

      {/* Daily Time Allocation by Skill Area */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Daily Time Allocation by Skill Area</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              const getColorClasses = (color) => {
                switch (color) {
                  case 'blue': return 'from-blue-600/20 to-blue-800/20 border-blue-500/30 text-blue-300';
                  case 'green': return 'from-green-600/20 to-green-800/20 border-green-500/30 text-green-300';
                  case 'purple': return 'from-purple-600/20 to-purple-800/20 border-purple-500/30 text-purple-300';
                  case 'indigo': return 'from-indigo-600/20 to-indigo-800/20 border-indigo-500/30 text-indigo-300';
                  case 'amber': return 'from-amber-600/20 to-amber-800/20 border-amber-500/30 text-amber-300';
                  case 'emerald': return 'from-emerald-600/20 to-emerald-800/20 border-emerald-500/30 text-emerald-300';
                  case 'rose': return 'from-rose-600/20 to-rose-800/20 border-rose-500/30 text-rose-300';
                  default: return 'from-gray-600/20 to-gray-800/20 border-gray-500/30 text-gray-300';
                }
              };

              return (
                <div key={key} className={`bg-gradient-to-br ${getColorClasses(area.color)} rounded-2xl p-6 border shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                        <IconComponent size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-lg">{area.name}</div>
                        <div className="text-sm text-white/80">Current: {area.percentage}% ({area.correct}/{area.total})</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{timeAllocation} min</div>
                      <div className="text-xs text-white/70">
                        {area.percentage < 70 ? 'High Priority' : area.percentage < 85 ? 'Maintenance' : 'Review Only'}
                      </div>
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
          <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Priority Focus Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityAreas.slice(0, 3).map(([key, area]) => (
              <div key={key} className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-2xl p-6 border border-red-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                    <area.icon size={20} className="text-red-400" />
                  </div>
                  <span className="font-semibold text-red-300 text-lg">{area.name}</span>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-200 mb-1">{area.percentage}%</div>
                  <div className="text-sm text-red-300">{area.correct}/{area.total} correct</div>
                  <div className="mt-3 bg-red-700/30 px-3 py-1 rounded-full text-xs text-red-200 font-medium">Needs Work</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Sections */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 text-center">Study Sections</h2>
        {Object.entries(performance).map(([key, area]) => {
          const IconComponent = area.icon;
          const isExpanded = expandedSections[key];
          const getColorClasses = (color) => {
            switch (color) {
              case 'blue': return 'from-blue-600/20 to-blue-800/20 border-blue-500/30';
              case 'green': return 'from-green-600/20 to-green-800/20 border-green-500/30';
              case 'purple': return 'from-purple-600/20 to-purple-800/20 border-purple-500/30';
              case 'indigo': return 'from-indigo-600/20 to-indigo-800/20 border-indigo-500/30';
              case 'amber': return 'from-amber-600/20 to-amber-800/20 border-amber-500/30';
              case 'emerald': return 'from-emerald-600/20 to-emerald-800/20 border-emerald-500/30';
              case 'rose': return 'from-rose-600/20 to-rose-800/20 border-rose-500/30';
              default: return 'from-gray-600/20 to-gray-800/20 border-gray-500/30';
            }
          };

          return (
            <div key={key} className={`bg-gradient-to-br ${getColorClasses(area.color)} rounded-2xl p-6 border shadow-lg transition-all`}>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(key)}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{area.name}</h3>
                    <p className="text-sm text-white/80">{area.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {area.needsWork ? (
                    <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
                      Needs Work
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                      Strong
                    </span>
                  )}
                  <div className="text-2xl font-bold text-white">{area.percentage}%</div>
                  {isExpanded ? (
                    <ChevronDown className="text-white" size={24} />
                  ) : (
                    <ChevronRight className="text-white" size={24} />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <BookOpen size={20} />
                        Study Materials
                      </h4>
                      <ul className="space-y-2">
                        {area.studyMaterials.map((material, index) => (
                          <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                            <span className="text-white/60 mt-1">•</span>
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Target size={20} />
                        Practice Activities
                      </h4>
                      <ul className="space-y-2">
                        {area.practiceActivities.map((activity, index) => (
                          <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                            <span className="text-white/60 mt-1">•</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
