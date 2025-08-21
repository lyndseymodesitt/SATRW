import React from 'react';
import { TrendingUp, Award, Target, AlertTriangle } from 'lucide-react';

const SATScoreReferenceChart = ({ currentScore = null }) => {
  const scoreData = [
    { correct: 66, total: 66, description: "Perfect Score", score: 800, color: "bg-gradient-to-r from-green-500 to-emerald-500", icon: Award },
    { correct: 60, total: 66, description: "High Scorer", score: 730, color: "bg-gradient-to-r from-blue-500 to-cyan-500", icon: TrendingUp },
    { correct: 50, total: 66, description: "Above Average", score: 623, color: "bg-gradient-to-r from-indigo-500 to-purple-500", icon: Target },
    { correct: 40, total: 66, description: "Average", score: 530, color: "bg-gradient-to-r from-yellow-500 to-orange-500", icon: Target },
    { correct: 30, total: 66, description: "Below Average", score: 436, color: "bg-gradient-to-r from-orange-500 to-red-500", icon: AlertTriangle },
    { correct: 20, total: 66, description: "Needs Improvement", score: 355, color: "bg-gradient-to-r from-red-500 to-pink-500", icon: AlertTriangle }
  ];

  const getPercentage = (correct, total) => Math.round((correct / total) * 100);

  const isCurrentScore = (score) => currentScore && Math.abs(currentScore - score) <= 25;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-blue-600" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Score Reference Guide</h3>
      </div>
      
      <div className="space-y-3">
        {scoreData.map((item, index) => {
          const IconComponent = item.icon;
          const isCurrent = isCurrentScore(item.score);
          
          return (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                isCurrent ? 'ring-4 ring-blue-400 ring-opacity-50 transform scale-105' : ''
              }`}
            >
              {/* Background Bar */}
              <div className={`${item.color} p-4 text-white relative`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{item.description}</div>
                      <div className="text-sm opacity-90">
                        {item.correct}/{item.total} correct ({getPercentage(item.correct, item.total)}%)
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold">{item.score}</div>
                    <div className="text-sm opacity-90">SAT Score</div>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20">
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out"
                    style={{ width: `${getPercentage(item.correct, item.total)}%` }}
                  />
                </div>
                
                {/* Current score indicator */}
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                    Your Range
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span><strong>700+:</strong> Competitive for top colleges</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span><strong>600+:</strong> Strong college readiness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span><strong>480+:</strong> College ready baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span><strong>Below 480:</strong> Focus on skill building</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SATScoreReferenceChart;
