# Learning Support Prototype

A small academic prototype that helps a university student read one assignment, see its requirements, and work through it one step at a time.

The screen is built around three learning-science ideas:

- **Signaling.** Requirement phrases in the original instruction are marked, and each mark carries a text label.
- **Segmenting.** The assignment is a short sequence of steps.
- **Progressive disclosure.** Only the active step shows its description. Completion is kept while moving between steps.

There is no backend, database, account, or language model. The only assignment the demo can analyze is the sample in `src/data/mock_task.json`.

User-facing copy and the mock assignment are in Korean. Code and this document are in English.

## Visual direction

The interface follows the app-screen workflow of the [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`), not the landing-page workflow.

Dealt style: **Achromatic ledger** (light, seed `1024251793`).

- Chrome stays ink. The primary action is near-black.
- The ground is a blue-grey study tone (`#f2f4f7`). Cards stay white.
- One hue, `#1d5fbf`, marks the current step and the progress fill.
- The product’s own mark is a margin bracket beside the name **학습 길잡이**.
- The shell has no sidebar. This prototype has a single screen, so extra navigation would be invented.

The dealt “tabbed object detail” pattern assumed charts and summary figures. This assignment has neither, so the screen is a study view: the current step, progress, and the marked instruction.

Geist is the text face named by the sheet. IBM Plex Sans KR sits behind it in the same stack so Hangul, which Geist does not cover, still renders in a grotesk.

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
  data/mock_task.json
  components/
    TaskInput.jsx
    RequirementView.jsx
    StepCard.jsx
```

`src/data/mock_task.json` is the only source of assignment content. `src/taskModel.js` matches the sample, splits requirement phrases, and computes progress from completed steps. A later API response can replace the JSON without rewriting the components.

## What the demo does

1. The instruction field opens with the sample assignment.
2. **과제 분석하기** shows the prepared analysis.
3. If the text is not the sample, the screen explains that this demo cannot analyze it and does not invent a result.
4. **이전** and **다음** move between steps. **이 단계 완료** toggles completion. The percentage counts completed steps, not the open step.
5. Changing steps uses a short move. `prefers-reduced-motion: reduce` leaves the content in place with no travel.
