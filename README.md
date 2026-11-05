# 차곡차곡

The LearningScience prototype, reorganized as one web app under the 차곡차곡 name. A student sees what to do now, opens an assignment, and works through checkpoints. The same completion state feeds the 차곡 블록 on the board.

The assignment guide still follows three learning-science ideas:

- **Signaling.** Requirement phrases in the original instruction are marked, and each mark carries a text label.
- **Segmenting.** Each assignment is already split into the steps supplied in the mock file.
- **Progressive disclosure.** The guide shows one active step. The step list stays visible so the learner can open another step directly.

There is no backend, database, account, or language model. Assignment cards, steps, deadlines, and the weekly timetable come from `src/data/assignments.mock.json`. The sociology and educational-psychology instructions are marked as demo data in that file.

User-facing copy and the mock assignment are in Korean. Code and this document are in English.

## Visual direction

The interface follows the app-screen workflow of the [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`), not the landing-page workflow, and uses the 차곡차곡 palette from the reference prototype.

- Ground `#f9f4ef`, ink `#020826`, actions `#716040`, side wing `#125042`.
- The wordmark stays in the header. 곰곰이 opens the class chat from the side wing.
- 차곡 블록 are small squares, one per step, filled as steps are checked.
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
  assignmentModel.js
  data/assignments.mock.json
  components/
    SubjectBoard.jsx
    GuideView.jsx
    TodoPage.jsx
    Timetable.jsx
    SideWing.jsx
    ChatRoom.jsx
    ChagokBlocks.jsx
```

`src/data/assignments.mock.json` is the only assignment source. It is the supplied file, unchanged. Completion and typed responses live in React state, keyed by the step and criterion ids in that file.

## What the demo does

1. The first screen is the hero. Scrolling reveals the three subject cards.
2. Each card shows the deadline as 마감 MM월 DD일 HH:mm, a computed D-day, step checkboxes, and **자세히 보기**.
3. In the guide, recording every criterion for a step, or clicking **이 단계 완료**, completes that step and moves to the next one. There are no 이전 or 다음 buttons.
4. **시간표 등록** explains that registration is not saved. Class blocks open that subject’s 할 일.
5. 곰곰이 opens a class chat labeled as prepared examples, not a live model.
6. `prefers-reduced-motion: reduce` shows the board and steps without the travel.
