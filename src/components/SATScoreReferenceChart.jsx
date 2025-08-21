import React from 'react';
import { TrendingUp, Award, Target, AlertTriangle } from 'lucide-react';

const SATScoreReferenceChart = ({ currentScore = null }) => {
  const scoreData = [
    { correct: 66, total: 66, description: "Perfect", score: 800, color: "from-emerald-400 to-green-500", textColor: "text-emerald-600", icon: Award },
    { correct: 60, total: 66, description: "High Scorer", score: 730, color: "from-blue-400 to-cyan-500", textColor: "text-blue-600", icon: TrendingUp },
    { correct: 50, total: 66, description: "Above Average", score: 623, color: "from-purple-400 to-indigo-500", textColor: "text-purple-600", icon: Target },
    { correct: 40, total: 66, description: "Average", score: 530, color: "from-amber-400 to-orange-500", textColor: "text-amber-600", icon: Target },
    { correct: 30, total: 66, description: "Below Average", score: 436, color: "from-orange-400 to-red-500", textColor: "text-orange-600", icon: AlertTriangle },
    { correct: 20, total: 66, description: "Needs Work", score: 355, color: "from-red-400 to-pink-500", textColor: "text-red-600", icon: AlertTriangle }
  ];

  const getPercentage = (correct, total) => Math.round((correct / total) * 100);
  const isCurrentScore = (score) => currentScore && Math.abs(currentScore - score) <= 25;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Score Reference
            </h3>
            <p className="text-gray-500 text-sm">See where you stand</p>
          </div>
        </div>
        
        {currentScore && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-xl text-white font-bold">
            Your Score: {currentScore}
          </div>
        )}
      </div>

      {/* Horizontal Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {scoreData.map((item, index) => {
          const IconComponent = item.icon;
          const isCurrent = isCurrentScore(item.score);
          
          return (
            <div 
              key={index} 
              className={`group relative bg-gradient-to-br ${item.color} rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                isCurrent ? 'ring-4 ring-blue-400 ring-opacity-60 scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm"></div>
              
              <div className="relative z-10 text-white text-center">
                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full backdrop-blur-sm">
                    <IconComponent size={24} className="text-white" />
                  </div>
                </div>
                
                {/* Score */}
                <div className="text-3xl font-black mb-1 tracking-tight">{item.score}</div>
                
                {/* Description */}
                <div className="text-sm font-semibold mb-2 opacity-90">{item.description}</div>
                
                {/* Questions Correct */}
                <div className="text-xs opacity-75 mb-3">
                  {item.correct}/66 • {getPercentage(item.correct, item.total)}%
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${getPercentage(item.correct, item.total)}%` }}
                  />
                </div>
              </div>
              
              {/* Current Score Indicator */}
              {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-bounce shadow-lg">
                  You're Here!
                </div>
              )}
              
              {/* Glow effect for current score */}
              {isCurrent && (
                <div className="absolute inset-0 rounded-2xl animate-pulse shadow-2xl shadow-blue-400/50"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* College Readiness Scale */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">College Readiness Scale</h4>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-sm"></div>
            <div className="text-sm font-semibold text-gray-700">700+</div>
            <div className="text-xs text-gray-500 leading-tight">Top Colleges</div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-sm"></div>
            <div className="text-sm font-semibold text-gray-700">600+</div>
            <div className="text-xs text-gray-500 leading-tight">Strong Readiness</div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
            <div className="text-sm font-semibold text-gray-700">480+</div>
            <div className="text-xs text-gray-500 leading-tight">College Ready</div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-sm"></div>
            <div className="text-sm font-semibold text-gray-700">Below 480</div>
            <div className="text-xs text-gray-500 leading-tight">Skill Building</div>
          </div>
        </div>
        
        {/* Continuous progress bar */}
        <div className="mt-6 relative">
          <div className="h-3 bg-gradient-to-r from-red-200 via-yellow-200 via-blue-200 to-green-200 rounded-full shadow-inner">
            {currentScore && (
              <div 
                className="absolute top-0 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 transform -translate-y-0.5 transition-all duration-500"
                style={{ left: `${Math.max(0, Math.min(100, ((currentScore - 200) / 600) * 100))}%`, transform: 'translateX(-50%) translateY(-2px)' }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold whitespace-nowrap">
                  {currentScore}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>200</span>
            <span>800</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SATScoreReferenceChart;
