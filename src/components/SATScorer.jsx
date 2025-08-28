import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, AlertTriangle, BookOpen } from 'lucide-react';

const SATReadingWritingScorer = ({ score = 530, rawScore = 40, percentageCorrect = 60.6 }) => {
  console.log('SATScorer component rendering with score:', score);
  
  const [interactiveScore, setInteractiveScore] = useState(score);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScore, setDragStartScore] = useState(0);

  const getPercentile = (score) => {
    if (score >= 750) return '99th';
    if (score >= 700) return '95th';
    if (score >= 650) return '88th';
    if (score >= 600) return '78th';
    if (score >= 550) return '65th';
    if (score >= 500) return '50th';
    if (score >= 450) return '35th';
    if (score >= 400) return '20th';
    return '< 20th';
  };

  const getScoreLevel = (score) => {
    if (score >= 700) return { 
      level: "Elite", 
      color: "from-emerald-500 to-green-600", 
      icon: Award,
      description: "Top colleges ready"
    };
    if (score >= 600) return { 
      level: "Strong", 
      color: "from-blue-500 to-cyan-600", 
      icon: TrendingUp,
      description: "Well prepared"
    };
    if (score >= 480) return { 
      level: "Ready", 
      color: "from-amber-500 to-orange-600", 
      icon: Target,
      description: "College ready"
    };
    return { 
      level: "Building", 
      color: "from-red-500 to-pink-600", 
      icon: AlertTriangle,
      description: "Skill building needed"
    };
  };

  const scoreLevel = getScoreLevel(interactiveScore);
  const ScoreIcon = scoreLevel.icon;

  // College readiness scale data - dynamically filtered based on user's score
  const getRelevantReadinessLevels = (userScore) => {
    const allLevels = [
      { 
        range: "700+", 
        level: "Elite", 
        color: "bg-gradient-to-r from-emerald-400 to-green-500",
        textColor: "text-emerald-400",
        description: "Top colleges",
        minScore: 700
      },
      { 
        range: "600+", 
        level: "Strong", 
        color: "bg-gradient-to-r from-blue-400 to-cyan-500",
        textColor: "text-blue-400",
        description: "Well prepared",
        minScore: 600
      },
      { 
        range: "480+", 
        level: "Ready", 
        color: "bg-gradient-to-r from-amber-400 to-orange-500",
        textColor: "text-amber-400",
        description: "College ready",
        minScore: 480
      },
      { 
        range: "<480", 
        level: "Building", 
        color: "bg-gradient-to-r from-red-400 to-pink-500",
        textColor: "text-red-400",
        description: "Skill building needed",
        minScore: 0
      }
    ];

    // For very low scores (below 480), show Building level
    if (userScore < 480) {
      return [allLevels[3]]; // Show only Building level
    }
    
    // For higher scores, show user's level and next level up
    const userLevelIndex = allLevels.findIndex(level => userScore >= level.minScore);
    if (userLevelIndex === -1) {
      return [allLevels[3]]; // Default to Building
    }
    
    // Show user's level and next level up (if available)
    const relevantLevels = allLevels.slice(userLevelIndex, Math.min(userLevelIndex + 2, allLevels.length));
    
    // If user is at Elite level, also show Strong for context
    if (userLevelIndex === 0) {
      relevantLevels.push(allLevels[1]);
    }
    
    return relevantLevels;
  };

  // Get only the single level that corresponds to the current interactive score
  const getInteractiveReadinessLevel = (score) => {
    const allLevels = [
      { 
        range: "700+", 
        level: "Elite", 
        color: "bg-gradient-to-r from-emerald-400 to-green-500",
        textColor: "text-emerald-400",
        description: "Top colleges",
        minScore: 700
      },
      { 
        range: "600+", 
        level: "Strong", 
        color: "bg-gradient-to-r from-blue-400 to-cyan-500",
        textColor: "text-blue-400",
        description: "Well prepared",
        minScore: 600
      },
      { 
        range: "480+", 
        level: "Ready", 
        color: "bg-gradient-to-r from-amber-400 to-orange-500",
        textColor: "text-amber-400",
        description: "College ready",
        minScore: 480
      },
      { 
        range: "<480", 
        level: "Building", 
        color: "bg-gradient-to-r from-red-400 to-pink-500",
        textColor: "text-red-400",
        description: "Skill building needed",
        minScore: 0
      }
    ];

    if (score >= 700) return [allLevels[0]];
    if (score >= 600) return [allLevels[1]];
    if (score >= 480) return [allLevels[2]];
    return [allLevels[3]];
  };

  // Use interactive levels for the display (single level based on slider position)
  const readinessLevels = getInteractiveReadinessLevel(interactiveScore);

  const getCurrentLevelIndex = (score) => {
    if (score >= 700) return 0;
    if (score >= 600) return 1;
    if (score >= 480) return 2;
    return 0; // For scores below 480, return 0 since we only show 1 level (Building)
  };

  // Find the index of the user's actual score level within the filtered readinessLevels
  const getActualScoreLevelIndex = (userScore) => {
    const userLevel = getRelevantReadinessLevels(userScore).find(level => {
      if (userScore >= 700) return level.minScore === 700;
      if (userScore >= 600) return level.minScore === 600;
      if (userScore >= 480) return level.minScore === 480;
      return level.minScore === 0; // Building level
    });
    
    return readinessLevels.findIndex(level => level.minScore === userLevel?.minScore);
  };

  const currentLevelIndex = getCurrentLevelIndex(interactiveScore);
  const actualScoreLevelIndex = getActualScoreLevelIndex(score);

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e) => {
    console.log('handleMouseDown function called!');
    e.preventDefault();
    console.log('Mouse down - starting drag');
    setIsDragging(true);
    setDragStartScore(interactiveScore);
  };

  const handleMouseMove = React.useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    console.log('Mouse move - dragging');
    
    // Get the scale container element
    const scaleContainer = document.querySelector('.scale-container');
    if (!scaleContainer) {
      console.log('No scale container found');
      return;
    }
    
    const rect = scaleContainer.getBoundingClientRect();
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const relativeX = currentX - rect.left;
    
    console.log('Mouse position:', { currentX, relativeX, rectLeft: rect.left, scaleWidth: rect.width });
    
    // Calculate score based on position within the scale
    const scaleWidth = rect.width - 48; // Account for padding
    const scorePosition = Math.max(0, Math.min(scaleWidth, relativeX));
    const newScore = Math.round(200 + (scorePosition / scaleWidth) * 600);
    
    console.log('Score calculation:', { scaleWidth, scorePosition, newScore });
    
    setInteractiveScore(Math.max(200, Math.min(800, newScore)));
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset to actual score when component updates
  useEffect(() => {
    setInteractiveScore(score);
  }, [score]);

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate position for the score indicator
  const getIndicatorPosition = (score) => {
    return Math.max(2, Math.min(94, ((score - 200) / 600) * 100));
  };

  return (
    <div className="app">
      <div className="card">
        {/* Score Display Section */}
        <div className="scorer-section">
          <div className="section-header">
            <h3>🎯 Detailed Scoring Analysis</h3>
            <p>Get your scaled score and performance breakdown</p>
          </div>
          
          <div className="score-display" style={{
            background: `linear-gradient(135deg, ${scoreLevel.color.includes('emerald') ? '#10b981' : 
                                                   scoreLevel.color.includes('blue') ? '#3b82f6' : 
                                                   scoreLevel.color.includes('amber') ? '#f59e0b' : '#ef4444'}, 
                                                   ${scoreLevel.color.includes('emerald') ? '#059669' : 
                                                   scoreLevel.color.includes('blue') ? '#1d4ed8' : 
                                                   scoreLevel.color.includes('amber') ? '#d97706' : '#dc2626'})`,
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '32px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background elements */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '128px',
              height: '128px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              transform: 'translate(-64px, -64px)'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '96px',
              height: '96px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              transform: 'translate(48px, 48px)'
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <ScoreIcon size={32} />
                </div>
                <span style={{ fontSize: '24px', fontWeight: 600 }}>{scoreLevel.level}</span>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '72px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.025em' }}>{interactiveScore}</div>
                <div style={{ fontSize: '20px', opacity: 0.9 }}>SAT Reading & Writing Score</div>
                <div style={{ fontSize: '18px', opacity: 0.75, marginTop: '8px' }}>{getPercentile(interactiveScore)} percentile</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <div style={{
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{rawScore}/66</div>
                  <div style={{ fontSize: '14px', opacity: 0.75 }}>Questions Correct</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{percentageCorrect}%</div>
                  <div style={{ fontSize: '14px', opacity: 0.75 }}>Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* College Readiness Scale Section */}
        <div className="scorer-section">
          <div className="section-header">
            <h3>📚 College Readiness Scale</h3>
            <p>See where you stand and what's next</p>
          </div>
          
          {/* Visual Scale */}
          <div className="scale-container" style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
          }}>
            <div style={{ position: 'relative' }}>
              {/* Background track */}
              <div style={{
                height: '24px',
                background: 'linear-gradient(to right, #fecaca, #fed7aa, #bfdbfe, #bbf7d0)',
                borderRadius: '12px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(156, 163, 175, 0.2)'
              }}></div>
              
              {/* Score indicator */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  border: '4px solid #3b82f6',
                  transform: 'translateY(-4px)',
                  left: `${getIndicatorPosition(interactiveScore)}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: isDragging ? 'none' : 'left 0.5s ease',
                  cursor: 'grab',
                  userSelect: 'none'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onClick={() => console.log('Indicator clicked!')}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  animation: isDragging ? 'none' : 'pulse 2s infinite'
                }}></div>
              </div>
              
              {/* Interactive instructions */}
              <div style={{
                textAlign: 'center',
                marginTop: '16px',
                fontSize: '12px',
                color: 'var(--muted)',
                fontStyle: 'italic'
              }}>
                {interactiveScore !== score ? (
                  <div>
                    <span>Exploring: {interactiveScore} • </span>
                    <button 
                      onClick={() => setInteractiveScore(score)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Reset to your score ({score})
                    </button>
                  </div>
                ) : (
                  <span>Drag the indicator to explore different scores</span>
                )}
              </div>
              
              {/* Score labels */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '16px',
                fontSize: '12px',
                color: 'var(--muted)'
              }}>
                <span>200</span>
                <span>400</span>
                <span>600</span>
                <span>800</span>
              </div>
            </div>
          </div>

          {/* Readiness Levels */}
          <div className="readiness-levels" style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
          }}>
                                    <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: '24px',
                          maxWidth: '400px',
                          margin: '0 auto'
                        }}>
              {readinessLevels.map((level, index) => (
                <div 
                  key={index}
                  style={{
                    position: 'relative',
                    padding: '24px',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    background: index === currentLevelIndex ? 
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))' : 
                      'var(--card)',
                    border: index === currentLevelIndex ? 
                      '2px solid rgba(59, 130, 246, 0.5)' : 
                      '1px solid var(--border)',
                    transform: index === currentLevelIndex ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: index === currentLevelIndex ? 
                      '0 20px 40px rgba(59, 130, 246, 0.3)' : 
                      '0 8px 24px rgba(0,0,0,0.18)'
                  }}
                >
                  {/* Level indicator */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    background: level.color.includes('emerald') ? '#10b981' : 
                               level.color.includes('blue') ? '#3b82f6' : 
                               level.color.includes('amber') ? '#f59e0b' : '#ef4444',
                    borderRadius: '16px',
                    marginBottom: '16px',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    {level.range.replace('+', '').replace('<', '')}
                  </div>
                  
                  {/* Level name */}
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: level.textColor.includes('emerald') ? '#10b981' : 
                           level.textColor.includes('blue') ? '#3b82f6' : 
                           level.textColor.includes('amber') ? '#f59e0b' : '#ef4444'
                  }}>
                    {level.level}
                  </div>
                  
                  {/* Score range */}
                  <div style={{
                    color: 'var(--muted)',
                    fontWeight: 500,
                    marginBottom: '8px'
                  }}>
                    {level.range}
                  </div>
                  
                  {/* Description */}
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--muted)'
                  }}>
                    {level.description}
                  </div>
                  
                  {/* Current indicator */}
                  {(() => {
                    // Check if this level corresponds to the user's actual score
                    let isUserLevel = false;
                    if (score >= 700 && level.minScore === 700) isUserLevel = true;
                    else if (score >= 600 && score < 700 && level.minScore === 600) isUserLevel = true;
                    else if (score >= 480 && score < 600 && level.minScore === 480) isUserLevel = true;
                    else if (score < 480 && level.minScore === 0) isUserLevel = true;
                    
                    return isUserLevel ? (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: 'white',
                        fontSize: '12px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 700,
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        animation: 'bounce 1s infinite'
                      }}>
                        You're Here!
                      </div>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom description */}
          <div style={{
            marginTop: '32px',
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2), rgba(147, 51, 234, 0.2))',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text)' }}>
              Your score places you in the <span style={{
                color: scoreLevel.color.includes('emerald') ? '#10b981' : 
                       scoreLevel.color.includes('blue') ? '#3b82f6' : 
                       scoreLevel.color.includes('amber') ? '#f59e0b' : '#ef4444',
                fontWeight: 600
              }}>{scoreLevel.level}</span> category. {scoreLevel.description}
            </p>
            <p style={{ color: 'var(--text)', marginTop: '12px', fontSize: '14px', opacity: 0.8 }}>
              Please see your study plan for details on where to focus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SATReadingWritingScorer;
