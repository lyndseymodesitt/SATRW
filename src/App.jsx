import { useEffect, useMemo, useState } from "react";
import MarkdownMath from "./components/MarkdownMath";
import ChartRenderer from "./components/ChartRenderer.jsx";
import QuestionText from "./components/QuestionText.jsx";
import { SATReadingWritingScorer } from "./components/SATScorer.jsx";

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

  // REVIEW mode UI state
  const [reviewFilter, setReviewFilter] = useState("all"); // all | incorrect | flagged
  const [reviewIndex, setReviewIndex] = useState(0);

  // Group questions by module; keep order from your file.
  const modules = useMemo(() => {
    const m1 = questionsData.filter((q) => Number(q.module) === 1);
    const m2 = questionsData.filter((q) => Number(q.module) === 2);
    return [m1, m2];
  }, [questionsData]);

  const totalQuestions = modules[0].length + modules[1].length;

  // Guard: skip empty module
  useEffect(() => {
    if (phase === PHASES.MODULE && modules[moduleIdx].length === 0) {
      endModule();
    }
  }, [phase, moduleIdx, modules]);

  // Countdown for module
  useEffect(() => {
    if (phase !== PHASES.MODULE) return;
    const t = setInterval(() => setModuleTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === PHASES.MODULE && moduleTimeLeft <= 0) {
      endModule();
    }
  }, [phase, moduleTimeLeft]);

  // Countdown for break
  useEffect(() => {
    if (phase !== PHASES.BREAK) return;
    const t = setInterval(() => setBreakLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

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
    return { rows, correct, total: allQuestions.length, pct };
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
      {phase === PHASES.INTRO && (
        <div className="card">
          <h1>SAT Reading & Writing Practice Test</h1>
          <p>Two modules • 32 minutes each • 30-second break</p>
          <p>
            Click start when you're ready. <span className="muted">{tagline}</span>
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", justifyContent: "center" }}>
            <button className="btn" onClick={startTest}>Start Test</button>
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
              <div className="timer" aria-live="polite">⏱ {fmt(moduleTimeLeft)}</div>
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
          <p>Module 2 will start automatically in <strong>{fmt(breakLeft)}</strong>.</p>
          <p className="small">Stand up, shake out your wrists, summon your inner grammar goblin.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: "center" }}>
            <button className="btn" onClick={startSecondModule}>Start Now</button>
          </div>
        </div>
      )}

      {phase === PHASES.SUMMARY && (
        <div className="card">
          <h2>Your SAT Reading & Writing Results</h2>
          <div className="kicker" style={{ marginBottom: 8 }}>
            Raw Score: <strong className="good">{results.correct}/{results.total}</strong> correct (
            <strong>{results.pct}%</strong>)
          </div>
          <p className="small">
            Use the SAT scorer below to see your scaled score (200-800) and detailed analysis.
            You can also enter review mode to see missed questions or retake the test.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 16 }}>
            <button className="btn" onClick={goReview}>Enter Review Mode</button>
                          <button className="btn btn-secondary" onClick={() => setPhase(PHASES.INTRO)}>Retake Test</button>
            <button className="btn btn-secondary" onClick={() => downloadCSV(results.rows)}>Download Results (CSV)</button>
          </div>

          {/* New SAT Scorer Component */}
          <SATReadingWritingScorer 
            initialCorrectAnswers={results.correct}
            showDetailedResults={true}
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
                    <MarkdownMath><em>Explanation:</em> {sanitizeForRender(r.explanation)}</MarkdownMath>
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
    </div>
  );
}

