import React, { useState } from 'react';
import { TrendingUp, Award, Target, AlertTriangle } from 'lucide-react';

const SATScoreReferenceChart = ({ currentScore = null }) => {
  const [selectedScore, setSelectedScore] = useState(null);

  const scoreData = [
    { correct: 66, total: 66, description: "Perfect", score: 800, color: "from-emerald-400 to-green-500", icon: Award },
    { correct: 60, total: 66, description: "High Scorer", score: 730, color: "from-blue-400 to-cyan-500", icon: TrendingUp },
    { correct: 50, total: 66, description: "Above Average", score: 623, color: "from-purple-400 to-indigo-500", icon: Target },
    { correct: 40, total: 66, description: "Average", score: 530, color: "from-amber-400 to-orange-500", icon: Target },
    { correct: 30, total: 66, description: "Below Average", score: 436, color: "from-orange-400 to-red-500", icon: AlertTriangle },
    { correct: 20, total: 66, description: "Needs Work", score: 355, color: "from-red-400 to-pink-500", icon: AlertTriangle }
  ];

  const getPercentage = (correct, total) => Math.round((correct / total) * 100);
  const isCurrentScore = (score) => currentScore && Math.abs(currentScore - score) <= 25;

  const displayScore = selectedScore || scoreData.find(item => isCurrentScore(item.score)) || scoreData[3];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Score Reference</h3>
            <p className="text-gray-500 text-sm">Click any score to explore</p>
          </div>
        </div>
        
        {currentScore && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 rounded-lg text-white text-sm font-semibold">
            Your Score: {currentScore}
          </div>
        )}
      </div>

      {/* Interactive Score Scale */}
      <div className="mb-6">
        <div className="relative bg-gradient-to-r from-red-100 via-yellow-100 via-blue-100 to-green-100 rounded-full h-4 shadow-inner">
          {/* Score markers */}
          {scoreData.map((item, index) => {
            const position = ((item.score - 200) / 600) * 100;
            const isCurrent = isCurrentScore(item.score);
            const isSelected = selectedScore?.score === item.score;
            
            return (
              <button
                key={index}
                onClick={() => setSelectedScore(item)}
                className={`absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 ${
                  isCurrent || isSelected ? 'scale-125 z-20' : 'scale-100 hover:scale-110 z-10'
                }`}
                style={{ left: `${position}%` }}
              >
                <div className={`w-6 h-6 rounded-full shadow-lg border-2 ${
                  isCurrent ? 'border-blue-500 bg-blue-500' : 'border-white bg-gradient-to-r ' + item.color
                } flex items-center justify-center`}>
                  {isCurrent && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Score label */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className={`bg-white px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    isCurrent || isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}>
                    {item.score}
                  </div>
                </div>
              </button>
            );
          })}
          
          {/* Scale labels */}
          <div className="flex justify-between mt-6 text-xs text-gray-400 px-2">
            <span>200</span>
            <span>400</span>
            <span>600</span>
            <span>800</span>
          </div>
        </div>
      </div>

      {/* Selected Score Details */}
      <div className={`bg-gradient-to-r ${displayScore.color} rounded-2xl p-6 text-white transition-all duration-500`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <displayScore.icon size={28} />
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">{displayScore.score}</div>
              <div className="text-lg font-semibold opacity-90">{displayScore.description}</div>
              <div className="text-sm opacity-75">
                {displayScore.correct}/66 questions correct • {getPercentage(displayScore.correct, displayScore.total)}%
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90 mb-1">College Readiness</div>
              <div className="font-bold">
                {displayScore.score >= 700 ? "Top Colleges" : 
                 displayScore.score >= 600 ? "Strong Readiness" :
                 displayScore.score >= 480 ? "College Ready" : "Skill Building"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-lg font-bold text-emerald-600">700+</div>
          <div className="text-xs text-gray-600">Elite</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-lg font-bold text-blue-600">600+</div>
          <div className="text-xs text-gray-600">Strong</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-lg font-bold text-amber-600">480+</div>
          <div className="text-xs text-gray-600">Ready</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-lg font-bold text-red-600">&lt;480</div>
          <div className="text-xs text-gray-600">Building</div>
        </div>
      </div>
    </div>
  );
};

export default SATScoreReferenceChart;
