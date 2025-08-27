import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit3, 
  Save, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';

const AuthorMode = ({ questions, onSave, onClose, savedPlace, onResume, onExport, onClearEdits, onImport, onAutoSync, onCheckUpdates, onDeploy, onAutoCommitDeploy, onDirectReplace }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'edit', 'preview'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Question categories for filtering
  const questionCategories = {
    vocabularyInContext: { name: 'Vocabulary in Context', icon: BookOpen, color: 'blue' },
    grammarAndConventions: { name: 'Grammar & Conventions', icon: Target, color: 'green' },
    logicalTransitions: { name: 'Logical Transitions', icon: TrendingUp, color: 'purple' },
    readingComprehension: { name: 'Reading Comprehension', icon: BookOpen, color: 'indigo' },
    evidenceAndData: { name: 'Evidence & Data Analysis', icon: TrendingUp, color: 'amber' },
    researchSynthesis: { name: 'Research Synthesis', icon: Target, color: 'emerald' },
    textComparison: { name: 'Text Comparison', icon: BookOpen, color: 'rose' }
  };

  // Filter and search questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = searchTerm === '' || 
        q.stem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.choices.some(choice => choice.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesModule = filterModule === 'all' || q.module.toString() === filterModule;
      const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      
      return matchesSearch && matchesModule && matchesDifficulty;
    });
  }, [questions, searchTerm, filterModule, filterDifficulty]);

  // Grammar check function
  const checkGrammar = (text) => {
    const issues = [];
    
    // Check for common grammar issues
    if (text.includes('  ')) {
      issues.push({ type: 'spacing', message: 'Double spaces detected', severity: 'warning' });
    }
    
    if (text.includes(' ,')) {
      issues.push({ type: 'punctuation', message: 'Space before comma', severity: 'error' });
    }
    
    if (text.includes(' .')) {
      issues.push({ type: 'punctuation', message: 'Space before period', severity: 'error' });
    }
    
    if (text.includes(' ?')) {
      issues.push({ type: 'punctuation', message: 'Space before question mark', severity: 'error' });
    }
    
    if (text.includes(' !')) {
      issues.push({ type: 'punctuation', message: 'Space before exclamation mark', severity: 'error' });
    }
    
    // Check for potential subject-verb agreement issues
    const subjectVerbPatterns = [
      /(?:^|\s)(\w+)\s+(?:is|are|was|were)\s+/gi,
      /(?:^|\s)(\w+)\s+(?:has|have|had)\s+/gi
    ];
    
    subjectVerbPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const subject = match[1];
        const verb = match[2];
        
        // Simple checks - could be expanded
        if (subject.endsWith('s') && (verb === 'are' || verb === 'have')) {
          issues.push({ 
            type: 'grammar', 
            message: `Potential subject-verb agreement: "${subject}" (singular) with "${verb}" (plural)`, 
            severity: 'warning' 
          });
        }
      }
    });
    
    return issues;
  };

  // Start editing a question
  const startEdit = (question) => {
    setSelectedQuestion(question);
    setEditedQuestion({ ...question });
    setCurrentView('edit');
    setUnsavedChanges(false);
  };

  // Preview a question
  const previewQuestion = (question) => {
    setSelectedQuestion(question);
    setCurrentView('preview');
  };

  // Save changes
  const saveQuestion = () => {
    if (onSave && editedQuestion) {
      onSave(editedQuestion);
      setUnsavedChanges(false);
      setCurrentView('list');
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedQuestion(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  // Handle choice changes
  const handleChoiceChange = (index, value) => {
    setEditedQuestion(prev => ({
      ...prev,
      choices: prev.choices.map((choice, i) => i === index ? value : choice)
    }));
    setUnsavedChanges(true);
  };

  // Add new choice
  const addChoice = () => {
    setEditedQuestion(prev => ({
      ...prev,
      choices: [...prev.choices, '']
    }));
    setUnsavedChanges(true);
  };

  // Remove choice
  const removeChoice = (index) => {
    if (editedQuestion.choices.length > 2) {
      setEditedQuestion(prev => ({
        ...prev,
        choices: prev.choices.filter((_, i) => i !== index)
      }));
      setUnsavedChanges(true);
    }
  };

  // Render question list
  const renderQuestionList = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Modules</option>
            <option value="1">Module 1</option>
            <option value="2">Module 2</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="text-sm text-gray-400">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-400">#{question.id}</span>
                  <span className="text-sm text-gray-400">Module {question.module}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    question.difficulty === 'Easy' ? 'bg-green-900/30 text-green-300' :
                    question.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                <div className="text-gray-200 mb-2 line-clamp-2">
                  {question.stem.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </div>
                <div className="text-sm text-gray-400">
                  Correct: {question.choices[question.correct]}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => previewQuestion(question)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => startEdit(question)}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render question editor
  const renderQuestionEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-200">
          Editing Question #{editedQuestion?.id}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('list')}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveQuestion}
            disabled={!unsavedChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {editedQuestion && (
        <div className="space-y-6">
          {/* Question Stem */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question Stem
            </label>
            <textarea
              value={editedQuestion.stem}
              onChange={(e) => handleInputChange('stem', e.target.value)}
              rows={6}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 resize-y"
              placeholder="Enter the question text..."
            />
            <div className="mt-2">
              {checkGrammar(editedQuestion.stem).map((issue, index) => (
                <div key={index} className={`text-sm flex items-center gap-2 ${
                  issue.severity === 'error' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {issue.severity === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  {issue.message}
                </div>
              ))}
            </div>
          </div>

          {/* Choices */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Answer Choices
            </label>
            <div className="space-y-3">
              {editedQuestion.choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct"
                    checked={editedQuestion.correct === index}
                    onChange={() => handleInputChange('correct', index)}
                    className="text-blue-600"
                  />
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                    placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                  />
                  {editedQuestion.choices.length > 2 && (
                    <button
                      onClick={() => removeChoice(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove choice"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addChoice}
                className="px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Choice
              </button>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Explanation
            </label>
            <textarea
              value={editedQuestion.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 resize-y"
              placeholder="Explain why the correct answer is right..."
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Module
              </label>
              <select
                value={editedQuestion.module}
                onChange={(e) => handleInputChange('module', parseInt(e.target.value))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value={1}>Module 1</option>
                <option value={2}>Module 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={editedQuestion.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render question preview
  const renderQuestionPreview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-200">
          Preview Question #{selectedQuestion?.id}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('list')}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Back to List
          </button>
          <button
            onClick={() => startEdit(selectedQuestion)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Edit3 size={16} />
            Edit Question
          </button>
        </div>
      </div>

      {selectedQuestion && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-400">#{selectedQuestion.id}</span>
              <span className="text-sm text-gray-400">Module {selectedQuestion.module}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedQuestion.difficulty === 'Easy' ? 'bg-green-900/30 text-green-300' :
                selectedQuestion.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                'bg-red-900/30 text-red-300'
              }`}>
                {selectedQuestion.difficulty}
              </span>
            </div>
            
            <div className="text-gray-200 mb-6 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: selectedQuestion.stem }} />
            </div>

            <div className="space-y-3">
              {selectedQuestion.choices.map((choice, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${
                    index === selectedQuestion.correct
                      ? 'border-green-500 bg-green-900/20 text-green-200'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      index === selectedQuestion.correct
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-500 bg-gray-600 text-gray-300'
                    }">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {choice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <h4 className="font-medium text-gray-300 mb-2">Explanation</h4>
            <p className="text-gray-400 leading-relaxed">{selectedQuestion.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Author Mode
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Edit and manage SAT questions with grammar checking and preview
          </p>
          <div className="mt-3 px-4 py-2 bg-amber-600/20 border border-amber-500/30 rounded-lg inline-flex items-center gap-2">
            <span className="text-amber-400 text-sm font-medium">⏸️ Test Paused</span>
            <span className="text-amber-500/70 text-xs">No time pressure while editing</span>
          </div>
          <div className="mt-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm font-medium mb-1">💡 Cross-Computer Usage:</p>
            <p className="text-blue-500/70 text-xs">
              Export your changes on one computer, then import them on any other computer using the Import/Export buttons above.
            </p>
          </div>
          
          {/* Imported Changes Status */}
          <div className="mt-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm font-medium mb-1">📥 Import Status:</p>
            <p className="text-green-500/70 text-xs">
              {questions.length > 0 ? 
                `Loaded ${questions.length} questions (${questions.some(q => q.id && q.stem && q.choices) ? 'including imported changes' : 'original questions'})` : 
                'No questions loaded'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {savedPlace && (
            <button
              onClick={onResume}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              title={`Resume test from Module ${savedPlace.moduleIdx + 1}, Question ${savedPlace.qIndex + 1}`}
            >
              🚀 Resume Test
            </button>
          )}
          <button
            onClick={onExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            title="Export your edited questions"
          >
            📥 Export Changes
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                 title="Import previously exported questions">
            📤 Import Changes
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />
          </label>
          <button
            onClick={onAutoSync}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            title="Auto-sync to cloud storage for cross-device access"
          >
            ☁️ Auto-Sync
          </button>
          <button
            onClick={onCheckUpdates}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            title="Check for cloud updates from other devices"
          >
            🔄 Check Updates
          </button>
          <button
            onClick={onDeploy}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            title="Auto-update questions.json file with all your edits and prepare for deployment"
          >
            📝 Update Questions File
          </button>
          <button
            onClick={onDirectReplace}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            title="Directly replace questions.json with your edited version (clean format)"
          >
            🔄 Direct Replace
          </button>
          <button
            onClick={onAutoCommitDeploy}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            title="Automatically commit and deploy all changes to GitHub Pages"
          >
            🚀 Auto-Deploy
          </button>
          <button
            onClick={onClearEdits}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            title="Clear all saved edits and restore original questions"
          >
            🗑️ Clear Edits
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Exit Author Mode
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setCurrentView('list')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentView === 'list'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          Question List
        </button>
        {currentView === 'edit' && (
          <button
            onClick={() => setCurrentView('preview')}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Preview
          </button>
        )}
      </div>

      {/* Main Content */}
      {currentView === 'list' && renderQuestionList()}
      {currentView === 'edit' && renderQuestionEditor()}
      {currentView === 'preview' && renderQuestionPreview()}

      {/* Unsaved Changes Warning */}
      {unsavedChanges && (
        <div className="fixed bottom-6 right-6 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>You have unsaved changes</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorMode;
