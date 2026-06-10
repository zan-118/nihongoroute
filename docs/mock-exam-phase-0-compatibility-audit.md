# Mock Exam Phase 0 Compatibility Audit

## Goal

Phase 0 prepares the Supabase bank-soal migration without changing the current Sanity mock exam flow. The output of this phase is a clear compatibility contract and a pure adapter boundary that future Supabase data can pass through before reaching the existing `MockExamEngine`.

## Current Legacy Flow

- Exam list and details are loaded through `src/actions/exams.actions.ts`.
- Sanity `mockExam` documents remain the source for existing mock exams.
- The exam detail page renders `MockExamEngine` with an `ExamData` object.
- The client engine currently owns in-session state, local score calculation, result, and review views.

Legacy files to keep stable during early migration:

- `src/actions/exams.actions.ts`
- `src/app/(main)/exams/page.tsx`
- `src/app/(main)/exams/[id]/page.tsx`
- `src/components/features/exams/mock-engine/*`
- `sanity/schemaTypes/mockExam.ts`

## Existing Engine Contract

`ExamData` fields consumed by the current engine:

- `id`
- `title`
- `timeLimit`
- `passingScore`
- `description`
- `categorySlug`
- `levelCode`
- `choukaiAudioUrl`
- `questions`

`ExamQuestion` fields consumed by the current engine:

- `_key`
- `section`
- `questionText`
- `imageUrl`
- `audioUrl`
- `options`
- `correctAnswer`

Current section values:

- `vocabulary`
- `grammar`
- `reading`
- `listening`

## Adapter Boundary

The new adapter lives at:

- `src/lib/exams/supabase-adapter.ts`

Primary function:

```ts
toLegacyExamData(supabaseExamPackage): ExamData
```

The adapter intentionally maps the future Supabase package shape into the current engine shape. This lets Phase 1 and Phase 2 build the database/session flow while the UI keeps working.

## Mapping Rules

- `sessionId || templateId || id` -> `ExamData.id`
- `title` -> `ExamData.title`
- `timeLimitMinutes` -> `ExamData.timeLimit`
- `passingScore` -> `ExamData.passingScore`
- `jlptLevel` -> lowercase `ExamData.levelCode`
- `choukaiAudioUrl` -> `ExamData.choukaiAudioUrl`
- `question.id` -> `ExamQuestion._key`
- `question.sessionType` -> `ExamQuestion.section`
- `question.promptHtml || passage.contentHtml` -> `ExamQuestion.questionText`
- `question.visualUrl || passage.visualUrl` -> `ExamQuestion.imageUrl`
- `question.audioUrl || passage.audioUrl` -> `ExamQuestion.audioUrl`
- `choices[].value` for text choices -> `ExamQuestion.options[]`
- image choices -> temporary text fallback until rich choice UI exists
- `correctChoiceIndex` -> `ExamQuestion.correctAnswer`

## Known Limitations

- Passage layout is not yet rendered as a separate reading/listening panel.
- Image choices are converted into text fallback labels until Phase 4 extends the UI.
- Client-side scoring remains in place for legacy compatibility. Final v2 scoring still needs to move server-side in a later phase.
- The adapter currently accepts URL-ready asset fields. Storage path resolution should be added when Phase 1 creates the storage/schema layer.

## Phase 0 Acceptance Checklist

- Existing Sanity flow remains untouched.
- A Supabase package can be mapped into the existing `ExamData` shape.
- Adapter behavior is covered by unit tests.
- Future schema work has a stable frontend contract to target.
