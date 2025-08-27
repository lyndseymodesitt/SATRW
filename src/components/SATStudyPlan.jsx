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

export default function SATStudyPlan({ studentAnswers = [], totalQuestions = 66 }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState("4weeks");

  // Generate sample data if no real data is provided
  const sampleAnswers = useMemo(() => {
    if (studentAnswers.length > 0) return studentAnswers;
    
    // Create realistic sample data with varied performance
    const answers = [];
    const performanceRates = {
      vocabularyInContext: 0.75,
      grammarAndConventions: 0.85,
      logicalTransitions: 0.65,
      readingComprehension: 0.80,
      evidenceAndData: 0.70,
      researchSynthesis: 0.60,
      textComparison: 0.90,
    };
    
    for (let i = 0; i < totalQuestions; i++) {
      let category = 'vocabularyInContext';
      if ([20, 21, 22, 23, 24, 25, 26, 51, 52, 53, 54, 55, 56, 57, 58].includes(i + 1)) {
        category = 'grammarAndConventions';
      } else if ([27, 28, 29, 30, 59, 60, 61, 62].includes(i + 1)) {
        category = 'logicalTransitions';
      } else if ([6, 7, 8, 9, 10, 39, 40, 42, 43, 44].includes(i + 1)) {
        category = 'readingComprehension';
      } else if ([11, 12, 13, 14, 15, 16, 17, 18, 19, 45, 46, 47, 48, 49, 50].includes(i + 1)) {
        category = 'evidenceAndData';
      } else if ([31, 32, 33, 63, 64, 65, 66].includes(i + 1)) {
        category = 'researchSynthesis';
      } else if ([41].includes(i + 1)) {
        category = 'textComparison';
      }
      
      const rate = performanceRates[category];
      answers.push({ isCorrect: Math.random() < rate });
    }
    
    return answers;
  }, [studentAnswers, totalQuestions]);

  // Question classification
  const questionClassification = useMemo(
    () => ({
      vocabularyInContext: {
        name: "Vocabulary in Context",
        icon: BookOpen,
        color: "#3B82F6",
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
        color: "#10B981",
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
        color: "#8B5CF6",
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
        color: "#6366F1",
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
        color: "#F59E0B",
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
        color: "#059669",
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
        color: "#EC4899",
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

  // Performance calculation
  const performance = useMemo(() => {
    const results = {};
    Object.entries(questionClassification).forEach(([key, category]) => {
      const categoryQuestions = category.questions;
      const total = categoryQuestions.length;
      const correct = categoryQuestions.filter((qNum) => {
        const answer = sampleAnswers[qNum - 1];
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
  }, [sampleAnswers, questionClassification]);

  const priorityAreas = useMemo(
    () =>
      Object.entries(performance)
        .filter(([, d]) => d.needsWork)
        .sort((a, b) => a[1].percentage - b[1].percentage),
    [performance]
  );

  // Timeframes
  const timeframes = {
    "2weeks": { name: "2 Weeks", dailyTime: 90, description: "Intensive prep", color: "#EF4444" },
    "4weeks": { name: "4 Weeks", dailyTime: 60, description: "Balanced approach", color: "#3B82F6" },
    "8weeks": { name: "8 Weeks", dailyTime: 45, description: "Gradual improvement", color: "#10B981" },
  };
  
  const currentTimeframe = timeframes[selectedTimeframe] ?? timeframes["4weeks"];

  // Overall stats
  const answered = Math.min(totalQuestions, sampleAnswers?.length ?? 0);
  const totalCorrect = (sampleAnswers || []).filter((a) => a?.isCorrect).length;
  const overallPct = answered ? Math.round((totalCorrect / answered) * 100) : 0;

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  // Inline styles for guaranteed rendering
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8eaf6 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    heroIcon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem auto',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #1f2937 0%, #3B82F6 50%, #8B5CF6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textAlign: 'center',
      marginBottom: '1rem'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#6b7280',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
    },
    grid: {
      display: 'grid',
      gap: '1rem',
      marginBottom: '3rem'
    },
    gridCols4: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      maxWidth: '800px',
      margin: '0 auto'
    },
    gridCols3: {
      gridTemplateColumns: 'repeat(3, 1fr)',
      maxWidth: '900px',
      margin: '0 auto'
    },
    gridCols2: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
    },
    sectionTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: '0.75rem'
    },
    sectionSubtitle: {
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '2rem'
    },
    iconContainer: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '0.75rem'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
      borderRadius: '4px',
      transition: 'width 0.5s ease'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={styles.heroIcon}>
            <Award color="white" size={40} />
          </div>
          <h1 style={styles.heroTitle}>
            Your Personalized SAT Study Plan
          </h1>
          <p style={styles.heroSubtitle}>
            Transform your SAT performance with AI-powered insights and personalized recommendations
          </p>
        </div>

        {/* Quick Stats Hero Cards */}
        <div style={{ ...styles.grid, ...styles.gridCols4, marginBottom: '4rem' }}>
          <div style={{ ...styles.card, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ ...styles.iconContainer, width: '40px', height: '40px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white' }}>
                <BarChart3 size={20} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{overallPct}%</span>
            </div>
            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Overall Score</h3>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{totalCorrect}/{answered} questions correct</p>
            <div style={{ ...styles.progressBar, height: '6px', marginTop: '0.5rem' }}>
              <div style={{ ...styles.progressFill, width: `${overallPct}%` }}></div>
            </div>
          </div>

          <div style={{ ...styles.card, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ ...styles.iconContainer, width: '40px', height: '40px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white' }}>
                <AlertCircle size={20} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{priorityAreas.length}</span>
            </div>
            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Focus Areas</h3>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Areas needing improvement</p>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '-4px' }}>
                {priorityAreas.slice(0, 3).map(([key, area], index) => (
                  <div key={key} style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid white',
                    backgroundColor: area.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: index > 0 ? '-6px' : '0'
                  }}>
                    <area.icon size={12} color="white" />
                  </div>
                ))}
              </div>
              {priorityAreas.length > 3 && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  +{priorityAreas.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div style={{ ...styles.card, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ ...styles.iconContainer, width: '40px', height: '40px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
                <CheckCircle size={20} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {Object.keys(performance).length - priorityAreas.length}
              </span>
            </div>
            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Strong Areas</h3>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Skills you've mastered</p>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
              <Star color="#F59E0B" size={14} />
              <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', color: '#4b5563' }}>Keep practicing!</span>
            </div>
          </div>

          <div style={{ ...styles.card, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ ...styles.iconContainer, width: '40px', height: '40px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white' }}>
                <Clock size={20} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{currentTimeframe.dailyTime}</span>
            </div>
            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Daily Minutes</h3>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{currentTimeframe.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
              <Calendar color="#8B5CF6" size={14} />
              <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem', color: '#4b5563' }}>{currentTimeframe.name} plan</span>
            </div>
          </div>
        </div>

        {/* Timeline Selection */}
        <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={styles.sectionTitle}>Choose Your Study Timeline</h2>
            <p style={styles.sectionSubtitle}>Select the timeframe that works best for your schedule</p>
          </div>
          
          <div style={{ ...styles.grid, ...styles.gridCols3 }}>
            {Object.entries(timeframes).map(([key, timeframe]) => {
              const isSelected = selectedTimeframe === key;
              
              return (
                <div
                  key={key}
                  onClick={() => setSelectedTimeframe(key)}
                  style={{
                    ...styles.card,
                    position: 'relative',
                    textAlign: 'center',
                    padding: '1rem',
                    background: isSelected ? `linear-gradient(135deg, ${timeframe.color}15 0%, ${timeframe.color}25 100%)` : 'white',
                    border: isSelected ? `2px solid ${timeframe.color}` : '1px solid #e5e7eb',
                    transform: isSelected ? 'translateY(-4px)' : 'none',
                    boxShadow: isSelected ? `0 10px 15px ${timeframe.color}25` : '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '-12px',
                      width: '32px',
                      height: '32px',
                      backgroundColor: timeframe.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      <CheckCircle color="white" size={20} />
                    </div>
                  )}
                  
                  <div style={{
                    ...styles.iconContainer,
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    margin: '0 auto 0.75rem auto',
                    backgroundColor: isSelected ? timeframe.color + '20' : '#f3f4f6'
                  }}>
                    <Clock color={isSelected ? timeframe.color : '#6b7280'} size={24} />
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem', color: isSelected ? timeframe.color : '#1f2937' }}>
                    {timeframe.name}
                  </h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: isSelected ? timeframe.color : '#4b5563' }}>
                    {timeframe.dailyTime} min
                  </div>
                  <p style={{ fontSize: '0.75rem', color: isSelected ? '#374151' : '#6b7280', marginBottom: '1rem' }}>
                    {timeframe.description}
                  </p>
                  
                  <div style={{
                    padding: '0.375rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: isSelected ? timeframe.color : '#f3f4f6',
                    color: isSelected ? 'white' : '#6b7280',
                    display: 'inline-block'
                  }}>
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Areas Spotlight */}
        {priorityAreas.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={styles.sectionTitle}>🎯 Your Focus Areas</h2>
              <p style={styles.sectionSubtitle}>These areas need the most attention in your study plan</p>
            </div>
            
            <div style={{ ...styles.grid, ...styles.gridCols3 }}>
              {priorityAreas.slice(0, 3).map(([key, area], index) => {
                const IconComponent = area.icon;
                const priority = index === 0 ? "High Priority" : index === 1 ? "Medium Priority" : "Low Priority";
                const priorityColors = ['#EF4444', '#F97316', '#EAB308'];
                
                return (
                  <div key={key} style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ ...styles.iconContainer, backgroundColor: area.color + '20', color: area.color }}>
                        <IconComponent size={24} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{area.percentage}%</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{area.correct}/{area.total}</div>
                      </div>
                    </div>
                    
                    <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>{area.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>{area.description}</p>
                    
                                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '25px',
                         fontSize: '0.75rem',
                         fontWeight: '500',
                         backgroundColor: priorityColors[index] + '20',
                         color: priorityColors[index]
                       }}>
                         {priority}
                       </span>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Study Sections */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={styles.sectionTitle}>📚 Detailed Study Guide</h2>
            <p style={styles.sectionSubtitle}>Click on any section to see specific study materials and practice activities</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(performance).map(([key, area]) => {
              const IconComponent = area.icon;
              const isExpanded = expandedSections[key];
              
              return (
                <div key={key} style={{ ...styles.card, overflow: 'hidden' }}>
                  <div 
                    style={{ cursor: 'pointer', padding: '1.5rem' }}
                    onClick={() => toggleSection(key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ ...styles.iconContainer, backgroundColor: area.color + '20', color: area.color }}>
                          <IconComponent size={24} />
                        </div>
                        
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>{area.name}</h3>
                          <p style={{ color: '#4b5563', margin: 0 }}>{area.description}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{area.percentage}%</div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{area.correct}/{area.total} correct</div>
                        </div>
                        
                        <div style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '25px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: area.needsWork ? '#FEE2E2' : '#D1FAE5',
                          color: area.needsWork ? '#DC2626' : '#065F46'
                        }}>
                          {area.needsWork ? 'Needs Work' : 'Strong'}
                        </div>
                        
                        {isExpanded ? (
                          <ChevronDown color="#9ca3af" size={24} />
                        ) : (
                          <ChevronRight color="#9ca3af" size={24} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb', padding: '1.5rem' }}>
                      <div style={{ ...styles.grid, ...styles.gridCols2 }}>
                        <div>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen color="#3B82F6" size={20} />
                            <span>Study Materials</span>
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {area.studyMaterials.map((material, index) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#3B82F6', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                                <p style={{ color: '#374151', margin: 0 }}>{material}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PlayCircle color="#10B981" size={20} />
                            <span>Practice Activities</span>
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {area.practiceActivities.map((activity, index) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                                <p style={{ color: '#374151', margin: 0 }}>{activity}</p>
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
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={styles.sectionTitle}>📅 Your Daily Study Plan</h2>
            <p style={styles.sectionSubtitle}>Optimized time allocation based on your performance</p>
          </div>
          
          <div style={styles.card}>
            <div style={{ ...styles.grid, ...styles.gridCols2 }}>
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
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                      <div style={{ ...styles.iconContainer, backgroundColor: area.color + '20', color: area.color }}>
                        <IconComponent size={24} />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 0.25rem 0' }}>{area.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                          <span>Current: {area.percentage}%</span>
                          <span>•</span>
                          <span>{area.correct}/{area.total} correct</span>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>{timeAllocation} min</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', borderRadius: '16px', padding: '2rem', boxShadow: '0 20px 25px rgba(59, 130, 246, 0.3)' }}>
            <div style={{ ...styles.iconContainer, width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '16px', margin: '0 auto 1.5rem auto' }}>
              <Zap color="#3B82F6" size={32} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Ready to Start Your Journey?</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
              Your personalized study plan is ready! Start with your highest priority areas and watch your scores improve.
            </p>
            <button 
              onClick={() => window.open('https://www.varsitytutors.com/classes/search?f_grades=9th-grade&f_grades=10th-grade&f_grades=11th-grade&f_grades=12th-grade&f_subjects=test-prep', '_blank')}
              style={{
                backgroundColor: 'white',
                color: '#3B82F6',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              Choose Your Classes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
