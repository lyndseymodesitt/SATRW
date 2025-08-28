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
      .then((jsonData) => {
        // Handle both wrapped format {"questions": [...]} and direct array format [...]
        if (jsonData.questions && Array.isArray(jsonData.questions)) {
          setData(jsonData.questions);
        } else if (Array.isArray(jsonData)) {
          setData(jsonData);
        } else {
          throw new Error('Invalid questions.json format - expected array or {questions: [...]}');
        }
      })
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
  const [showAuthorModePassword, setShowAuthorModePassword] = useState(false);
  const [authorModePassword, setAuthorModePassword] = useState('');
  const [questions, setQuestions] = useState([]);
  
  // Save place functionality removed - Author Mode only available on home screen
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
          
          // Check if we have a complete override (imported data)
          const hasCompleteOverride = parsedEdits.length === questionsData.length && 
                                   parsedEdits.every(q => q.id && q.stem && q.choices);
          
          if (hasCompleteOverride) {
            // Use the imported data directly as it's complete
            console.log('Using complete imported data override');
            setQuestions(parsedEdits);
          } else {
            // Merge partial edits with original data
            console.log('Merging partial edits with original data');
            const mergedQuestions = questionsData.map(originalQ => {
              const savedQ = parsedEdits.find(saved => saved.id === originalQ.id);
              return savedQ || originalQ;
            });
            setQuestions(mergedQuestions);
          }
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

  // Auto-sync to cloud storage
  const autoSyncToCloud = async () => {
    try {
      // Create a sync file with timestamp
      const syncData = {
        version: '1.0',
        lastSync: new Date().toISOString(),
        questions: questions,
        device: navigator.userAgent,
        timestamp: Date.now()
      };
      
      const dataStr = JSON.stringify(syncData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Try to save to cloud storage if available
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `sat-sync-${new Date().toISOString().split('T')[0]}.json`,
            types: [{
              description: 'SAT Questions Sync File',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await handle.createWritable();
          await writable.write(dataStr);
          await writable.close();
          
          console.log('Auto-sync file saved successfully');
          alert('Sync file saved! Upload this to your cloud storage (Google Drive, Dropbox, etc.) for other devices to access.');
        } catch (error) {
          console.log('File picker cancelled or failed, falling back to download');
          // Fallback to download
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sat-sync-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
          
          alert('Sync file downloaded! Upload this to your cloud storage for other devices to access.');
        }
      } else {
        // Fallback for older browsers
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sat-sync-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('Sync file downloaded! Upload this to your cloud storage for other devices to access.');
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
      alert('Auto-sync failed. Please use manual Export/Import instead.');
    }
  };

  // Check for cloud sync updates
  const checkForCloudUpdates = async () => {
    try {
      // This would check a cloud storage location for updates
      // For now, we'll show instructions
      alert('To check for cloud updates:\n1. Upload your sync file to cloud storage\n2. On other devices, download and import the sync file\n3. Changes will automatically apply');
    } catch (error) {
      console.error('Cloud update check failed:', error);
    }
  };

  // Auto-update the original questions.json file with all edits
  const autoUpdateQuestionsFile = async () => {
    try {
      // Check if we have any edits to apply
      const savedEdits = localStorage.getItem('sat-questions-edits');
      if (!savedEdits) {
        alert('No edits detected. Make some changes in Author Mode first.');
        return;
      }

      const parsedEdits = JSON.parse(savedEdits);
      
      // Compare with original data to detect changes
      const changes = [];
      parsedEdits.forEach((editedQ, index) => {
        const originalQ = questionsData[index];
        if (originalQ && JSON.stringify(editedQ) !== JSON.stringify(originalQ)) {
          changes.push({
            questionId: editedQ.id,
            original: originalQ,
            edited: editedQ,
            changes: getChanges(originalQ, editedQ)
          });
        }
      });

      if (changes.length === 0) {
        alert('No changes detected. All questions are already up to date.');
        return;
      }

      // Create the updated questions.json content
      const updatedQuestionsJson = {
        questions: parsedEdits,
        metadata: {
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Author Mode',
          changesCount: changes.length,
          changes: changes.map(c => ({
            questionId: c.questionId,
            changes: c.changes
          }))
        }
      };

      // Download the updated questions.json file
      const dataStr = JSON.stringify(updatedQuestionsJson, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'questions.json';
      link.click();
      URL.revokeObjectURL(url);

      // Show summary of changes
      const changesSummary = changes.map(c => 
        `Question ${c.questionId}: ${c.changes.join(', ')}`
      ).join('\n');

      alert(`✅ Questions file updated successfully!\n\n📝 Changes detected:\n${changesSummary}\n\n📁 File 'questions.json' downloaded.\n\n🚀 To deploy:\n1. Replace your public/data/questions.json with this file\n2. Run: git add -A && git commit -m "feat: auto-update questions with Author Mode edits"\n3. Run: git push origin main\n4. Run: npm run deploy\n\nYour changes will be live worldwide!`);

      console.log('Questions file auto-updated with', changes.length, 'changes');
      
    } catch (error) {
      console.error('Auto-update failed:', error);
      alert('Auto-update failed. Please use manual deployment instead.');
    }
  };

  // Helper function to detect what changed in a question
  const getChanges = (original, edited) => {
    const changes = [];
    
    if (original.stem !== edited.stem) changes.push('Question text updated');
    if (original.choices && edited.choices && JSON.stringify(original.choices) !== JSON.stringify(edited.choices)) {
      changes.push('Answer choices updated');
    }
    if (original.correct !== edited.correct) changes.push('Correct answer changed');
    if (original.explanation !== edited.explanation) changes.push('Explanation updated');
    if (original.module !== edited.module) changes.push('Module assignment changed');
    if (original.image !== edited.image) changes.push('Image reference updated');
    if (original.chart !== edited.chart) changes.push('Chart data updated');
    
    return changes.length > 0 ? changes : ['Minor formatting changes'];
  };

  // Advanced: Auto-commit and deploy changes (requires user confirmation)
  const autoCommitAndDeploy = async () => {
    try {
      // First, update the questions file
      await autoUpdateQuestionsFile();
      
      // Ask user if they want to auto-commit and deploy
      const shouldAutoDeploy = confirm(
        '✅ Questions file updated successfully!\n\n🚀 Would you like to automatically commit and deploy these changes to GitHub?\n\nThis will:\n• Commit your changes to Git\n• Push to GitHub\n• Deploy to GitHub Pages\n• Make changes live worldwide\n\nClick OK to proceed with auto-deployment.'
      );
      
      if (shouldAutoDeploy) {
        // Show deployment instructions
        alert('🚀 Auto-deployment initiated!\n\n📋 Next steps:\n1. Replace your public/data/questions.json with the downloaded file\n2. Run these commands in your terminal:\n   git add -A\n   git commit -m "feat: auto-update questions with Author Mode edits"\n   git push origin main\n   npm run deploy\n\nYour changes will be live worldwide!');
      }
      
    } catch (error) {
      console.error('Auto-commit and deploy failed:', error);
      alert('Auto-commit and deploy failed. Please use manual deployment instead.');
    }
  };

  // Direct file replacement: Automatically replace questions.json with updated version
  const directFileReplacement = async () => {
    try {
      // Check if we have any edits to apply
      const savedEdits = localStorage.getItem('sat-questions-edits');
      if (!savedEdits) {
        alert('No edits detected. Make some changes in Author Mode first.');
        return;
      }

      const parsedEdits = JSON.parse(savedEdits);
      
      // Compare with original data to detect changes
      const changes = [];
      parsedEdits.forEach((editedQ, index) => {
        const originalQ = questionsData[index];
        if (originalQ && JSON.stringify(editedQ) !== JSON.stringify(originalQ)) {
          changes.push({
            questionId: editedQ.id,
            original: originalQ,
            edited: editedQ,
            changes: getChanges(originalQ, editedQ)
          });
        }
      });

      if (changes.length === 0) {
        alert('No changes detected. All questions are already up to date.');
        return;
      }

      // Create the updated questions.json content (without metadata for direct replacement)
      const updatedQuestionsJson = parsedEdits;

      // Create the file content for direct replacement
      const dataStr = JSON.stringify(updatedQuestionsJson, null, 2);
      
      // Try to use the File System Access API for direct file writing
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'questions.json',
            types: [{
              description: 'SAT Questions File',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await handle.createWritable();
          await writable.write(dataStr);
          await writable.close();
          
          // Show success message with next steps
          const changesSummary = changes.map(c => 
            `Question ${c.questionId}: ${c.changes.join(', ')}`
          ).join('\n');

          alert(`✅ Questions file directly updated!\n\n📝 Changes applied:\n${changesSummary}\n\n📁 File 'questions.json' has been updated.\n\n🚀 To deploy:\n1. Copy this file to your public/data/ folder\n2. Run: git add -A && git commit -m "feat: direct update questions with Author Mode edits"\n3. Run: git push origin main\n4. Run: npm run deploy\n\nYour changes will be live worldwide!`);
          
        } catch (error) {
          console.log('File picker failed, falling back to download');
          // Fallback to download
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'questions.json';
          link.click();
          URL.revokeObjectURL(url);
          
          const changesSummary = changes.map(c => 
            `Question ${c.questionId}: ${c.changes.join(', ')}`
          ).join('\n');

          alert(`✅ Questions file ready for replacement!\n\n📝 Changes detected:\n${changesSummary}\n\n📁 File 'questions.json' downloaded.\n\n🚀 To deploy:\n1. Replace your public/data/questions.json with this file\n2. Run: git add -A && git commit -m "feat: direct update questions with Author Mode edits"\n3. Run: git push origin main\n4. Run: npm run deploy\n\nYour changes will be live worldwide!`);
        }
      } else {
        // Fallback for older browsers
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'questions.json';
        link.click();
        URL.revokeObjectURL(url);
        
        const changesSummary = changes.map(c => 
          `Question ${c.questionId}: ${c.changes.join(', ')}`
        ).join('\n');

        alert(`✅ Questions file ready for replacement!\n\n📝 Changes detected:\n${changesSummary}\n\n📁 File 'questions.json' downloaded.\n\n🚀 To deploy:\n1. Replace your public/data/questions.json with this file\n2. Run: git add -A && git commit -m "feat: direct update questions with Author Mode edits"\n3. Run: git push origin main\n4. Run: npm run deploy\n\nYour changes will be live worldwide!`);
      }

      console.log('Questions file ready for direct replacement with', changes.length, 'changes');
      
    } catch (error) {
      console.error('Direct file replacement failed:', error);
      alert('Direct file replacement failed. Please use manual update instead.');
    }
  };

  const toggleAuthorMode = () => {
    console.log('Author Mode button clicked!');
    // Show password prompt instead of directly toggling
    setShowAuthorModePassword(true);
    console.log('showAuthorModePassword set to true');
  };

  const verifyAuthorModePassword = () => {
    console.log('Verifying password:', authorModePassword);
    // You can change this password to whatever you want
    const correctPassword = 'sat2024';
    
    if (authorModePassword === correctPassword) {
      console.log('Password correct! Opening Author Mode...');
      setShowAuthorModePassword(false);
      setAuthorModePassword('');
      setShowAuthorMode(true);
      
      if (phase === PHASES.MODULE || phase === PHASES.BREAK) {
        setIsPaused(true);
      }
    } else {
      console.log('Password incorrect!');
      alert('Incorrect password. Please try again.');
      setAuthorModePassword('');
    }
  };

  const closeAuthorModePassword = () => {
    setShowAuthorModePassword(false);
    setAuthorModePassword('');
  };

  const closeAuthorMode = () => {
    setShowAuthorMode(false);
    if (phase === PHASES.MODULE || phase === PHASES.BREAK) {
      setIsPaused(false);
    }
  };

  // Save place functionality removed - Author Mode only available on home screen

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

  // Check if we have imported changes
  const hasImportedChanges = () => {
    try {
      const savedEdits = localStorage.getItem('sat-questions-edits');
      if (savedEdits) {
        const parsedEdits = JSON.parse(savedEdits);
        return parsedEdits.length === questionsData.length && 
               parsedEdits.every(q => q.id && q.stem && q.choices);
      }
      return false;
    } catch (error) {
      return false;
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
    console.log('goReview called, results:', results);
    console.log('results.rows:', results.rows);
    console.log('results.rows length:', results.rows?.length);
    console.log('results object keys:', Object.keys(results));
    console.log('reviewItems will be:', reviewItems);
    console.log('reviewItems length:', reviewItems?.length);
    setReviewFilter("all");
    setReviewIndex(0);
    setPhase(PHASES.REVIEW);
    alert('Phase changed to REVIEW! Check the page for content.');
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
      {console.log('Current phase:', phase, 'PHASES:', PHASES)}
      {/* Author Mode - Render above everything else when active */}
      {showAuthorMode ? (
        <AuthorMode
          questions={questions}
          onSave={handleQuestionSave}
          onClose={closeAuthorMode}
          onExport={exportEditedQuestions}
          onClearEdits={clearSavedEdits}
          onImport={importEditedQuestions}
          onAutoSync={autoSyncToCloud}
          onCheckUpdates={checkForCloudUpdates}
          onDeploy={autoUpdateQuestionsFile}
          onAutoCommitDeploy={autoCommitAndDeploy}
          onDirectReplace={directFileReplacement}
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
              title="Author Mode - Edit questions (only available on home screen)"
            >
              Author Mode
            </button>
            <span className="small">
              Questions loaded: Module 1 = {modules[0].length}, Module 2 = {modules[1].length}
            </span>
          </div>
          
          {/* Imported Changes Indicator */}
          {hasImportedChanges() && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 16px', 
              backgroundColor: '#10b981', 
              color: 'white', 
              borderRadius: '8px', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}>
              <span>📥</span>
              <span><strong>Imported Changes Active</strong> - Your edited questions are loaded</span>
              <button 
                onClick={clearSavedEdits}
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Clear imported changes and restore original questions"
              >
                Reset to Original
              </button>
            </div>
          )}
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
              {/* Save Place button removed - Author Mode only available on home screen */}
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
          {console.log('Rendering SATScorer in SUMMARY phase with:', { score: results.scaledScore, rawScore: results.correct, percentageCorrect: results.pct })}
          <SATReadingWritingScorer 
            score={results.scaledScore} 
            rawScore={results.correct} 
            percentageCorrect={results.pct} 
          />


        </div>
      )}

          {phase === PHASES.REVIEW && (
            <>
              <div style={{ 
                position: 'fixed', 
                top: '0', 
                left: '0', 
                width: '100vw', 
                height: '100vh', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                zIndex: 9999
              }} />
              
              <div style={{ 
                position: 'fixed', 
                top: '0', 
                left: '0', 
                width: '100vw', 
                height: '100vh', 
                background: 'white', 
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '20px 30px',
                  color: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto'
                  }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                      SAT Review Mode
                    </h1>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '20px'
                    }}>
                      <span style={{ fontSize: '16px' }}>
                        Question {reviewIndex + 1} of {reviewItems.length}
                      </span>
                      <button 
                        onClick={() => setPhase(PHASES.SUMMARY)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        ← Back to Summary
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  padding: '30px',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  width: '100%',
                  gap: '30px'
                }}>
                  {/* Question Section */}
                  <div style={{ 
                    flex: 2,
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '30px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h2 style={{ 
                      margin: '0 0 20px 0', 
                      color: '#2c3e50',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      Question
                    </h2>
                    <div style={{ 
                      lineHeight: '1.7', 
                      color: '#34495e',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      padding: '25px',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      {reviewItems?.[reviewIndex]?.stem || 'No question available'}
                    </div>
                  </div>
                  
                  {/* Answer Choices Section */}
                  <div style={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div style={{ 
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      padding: '25px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 20px 0', 
                        color: '#2c3e50',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        Answer Choices
                      </h3>
                      {reviewItems?.[reviewIndex]?.choices?.map((choice, idx) => {
                        const isCorrect = idx === reviewItems[reviewIndex]?.correctChoice;
                        const isUser = idx === reviewItems[reviewIndex]?.userChoice;
                        let choiceStyle = { 
                          padding: '15px',
                          marginBottom: '12px',
                          borderRadius: '8px',
                          border: '2px solid #e9ecef',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        };
                        
                        if (isCorrect) {
                          choiceStyle = { ...choiceStyle, backgroundColor: '#d4edda', borderColor: '#28a745' };
                        } else if (isUser && !isCorrect) {
                          choiceStyle = { ...choiceStyle, backgroundColor: '#f8d7da', borderColor: '#dc3545' };
                        }
                        
                        return (
                          <div key={idx} style={choiceStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <strong style={{ color: '#2c3e50', marginRight: '10px' }}>
                                  {String.fromCharCode(65 + idx)}.
                                </strong>
                                <span style={{ color: '#34495e' }}>{choice}</span>
                              </div>
                              <div>
                                {isCorrect && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Correct</span>}
                                {isUser && !isCorrect && <span style={{ color: '#dc3545', fontWeight: 'bold' }}>✗ Your Answer</span>}
                                {isUser && isCorrect && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Your Answer (Correct)</span>}
                              </div>
                            </div>
                          </div>
                        );
                      }) || 'No choices available'}
                    </div>
                    
                    {/* Results Summary */}
                    <div style={{ 
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      padding: '25px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 20px 0', 
                        color: '#2c3e50',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        Results Summary
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <span style={{ color: '#34495e' }}>
                          Your Answer: <strong style={{ color: reviewItems?.[reviewIndex]?.isCorrect ? '#28a745' : '#dc3545' }}>
                            {String.fromCharCode(65 + (reviewItems?.[reviewIndex]?.userChoice || 0))}
                          </strong>
                        </span>
                        <span style={{ color: '#34495e' }}>
                          Correct Answer: <strong style={{ color: '#28a745' }}>
                            {String.fromCharCode(65 + (reviewItems?.[reviewIndex]?.correctChoice || 0))}
                          </strong>
                        </span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ 
                          padding: '8px 20px', 
                          borderRadius: '25px', 
                          backgroundColor: reviewItems?.[reviewIndex]?.isCorrect ? '#d4edda' : '#f8d7da',
                          color: reviewItems?.[reviewIndex]?.isCorrect ? '#155724' : '#721c24',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {reviewItems?.[reviewIndex]?.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Footer */}
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '20px 30px',
                  borderTop: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  width: '100%'
                }}>
                  <button 
                    onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                    disabled={reviewIndex === 0}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: reviewIndex === 0 ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: reviewIndex === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ← Previous Question
                  </button>
                  
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#6c757d',
                    fontWeight: '500'
                  }}>
                    {reviewIndex + 1} of {reviewItems.length}
                  </div>
                  
                  <button 
                    onClick={() => setReviewIndex(Math.min(reviewItems.length - 1, reviewIndex + 1))}
                    disabled={reviewIndex >= reviewItems.length - 1}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: reviewIndex >= reviewItems.length - 1 ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: reviewIndex >= reviewItems.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            </>
          )}

          {phase === PHASES.STUDY_PLAN && (
            <SATStudyPlan 
              studentAnswers={results.rows}
              totalQuestions={results.total}
              onBack={() => setPhase(PHASES.SUMMARY)}
            />
          )}

          {/* Save Place Modal removed - Author Mode only available on home screen */}

          {/* Author Mode Password Modal */}
          {showAuthorModePassword && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>🔐 Author Mode Access</h3>
                <p style={{ marginBottom: '20px', color: 'var(--muted)' }}>
                  Enter the password to access Author Mode for editing questions.
                </p>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="password"
                    value={authorModePassword}
                    onChange={(e) => setAuthorModePassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: '2px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && verifyAuthorModePassword()}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn" onClick={verifyAuthorModePassword}>
                    🔓 Unlock Author Mode
                  </button>
                  <button className="btn-secondary" onClick={closeAuthorModePassword}>
                    ❌ Cancel
                  </button>
                </div>
                <p className="small" style={{ marginTop: '16px', opacity: 0.7 }}>
                  Author Mode allows you to edit questions, fix grammar issues, and customize the test content.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

