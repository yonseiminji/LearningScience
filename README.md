# 차곡차곡

The LearningScience prototype, reorganized as one web app under the 차곡차곡 name. A student sees what to do now, opens an assignment, and works through checkpoints. The same completion state feeds the 차곡 블록 on the board.

The assignment guide still follows three learning-science ideas:

- **Signaling.** Requirement phrases in the original instruction are marked, and each mark carries a text label.
- **Segmenting.** The same assignment can be shown as broad, detailed, or very small actions.
- **Progressive disclosure.** After analysis, the learner chooses a step size. Only the active step shows its completion criterion. Completion stays with that step size.

There is no backend, database, account, or language model. The only assignment the demo can analyze is the sample in `src/data/mock_task.json`. Other board tasks are predefined checkpoints. The weekly timetable is read-only mock data.

User-facing copy and the mock assignment are in Korean. Code and this document are in English.

## Visual direction

The interface follows the app-screen workflow of the [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`), not the landing-page workflow, and uses the 차곡차곡 palette from the reference prototype.

- Ground `#faf5ee`, cards white, ink `#3e3029`, actions `#8a5a3c`.
- The wordmark and 곰곰이 sit in the header. The mascot does not sit on task cards.
- 차곡 블록 are small squares, filled as steps are checked.
- The side wing is deep purple with light text, and holds 이번주, 가장 많이 이야기한 수업, and 최근에 배운 것.
- Text is Chiron GoRound TC, the face shipped with the reference prototype (SIL OFL 1.1).

## Install the Taste Skill

`design-taste-frontend` was not installed in this environment. To install it in Cursor:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

The skill’s scripts need Node.js 22 or newer and Chrome, Edge, or Chromium. They do not install packages and do not need an API key.

## Run locally

```bash
npm install
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`. `npm run preview` serves that build.

## Deploy to Vercel

This repository has not been deployed. To publish it yourself:

1. Push the branch to GitHub.
2. In Vercel, import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. Vercel will give the site a public URL. No account is required to open that URL.

No environment variables are required.

## Project layout

```text
index.html
package.json
vite.config.js
src/
  main.jsx
  App.jsx
  App.css
  taskModel.js
  studyModel.js
  data/mock_task.json
  data/study.json
  components/
    TaskInput.jsx
    RequirementView.jsx
    StepCard.jsx
    SupportLevelDialog.jsx
    TaskBoard.jsx
    TodoPage.jsx
    Timetable.jsx
    SideWing.jsx
    ChagokBlocks.jsx
```

`src/data/mock_task.json` holds the one assignment the analyzer understands, with grouped requirements and three support levels. `src/data/study.json` holds the weekly classes, the other checkpoint lists, and the side-wing notes taken from the reference prototype. Completion for the analyzed assignment stays separate per support level.

## What the demo does

1. Home opens on the to-do board and answers 지금 무엇을 해야 하지?
2. **나의 할 일** lists checkpoints. Checking one updates that task’s 차곡 블록 on the home board.
3. **과제 안내 열기** keeps the original analysis flow. **과제 분석하기** asks 과제를 시작하기에 어떤 상태인가요? and then shows standard, detailed, or micro steps.
4. If the instruction is not the sample, the screen says this demo cannot analyze it.
5. **이전** and **다음** move between steps and do not mark a step complete. **이 단계 완료** toggles completion.
6. **시간표** is a read-only week grid. There is no timetable editor, class chat, mail helper, or separate understanding-check screen.
7. The side wing shows 이번주, 가장 많이 이야기한 수업, and 최근에 배운 것.
8. `prefers-reduced-motion: reduce` leaves step changes in place with no travel.
