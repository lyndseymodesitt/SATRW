import { useEffect, useMemo, useState } from "react";
import MarkdownMath from "./components/MarkdownMath";
import ChartRenderer from "./components/ChartRenderer.jsx";
import QuestionText from "./components/QuestionText.jsx";
import SATReadingWritingScorer from "./components/SATScorer.jsx";
import SATStudyPlan from "./components/SATStudyPlan.jsx";
import AuthorMode from "./components/AuthorMode.jsx";


// Process blanks in text for rendering (converts \_, \\_, ____ to styled spans)
function renderableBlanks(s) {
  let t = String(s ?? "");

  // (a) Backslashes before underscore (one to many), not mid-word
  t = t.replace(
    /(^|[^A-Za-z0-9$])\\{1,8}_(?=$|[^A-Za-z0-9])/g,
    '$1<span class="blank"></span>'
  );

  // (b) Runs of underscores immediately followed by a letter: "__word" → "<span class=blank"></span> word"
  t = t.replace(
    /(^|[^A-Za-z0-9$])_{2,}([A-Za-z])/g,
    '$1<span class="blank"></span> $2'
  );

  // (c) Runs of underscores followed by space/punct/end
  t = t.replace(
    /(^|[^A-Za-z0-9$])_{2,}(?=$|[^A-Za-z0-9])/g,
    '$1<span class="blank"></span>'
  );

  return t;
}

// More aggressive blank detection for complex cases
function renderableBlanksAggressive(s) {
  let t = String(s ?? "");
  
  // First, handle any remaining unprocessed underscores
  t = t.replace(/(^|[^A-Za-z0-9$])\\{1,8}_(?=$|[^A-Za-z0-9])/g, '$1<span class="blank"></span>')
       .replace(/(^|[^A-Za-z0-9$])_{2,}([A-Za-z])/g, '$1<span class="blank"></span> $2')
       .replace(/(^|[^A-Za-z0-9$])_{2,}(?=$|[^A-Za-z0-9])/g, '$1<span class="blank"></span>');
  
  // Also handle any remaining single underscores that might be blanks
  t = t.replace(/(^|[^A-Za-z0-9$])_(?=$|[^A-Za-z0-9])/g, '$1<span class="blank"></span>');
  
  return t;
}

// Comprehensive text sanitization for rendering
function sanitizeForRender(s) {
  return renderableBlanksAggressive(String(s ?? ""));
}

function useQuestions() {
  const [data, setData] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/questions.json?v=${__BUILD_ID__}`;
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load questions.json (${r.status})`);
        return r.json();
      })
      .then(setData)
      .catch(setErr)
      .finally(() => setLoading(false));
  }, []);

  return { data, err, loading };
}

const MODULE_SECONDS = 32 * 60; // 32 minutes per module
const BREAK_SECONDS = 30;

const PHASES = {
  INTRO: "intro",
  MODULE: "module",
  BREAK: "break",
  SUMMARY: "summary",
  REVIEW: "review",
  STUDY_PLAN: "study_plan",
};

