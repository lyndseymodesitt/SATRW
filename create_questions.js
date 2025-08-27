import { writeFileSync } from 'fs';

const questionsData = {
  "questions": [
    {
      "id": "1",
      "module": 1,
      "stem": "Sarah had always been known for her steady nerves and positive attitude throughout her high school basketball career. Even when facing tough opponents or trailing by significant margins, she maintained her characteristic composure and encouraged her teammates to keep fighting. However, after she missed what should have been an easy layup in the final seconds of the state championship game, costing her team the title they had worked toward all season, Sarah's usual confidence was <span class=\"blank\"></span> for the first time anyone could remember. Her coach noticed her uncharacteristically quiet demeanor during the post-game interviews, though she still managed to congratulate the opposing team with grace.\n \n Which choice completes the text with the most logical and precise word or phrase?",
      "choices": [
        "reinforced",
        "demolished",
        "rattled",
        "restored"
      ],
      "correct": 2,
      "explanation": "\"Rattled\" is correct because it indicates that Sarah's confidence was disturbed and shaken, which fits with her \"uncharacteristically quiet demeanor\" while still allowing her to \"congratulate the opposing team with grace.\" The passage suggests her confidence was affected but not completely destroyed.",
      "difficulty": "Easy"
    },
    {
      "id": "2",
      "module": 1,
      "stem": "Before the field trip, Ms. Gomez emailed a one-page checklist that listed meeting times, bus numbers, and what to bring. She also added a short map showing the museum entrance. The checklist <span class=\"blank\"></span> the plan, so students and chaperones knew exactly where to go and when to arrive.\n \n Which choice completes the text with the most logical and precise word or phrase?",
      "choices": [
        "confirmed",
        "clarified",
        "praised",
        "complicated"
      ],
      "correct": 1,
      "explanation": "\"Clarified\" is correct because the checklist and map provided specific details that made the plan clear and understandable. The added information—meeting times, bus numbers, supplies needed, and a visual map—resulted in students and chaperones knowing \"exactly where to go and when to arrive,\" which demonstrates that the plan was made clearer and more comprehensible.",
      "difficulty": "Easy"
    }
  ],
  "metadata": {
    "lastUpdated": "2025-08-27T18:30:09.124Z",
    "updatedBy": "Author Mode",
    "changesCount": 27,
    "changes": [
      {
        "questionId": "3",
        "changes": ["Question text updated"]
      }
    ]
  }
};

writeFileSync('public/data/questions.json', JSON.stringify(questionsData, null, 2));
console.log('✅ Created questions.json with your edits');
