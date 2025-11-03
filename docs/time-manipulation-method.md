# How the Application Tracks Time Spent on Concepts

  The application tracks time spent on concepts through an indirect relationship chain:

  The Chain: StudySession → Task → Concept

  1. StudySession records time duration:
    - Has a duration field (in minutes)
    - Can be linked to a taskId (optional)
    - When you complete a Pomodoro session and select a task, that session's duration is saved
  2. Task-Concept Relationship:
    - Tasks can be linked to multiple concepts via the TaskConcept junction table
    - Each task can track multiple concepts it relates to
    - The junction table has a relevance field (low/medium/high)
  3. Time Aggregation (in /api/concepts/[id]/route.ts:56-65):
  // Calculate total study time
  const totalStudyTime = concept.tasks.reduce((acc: number, tc: any) => {
    const taskTime = tc.task.sessions.reduce(
      (sum: number, session: any) => sum + session.duration,
      0
    );
    return acc + taskTime;
  }, 0);

  How It Works:

  When you study:
  1. Start a Pomodoro timer
  2. Select a task to work on
  3. Complete the session (e.g., 25 minutes)
  4. The session is saved with duration: 25 and linked to that task

  For a concept:
  1. The API fetches the concept with all its linked tasks
  2. For each task, it sums all session durations
  3. All task times are summed to get totalStudyTime for that concept

  Example Flow:

  Concept: "React Server Components"
    ├─ Task 1: "Learn RSC basics" (linked to this concept)
    │   ├─ Session 1: 25 min (Pomodoro)
    │   └─ Session 2: 25 min (Pomodoro)
    │   = 50 minutes total
    │
    └─ Task 2: "Build RSC demo app" (linked to this concept)
        ├─ Session 1: 25 min
        ├─ Session 2: 25 min
        └─ Session 3: 15 min
        = 65 minutes total

  Total time for "React Server Components" = 50 + 65 = 115 minutes

  Current Limitation:

  The concept card component (concept-card.tsx) does NOT display the total study time - it only shows counts of tasks, flashcards, and resources. The totalStudyTime is calculated by the
  API but would need to be displayed in a concept detail page (which doesn't exist yet based on the glob search results).