const letters = ["A", "B", "C", "D"];
const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.max(0, s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function App() {
  const { data: questionsData, err: loadErr, loading } = useQuestions();
  
  // Coach-y taglines
  const TAGLINES = [
    "Trust your skills.",
    "We're cheering for you.",
    "You've got this.",
    "One question at a time.",
    "Small wins add up.",
    "Believe in your test prep.",
    "We keep time; you shine.",
    "You know this."
  ];

  // Pick one per load (random)
  const useTagline = () =>
    useMemo(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)], []);
  
  const tagline = useTagline();
  
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [moduleIdx, setModuleIdx] = useState(0); // 0 -> Module 1, 1 -> Module 2
  const [moduleTimeLeft, setModuleTimeLeft] = useState(MODULE_SECONDS);
  const [breakLeft, setBreakLeft] = useState(BREAK_SECONDS);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: choiceIndex }
  const [flagged, setFlagged] = useState({}); // { [questionId]: true }
  
  // Author mode state
  const [showAuthorMode, setShowAuthorMode] = useState(false);
  const [questions, setQuestions] = useState([]);
  
  // Save place functionality
  const [savedPlace, setSavedPlace] = useState(null);
  const [showSavePlaceModal, setShowSavePlaceModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // REVIEW mode UI state
  const [reviewFilter, setReviewFilter] = useState("all"); // all | incorrect | flagged
  const [reviewIndex, setReviewIndex] = useState(0);

  // Group questions by module; keep order from your file.
  const modules = useMemo(() => {
    const m1 = questions.filter((q) => Number(q.module) === 1);
    const m2 = questions.filter((q) => Number(q.module) === 2);
    return [m1, m2];
  }, [questions]);

  // Update local questions when questionsData changes
  useEffect(() => {
    if (questionsData.length > 0) {
      // Check for saved edits in localStorage
      try {
        const savedEdits = localStorage.getItem('sat-questions-edits');
        if (savedEdits) {
          const parsedEdits = JSON.parse(savedEdits);
          console.log('Found saved edits in localStorage:', parsedEdits.length, 'questions');
          
          // Merge saved edits with original data
          const mergedQuestions = questionsData.map(originalQ => {
            const savedQ = parsedEdits.find(saved => saved.id === originalQ.id);
            return savedQ || originalQ;
          });
          
          setQuestions(mergedQuestions);
          console.log('Merged saved edits with original data');
        } else {
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error('Failed to load saved edits from localStorage:', error);
        setQuestions(questionsData);
      }
    }
  }, [questionsData]);

  // Author mode handlers
  const handleQuestionSave = (updatedQuestion) => {
    console.log('Saving question:', updatedQuestion.id);
    
    // Update local state
    setQuestions(prev => {
      const updated = prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q);
      console.log('Questions updated, new count:', updated.length);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('sat-questions-edits', JSON.stringify(updated));
        console.log('Questions saved to localStorage');
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
      
      return updated;
    });
    
    console.log('Question updated:', updatedQuestion);
  };

  const toggleAuthorMode = () => {
    if (phase === PHASES.MODULE || phase === PHASES.BREAK) {
      setIsPaused(!showAuthorMode);
    }
    setShowAuthorMode(!showAuthorMode);
  };

  // Save place functionality
  const saveCurrentPlace = () => {
    const place = {
      phase,
      moduleIdx,
      qIndex,
      moduleTimeLeft,
      breakLeft,
      answers: { ...answers },
      flagged: { ...flagged },
      timestamp: Date.now()
    };
    setSavedPlace(place);
    setShowSavePlaceModal(true);
  };

  const resumeFromSavedPlace = () => {
    if (savedPlace) {
      setPhase(savedPlace.phase);
      setModuleIdx(savedPlace.moduleIdx);
      setQIndex(savedPlace.qIndex);
      setModuleTimeLeft(savedPlace.moduleTimeLeft);
      setBreakLeft(savedPlace.breakLeft);
      setAnswers(savedPlace.answers);
      setFlagged(savedPlace.flagged);
      setSavedPlace(null);
      setShowSavePlaceModal(false);
      setShowAuthorMode(false);
      setIsPaused(false);
    }
  };



  const clearSavedPlace = () => {
    setSavedPlace(null);
    setShowSavePlaceModal(false);
  };

  const goToAuthorModeFromModal = () => {
    console.log('Going to Author Mode from modal...');
    setIsPaused(true);
    setShowSavePlaceModal(false);
    setShowAuthorMode(true);
  };

  // Export edited questions
  const exportEditedQuestions = () => {
    try {
      // Create a more comprehensive export with metadata
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        originalQuestionsCount: questionsData.length,
        editedQuestionsCount: questions.length,
        questions: questions,
        metadata: {
          description: 'SAT Questions with Author Mode edits',
          instructions: 'Import this file on any computer to apply your edits'
        }
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sat-questions-edited-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      console.log('Edited questions exported with metadata');
    } catch (error) {
      console.error('Failed to export questions:', error);
    }
  };

  // Import edited questions from file
  const importEditedQuestions = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate the import data
        if (!importData.questions || !Array.isArray(importData.questions)) {
          alert('Invalid file format. Please select a valid SAT questions export file.');
          return;
        }

        // Check if this is a newer version than what we have
        const currentEdits = localStorage.getItem('sat-questions-edits');
        if (currentEdits) {
          const currentData = JSON.parse(currentEdits);
          if (currentData.length > 0) {
            const shouldOverwrite = confirm(
              `You have existing edits with ${currentData.length} questions. ` +
              `This import has ${importData.questions.length} questions. ` +
              `Do you want to overwrite your current edits?`
            );
            if (!shouldOverwrite) return;
          }
        }

        // Apply the imported questions
        setQuestions(importData.questions);
        
        // Save to localStorage for persistence on this computer
        try {
          localStorage.setItem('sat-questions-edits', JSON.stringify(importData.questions));
          console.log('Imported questions saved to localStorage');
        } catch (error) {
          console.error('Failed to save imported questions to localStorage:', error);
        }

        alert(`Successfully imported ${importData.questions.length} questions from ${importData.exportDate || 'unknown date'}`);
        
        // Clear the file input
        event.target.value = '';
        
      } catch (error) {
        console.error('Failed to parse import file:', error);
        alert('Failed to read the file. Please make sure it\'s a valid JSON export from Author Mode.');
      }
    };
    reader.readAsText(file);
  };

  // Clear saved edits
  const clearSavedEdits = () => {
    try {
      localStorage.removeItem('sat-questions-edits');
      setQuestions(questionsData);
      console.log('Saved edits cleared');
    } catch (error) {
      console.error('Failed to clear saved edits:', error);
    }
  };

  const totalQuestions = useMemo(() => modules[0].length + modules[1].length, [modules]);

  // Guard: skip empty module
  useEffect(() => {
    if (phase === PHASES.MODULE && modules[moduleIdx].length === 0) {
      endModule();
    }
  }, [phase, moduleIdx, modules]);

  // Countdown for module
  useEffect(() => {
    if (phase !== PHASES.MODULE || isPaused) return;
    const t = setInterval(() => setModuleTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [phase, isPaused]);

  useEffect(() => {
    if (phase === PHASES.MODULE && moduleTimeLeft <= 0) {
      endModule();
    }
  }, [phase, moduleTimeLeft]);

  // Countdown for break
  useEffect(() => {
    if (phase !== PHASES.BREAK || isPaused) return;
    const t = setInterval(() => setBreakLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, isPaused]);

  useEffect(() => {
    if (phase === PHASES.BREAK && breakLeft <= 0) {
      startSecondModule();
    }
  }, [phase, breakLeft]);

  const startTest = () => {
    setAnswers({});
    setFlagged({});
    setModuleIdx(0);
    setQIndex(0);
    setModuleTimeLeft(MODULE_SECONDS);
    setPhase(PHASES.MODULE);
  };

  const startSecondModule = () => {
    setModuleIdx(1);
    setQIndex(0);
    setModuleTimeLeft(MODULE_SECONDS);
    setPhase(PHASES.MODULE);
  };

  const endModule = () => {
    if (moduleIdx === 0) {
      setBreakLeft(BREAK_SECONDS);
      setPhase(PHASES.BREAK);
    } else {
      setPhase(PHASES.SUMMARY);
    }
  };

  const currentModuleQuestions = modules[moduleIdx] ?? [];
  const currentQuestion = currentModuleQuestions[qIndex];

  const selectAnswer = (choiceIdx) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: choiceIdx }));
    // Advance or end module
    if (qIndex + 1 < currentModuleQuestions.length) {
      setQIndex((i) => i + 1);
    } else {
      endModule();
    }
  };

  const changeAnswer = (choiceIdx) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: choiceIdx }));
  };

  const goToPreviousQuestion = () => {
    if (qIndex > 0) {
      setQIndex((i) => i - 1);
    }
  };

  const goToNextQuestion = () => {
    if (qIndex + 1 < currentModuleQuestions.length) {
      setQIndex((i) => i + 1);
    }
  };

  const toggleFlag = (qid) => {
    setFlagged((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const allQuestions = useMemo(
    () => [...modules[0], ...modules[1]],
    [modules]
  );

  const results = useMemo(() => {
    let correct = 0;
    const rows = allQuestions.map((q) => {
      const user = answers[q.id];
      const isCorrect = user === q.correct;
      if (isCorrect) correct += 1;
      return {
        id: q.id,
        module: q.module,
        stem: q.stem,
        userChoice: user,
        correctChoice: q.correct,
        explanation: q.explanation,
        isCorrect,
        choices: q.choices,
        flagged: !!flagged[q.id],
      };
    });
    const pct =
      allQuestions.length > 0
        ? Math.round((1000 * correct) / allQuestions.length) / 10
        : 0;
    
    // Calculate scaled score (200-800) based on correct answers
    // Round to nearest 10th ending with a 0 (e.g., 530, 540, 550, etc.)
    let rawScaledScore = allQuestions.length > 0 ? 200 + (correct / allQuestions.length) * 600 : 200;
    const scaledScore = Math.round(rawScaledScore / 10) * 10;
    
    return { rows, correct, total: allQuestions.length, pct, scaledScore };
  }, [allQuestions, answers, flagged]);

  // Build review item list based on filter
  const reviewItems = useMemo(() => {
    let items = results.rows;
    if (reviewFilter === "incorrect") items = items.filter((r) => !r.isCorrect);
    if (reviewFilter === "flagged") items = items.filter((r) => r.flagged);
    return items;
  }, [results.rows, reviewFilter]);

  const goReview = () => {
    setReviewFilter("all");
    setReviewIndex(0);
    setPhase(PHASES.REVIEW);
  };

  const navPrev = () => setReviewIndex((i) => Math.max(0, i - 1));
  const navNext = () => setReviewIndex((i) => Math.min(reviewItems.length - 1, i + 1));

  function downloadCSV(rows) {
    const headers = [
      "Question ID","Module","Stem","Your Choice","Correct Choice","Correct?",
      "Your Choice Text","Correct Choice Text","Explanation"
    ];
    const toLetter = (i) => (i == null ? "" : ["A","B","C","D"][i]);

    const lines = [headers.join(",")];
    for (const r of rows) {
      const fields = [
        r.id,
        r.module,
        `"${(r.stem || "").replace(/"/g,'""')}"`,
        toLetter(r.userChoice),
        toLetter(r.correctChoice),
        r.isCorrect ? "Yes" : "No",
        `"${r.userChoice != null ? r.choices[r.userChoice].replace(/"/g,'""') : ""}"`,
        `"${r.choices[r.correctChoice].replace(/"/g,'""')}"`,
        `"${(r.explanation || "").replace(/"/g,'""')}"`
      ];
      lines.push(fields.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sat-rw-results.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadPDF() {
    // Import jsPDF dynamically to avoid SSR issues
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      
      // Set up fonts and styling
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('SAT Reading & Writing Results', margin, 30);
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Score Summary', margin, 60);
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      
      let yPos = 80;
      
      // Essential score information only
      doc.text(`Overall Score: ${results.scaledScore}/800`, margin, yPos);
      yPos += 15;
      doc.text(`Questions Correct: ${results.correct}/${results.total}`, margin, yPos);
      yPos += 15;
      doc.text(`Percentage: ${results.pct}%`, margin, yPos);
      
      // Footer
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos + 30);
      
      // Save the PDF
      doc.save('sat-rw-results.pdf');
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    });
  }

  if (loading) {
    return (
      <div className="app">
        <div className="card"><h2>Loading questions…</h2></div>
      </div>
    );
  }
  if (loadErr) {
    return (
      <div className="app">
        <div className="card">
          <h2>Couldn't load questions</h2>
          <pre className="small">{String(loadErr)}</pre>
          <p className="small">Check that <code>src/data/questions.json</code> exists in the build.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Author Mode - Render above everything else when active */}
      {showAuthorMode ? (
        <AuthorMode
          questions={questions}
          onSave={handleQuestionSave}
          onClose={toggleAuthorMode}
          savedPlace={savedPlace}
          onResume={resumeFromSavedPlace}
          onExport={exportEditedQuestions}
          onClearEdits={clearSavedEdits}
          onImport={importEditedQuestions}
        />
      ) : (
        <>
          {/* Only render test content when NOT in Author Mode */}
          {phase === PHASES.INTRO && (
        <div className="card">
          <h1>SAT Reading & Writing Practice Test</h1>
          <p>Two modules • 32 minutes each • 30-second break</p>
          <p>
            Click start when you're ready. <span className="muted">{tagline}</span>
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", justifyContent: "center" }}>
            <button className="btn" onClick={startTest}>Start Test</button>
            <button 
              className="btn secondary" 
              onClick={toggleAuthorMode}
              style={{ backgroundColor: '#374151', borderColor: '#6b7280' }}
            >
              Author Mode
            </button>
            <span className="small">
              Questions loaded: Module 1 = {modules[0].length}, Module 2 = {modules[1].length}
            </span>
          </div>
          {totalQuestions === 0 && (
            <p className="bad small">No questions found. Check that <code>data/questions.json</code> has items and that the "Module" column is 1 or 2.</p>
          )}
          
        </div>
      )}

      {phase === PHASES.MODULE && (
        <div className="card">
          <div className="meta">
            <div>
              <div className="label">Module {moduleIdx + 1} of 2</div>
              <div className="kicker">
                Question {Math.min(qIndex + 1, currentModuleQuestions.length)} / {currentModuleQuestions.length}
                {answers[currentQuestion?.id] !== undefined && (
                  <span className="answered-indicator">✓ Answered</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {currentQuestion && (
                <button
                  className={`flag ${flagged[currentQuestion.id] ? "active" : ""}`}
                  onClick={() => toggleFlag(currentQuestion.id)}
                  title="Flag this question for review"
                >
                  <span className="star">{flagged[currentQuestion.id] ? "★" : "☆"}</span>
                  {flagged[currentQuestion.id] ? "Flagged" : "Flag for review"}
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={saveCurrentPlace}
                style={{ fontSize: '12px', padding: '6px 10px' }}
                title="Save your current position to fix issues in Author Mode"
              >
                💾 Save Place
              </button>
              <div className="timer" aria-live="polite">
                {isPaused ? (
                  <span className="paused-timer" title="Test is paused - take your time editing!">
                    ⏸️ PAUSED
                  </span>
                ) : (
                  `⏱ ${fmt(moduleTimeLeft)}`
                )}
              </div>
            </div>
          </div>

          {currentQuestion ? (
            <>
              <div className="stem-box">
                <QuestionText 
                  content={currentQuestion.stem}
                  className="stem-text"
                />
              </div>
              
              {currentQuestion.image && (
                <div className="figure-box">
                  <img
                    src={`${import.meta.env.BASE_URL}${currentQuestion.image}`}
                    alt={currentQuestion.alt || "Figure"}
                    loading="lazy"
                  />
                  {currentQuestion.caption && <div className="figure-cap">{currentQuestion.caption}</div>}
                </div>
              )}
              
              {currentQuestion.chart && <ChartRenderer chart={currentQuestion.chart} />}
              <div className="grid choices" role="list">
                {currentQuestion.choices.map((text, i) => {
                  const isSelected = answers[currentQuestion.id] === i;
                  const isCorrect = i === currentQuestion.correct;
                  return (
                    <button
                      key={i}
                      className={`choice ${isSelected ? 'selected' : ''}`}
                      onClick={() => answers[currentQuestion.id] !== undefined ? changeAnswer(i) : selectAnswer(i)}
                      role="listitem"
                      aria-label={`Answer ${letters[i]}`}
                      style={{
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : undefined,
                        borderColor: isSelected ? '#3b82f6' : undefined,
                        borderWidth: isSelected ? '2px' : undefined
                      }}
                    >
                      <strong style={{ marginRight: 10 }}>{letters[i]}.</strong>
                      <MarkdownMath>{sanitizeForRender(text)}</MarkdownMath>
                      {isSelected && <span style={{ marginLeft: 10, fontSize: '14px', opacity: 0.8 }}>(your answer)</span>}
                    </button>
                  );
                })}
              </div>

              {answers[currentQuestion?.id] !== undefined && (
                <div style={{ 
                  marginTop: 8, 
                  padding: '8px 12px', 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#3b82f6'
                }}>
                  ✓ You've already answered this question. Click a different choice to change your answer.
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button 
                  className="btn-secondary btn" 
                  onClick={goToPreviousQuestion}
                  disabled={qIndex === 0}
                  style={{ opacity: qIndex === 0 ? 0.5 : 1 }}
                >
                  ← Previous
                </button>
                <button 
                  className="btn-secondary btn" 
                  onClick={goToNextQuestion}
                  disabled={qIndex + 1 >= currentModuleQuestions.length}
                  style={{ opacity: qIndex + 1 >= currentModuleQuestions.length ? 0.5 : 1 }}
                >
                  Next →
                </button>
                <button className="btn-secondary btn" onClick={endModule}>
                  Finish Module Early
                </button>
              </div>
            </>
          ) : (
            <p>No questions found for this module.</p>
          )}
        </div>
      )}

      {phase === PHASES.BREAK && (
        <div className="card">
          <h2>Break time</h2>
          <p>
            {isPaused ? (
              "Break is paused while you edit. Take your time fixing issues!"
            ) : (
              <>Module 2 will start automatically in <strong>{fmt(breakLeft)}</strong>.</>
            )}
          </p>
          <p className="small">
            {isPaused ? (
              "⏸️ Paused - no time pressure while editing"
            ) : (
              "Stand up, shake out your wrists, summon your inner grammar goblin."
            )}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: "center" }}>
            <button className="btn" onClick={startSecondModule}>Start Now</button>
          </div>
        </div>
      )}

      {phase === PHASES.SUMMARY && (
        <div className="card results-page">
          {/* Header Section */}
          <div className="results-header">
            <div className="results-title">
              <h1>🎯 Your SAT Results</h1>
              <p className="results-subtitle">Reading & Writing Section</p>
            </div>
            
            {/* Score Display */}
            <div className="score-display">
              <div className="score-circle">
                <div className="score-number">{results.correct}</div>
                <div className="score-total">/ {results.total}</div>
              </div>
              <div className="score-percentage">{results.pct}%</div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="performance-summary">
            <div className="summary-grid">
              <div className="summary-item correct">
                <div className="summary-icon">✅</div>
                <div className="summary-content">
                  <div className="summary-label">Correct</div>
                  <div className="summary-value">{results.correct}</div>
                </div>
              </div>
              
              <div className="summary-item incorrect">
                <div className="summary-icon">❌</div>
                <div className="summary-content">
                  <div className="summary-label">Incorrect</div>
                  <div className="summary-value">{results.total - results.correct}</div>
                </div>
              </div>
              
              <div className="summary-item accuracy">
                <div className="summary-icon">📊</div>
                <div className="summary-content">
                  <div className="summary-label">Accuracy</div>
                  <div className="summary-value">{results.pct}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <div className="primary-actions">
              <button className="btn btn-primary" onClick={() => setPhase(PHASES.STUDY_PLAN)}>
                📚 Study Plan
              </button>
              <button className="btn btn-primary" onClick={goReview}>
                📖 Review Questions
              </button>
            </div>
            
            <div className="secondary-actions">
              <button className="btn btn-outline" onClick={() => setPhase(PHASES.INTRO)}>
                🔄 Retake Test
              </button>
              <button className="btn btn-outline" onClick={() => downloadCSV(results.rows)}>
                📥 Download CSV
              </button>
              <button className="btn btn-outline" onClick={downloadPDF}>
                📄 Download PDF
              </button>
            </div>
          </div>

          {/* SAT Scorer Component */}
          <SATReadingWritingScorer 
            score={results.scaledScore} 
            rawScore={results.correct} 
            percentageCorrect={results.pct} 
          />


        </div>
      )}

      {phase === PHASES.REVIEW && (
        <div className="card">
          <div className="meta" style={{ marginBottom: 12 }}>
            <div>
              <div className="label">Review Mode</div>
              <div className="kicker">
                {reviewItems.length > 0 ? (
                  <>Item {reviewIndex + 1} / {reviewItems.length}</>
                ) : "No items to review"}
              </div>
            </div>
            <div className="pills">
              <button
                className={`pill ${reviewFilter === "all" ? "active" : ""}`}
                onClick={() => { setReviewFilter("all"); setReviewIndex(0); }}
              >
                All ({results.rows.length})
              </button>
              <button
                className={`pill ${reviewFilter === "incorrect" ? "active" : ""}`}
                onClick={() => { setReviewFilter("incorrect"); setReviewIndex(0); }}
              >
                Incorrect ({results.rows.filter(r => !r.isCorrect).length})
              </button>
              <button
                className={`pill ${reviewFilter === "flagged" ? "active" : ""}`}
                onClick={() => { setReviewFilter("flagged"); setReviewIndex(0); }}
              >
                Flagged ({results.rows.filter(r => r.flagged).length})
              </button>
            </div>
          </div>

          {reviewItems.length === 0 ? (
            <p className="small">Nothing here. Try a different filter.</p>
          ) : (
            (() => {
              const r = reviewItems[reviewIndex];
              return (
                <>
                  <div className="kicker" style={{ marginBottom: 6 }}>
                    Module {r.module} • Q{r.id}{" "}
                    <button
                      className={`flag ${r.flagged ? "active" : ""}`}
                      onClick={() => toggleFlag(r.id)}
                      style={{ marginLeft: 8 }}
                    >
                      <span className="star">{r.flagged ? "★" : "☆"}</span>
                      {r.flagged ? "Flagged" : "Flag for review"}
                    </button>
                  </div>

                  <div className="stem-box">
                    <QuestionText 
                      content={r.stem}
                      className="stem-text"
                    />
                  </div>
                  
                  {r.image && (
                    <div className="figure-box">
                      <img
                        src={`${import.meta.env.BASE_URL}${r.image}`}
                        alt={r.alt || "Figure"}
                        loading="lazy"
                      />
                      {r.caption && <div className="figure-cap">{r.caption}</div>}
                    </div>
                  )}
                  <div className="grid choices" role="list" style={{ marginTop: 10 }}>
                    {r.choices.map((text, i) => {
                      const isCorrect = i === r.correctChoice;
                      const isUser = i === r.userChoice;
                      const cls = isCorrect ? "correct" : isUser && !isCorrect ? "incorrect" : "";
                      return (
                        <div key={i} className={`choice ${cls}`} role="listitem" aria-label={`Choice ${letters[i]}`}>
                          <strong style={{ marginRight: 10 }}>{letters[i]}.</strong>
                          <MarkdownMath>{sanitizeForRender(text)}</MarkdownMath>
                          {isCorrect && <span className="small" style={{ marginLeft: 10, color: "var(--good)" }}>(correct)</span>}
                          {isUser && !isCorrect && <span className="small" style={{ marginLeft: 10, color: "var(--bad)" }}>(your answer)</span>}
                          {isUser && isCorrect && <span className="small" style={{ marginLeft: 10, color: "var(--good)" }}>(your answer)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Explanation:</strong>
                    </div>
                    <div>
                      <pre style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Raw: {JSON.stringify(r.explanation)}
                        Type: {typeof r.explanation}
                        Stringified: {String(r.explanation)}
                      </pre>
                      <div style={{ marginTop: '8px' }}>
                        {(() => {
                          // Handle potential object values in explanation
                          if (r.explanation && typeof r.explanation === 'object') {
                            return JSON.stringify(r.explanation);
                          }
                          return r.explanation || '';
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="review-nav">
                    <button className="btn btn-secondary" onClick={navPrev} disabled={reviewIndex === 0}>Previous</button>
                    <button className="btn" onClick={navNext} disabled={reviewIndex >= reviewItems.length - 1}>Next</button>
                    <div style={{ flex: 1 }} />
                    <button className="btn btn-secondary" onClick={() => setPhase(PHASES.SUMMARY)}>Back to Summary</button>
                  </div>
                </>
              );
            })()
          )}
        </div>
      )}

          {phase === PHASES.STUDY_PLAN && (
            <SATStudyPlan 
              studentAnswers={results.rows}
              totalQuestions={results.total}
            />
          )}

          {/* Save Place Modal */}
          {showSavePlaceModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>💾 Position Saved!</h3>
                <div className="saved-place-info">
                  <p><strong>Module:</strong> {savedPlace?.moduleIdx + 1}</p>
                  <p><strong>Question:</strong> {savedPlace?.qIndex + 1}</p>
                  <p><strong>Time Remaining:</strong> {fmt(savedPlace?.moduleTimeLeft || 0)}</p>
                  <p><strong>Answers:</strong> {Object.keys(savedPlace?.answers || {}).length}</p>
                  <p><strong>Flagged:</strong> {Object.keys(savedPlace?.flagged || {}).length}</p>
                </div>
                <div className="modal-actions">
                  <button className="btn" onClick={goToAuthorModeFromModal}>
                    🛠️ Go to Author Mode
                  </button>
                  <button className="btn-secondary" onClick={clearSavedPlace}>
                    ❌ Clear Saved Place
                  </button>
                </div>
                <p className="small" style={{ marginTop: '16px', opacity: 0.7 }}>
                  Your position is saved. You can now fix issues in Author Mode and return exactly where you left off.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

