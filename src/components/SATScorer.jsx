import React from 'react';
import { TrendingUp, Award, Target, AlertTriangle, BookOpen } from 'lucide-react';

const SATReadingWritingScorer = ({ score = 530, rawScore = 40, percentageCorrect = 60.6 }) => {
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

  const scoreLevel = getScoreLevel(score);
  const ScoreIcon = scoreLevel.icon;

  // College readiness scale data
  const readinessLevels = [
    { 
      range: "700+", 
      level: "Elite", 
      color: "bg-gradient-to-r from-emerald-400 to-green-500",
      textColor: "text-emerald-400",
      description: "Top colleges"
    },
    { 
      range: "600+", 
      level: "Strong", 
      color: "bg-gradient-to-r from-blue-400 to-cyan-500",
      textColor: "text-blue-400",
      description: "Well prepared"
    },
    { 
      range: "480+", 
      level: "Ready", 
      color: "bg-gradient-to-r from-amber-400 to-orange-500",
      textColor: "text-amber-400",
      description: "College ready"
    },
    { 
      range: "<480", 
      level: "Building", 
      color: "bg-gradient-to-r from-red-400 to-pink-500",
      textColor: "text-red-400",
      description: "Skill building"
    }
  ];

  const getCurrentLevelIndex = (score) => {
    if (score >= 700) return 0;
    if (score >= 600) return 1;
    if (score >= 480) return 2;
    return 3;
  };

  const currentLevelIndex = getCurrentLevelIndex(score);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900">
      {/* Score Display */}
      <div className={`bg-gradient-to-br ${scoreLevel.color} rounded-3xl p-8 text-white mb-8 shadow-2xl`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ScoreIcon size={32} />
            <span className="text-2xl font-semibold">{scoreLevel.level}</span>
          </div>
          
          <div className="mb-6">
            <div className="text-7xl font-black mb-2">{score}</div>
            <div className="text-xl opacity-90">SAT Reading & Writing Score</div>
            <div className="text-lg opacity-75 mt-2">{getPercentile(score)} percentile</div>
          </div>
          
          <div className="flex justify-center gap-8">
            <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">{rawScore}/66</div>
              <div className="text-sm opacity-75">Questions Correct</div>
            </div>
            <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">{percentageCorrect}%</div>
              <div className="text-sm opacity-75">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* College Readiness Scale */}
      <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-3xl p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BookOpen className="text-blue-400" size={24} />
          <h2 className="text-2xl font-bold text-white">College Readiness Scale</h2>
        </div>

        {/* Visual Scale */}
        <div className="relative mb-8">
          {/* Background track */}
          <div className="h-6 bg-gradient-to-r from-red-200 via-amber-200 via-blue-200 to-emerald-200 rounded-full shadow-inner"></div>
          
          {/* Score indicator */}
          <div 
            className="absolute top-0 w-8 h-8 bg-white rounded-full shadow-xl border-4 border-blue-500 transform -translate-y-1 transition-all duration-500 flex items-center justify-center"
            style={{ 
              left: `${Math.max(2, Math.min(94, ((score - 200) / 600) * 100))}%`,
              transform: 'translateX(-50%) translateY(-4px)'
            }}
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Score labels */}
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <span>200</span>
            <span>400</span>
            <span>600</span>
            <span>800</span>
          </div>
        </div>

        {/* Readiness Levels */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {readinessLevels.map((level, index) => (
            <div 
              key={index}
              className={`relative p-6 rounded-2xl transition-all duration-300 ${
                index === currentLevelIndex
                  ? 'ring-4 ring-blue-400/50 shadow-2xl transform scale-105'
                  : 'hover:scale-105'
              }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 ${level.color} rounded-2xl opacity-20`}></div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Level indicator */}
                <div className={`inline-flex items-center justify-center w-16 h-16 ${level.color} rounded-2xl mb-4 text-white font-bold text-lg shadow-lg`}>
                  {level.range.replace('+', '').replace('<', '')}
                </div>
                
                {/* Level name */}
                <div className={`text-xl font-bold mb-2 ${level.textColor}`}>
                  {level.level}
                </div>
                
                {/* Score range */}
                <div className="text-gray-400 font-medium mb-2">
                  {level.range}
                </div>
                
                {/* Description */}
                <div className="text-sm text-gray-500">
                  {level.description}
                </div>
                
                {/* Current indicator */}
                {index === currentLevelIndex && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-bounce">
                    You're Here!
                  </div>
                )}
              </div>
              
              {/* Glow effect for current level */}
              {index === currentLevelIndex && (
                <div className="absolute inset-0 rounded-2xl animate-pulse shadow-xl shadow-blue-400/30"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom description */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Your score places you in the <span className={scoreLevel.textColor || 'text-white'}>{scoreLevel.level}</span> category. {scoreLevel.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SATReadingWritingScorer;
