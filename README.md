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
    ProgressRing.jsx
    LecturePage.jsx
    LectureUnderstanding.jsx
    TxtUpload.jsx
    ClovaGuideDialog.jsx
    RecordingNoticeDialog.jsx
    Modal.jsx
    WeekPlanPanel.jsx
    ReplanPanel.jsx
    communication/     ← 소통 준비하기 (7개 컴포넌트)
    review/            ← 복습 및 개인 공부 모듈
  services/tutorService.js
  services/mockTutorService.js
  utils/chunkSearch.js
    BearPanel.jsx
    PlanSheet.jsx
  lectureNotes.js
  weekPlan.js
  planTime.js
  planValidation.js
  jsonSchema.js
  planAgent.js
  communication.js
  data/planAgent.mock.json
  data/communication.mock.json
docs/
  Commu_SysPrompt.txt
  schemas/planProposal.schema.json
  schemas/planDocument.schema.json
public/guide/
  Clova_Join.png
  Clova_Login.png
```

`src/data/assignments.mock.json` is the only assignment source. It is the supplied file, unchanged. Completion and typed responses live in React state, keyed by the step and criterion ids in that file.

## What the demo does

1. The first screen is the hero. Scrolling reveals the three subject cards.
2. Each card shows the deadline as 마감 MM월 DD일 HH:mm, a computed D-day, a progress ring, and **강의탭 이동**, which opens that lecture's page.
3. In the guide, recording every criterion for a step, or clicking **이 단계 완료**, completes that step and moves to the next one. There are no 이전 or 다음 buttons.
4. **시간표 등록** explains that registration is not saved. Class blocks open that subject’s 할 일.
5. 곰곰이 opens a class chat labeled as prepared examples, not a live model.
6. `prefers-reduced-motion: reduce` shows the board and steps without the travel.

## 강의탭 (v2.1)

**강의탭 이동** on a home card opens one lecture, split into the three kinds of work a week holds. The page scrolls freely; the sections are told apart by their cards and headings, not by pulling the viewport to a boundary. The v2.1 spec asked for `scroll-snap-type: y proximity`, and it was built that way, but settling onto a section fought the reader, so the snapping was taken out. `scroll-behavior: smooth` is kept for anchor and scripted jumps and dropped under `prefers-reduced-motion: reduce`.

1. **강의 이해 지원.** 차곡차곡 records nothing itself. **강의 녹음하기** shows the ClovaNote walkthrough to a first-time learner, then the pre-recording notice; only **확인했습니다** opens `clovanote.naver.com` in a new tab, so Escape and a backdrop click leave the learner where they are. **클로바노트 사용법 보기** reopens the walkthrough at any time.
2. **과제 수행.** The existing assignment guide, embedded unchanged.
3. **복습 및 개인 공부.** Labelled 준비 중. Nothing here pretends to work yet.

Notes are kept per lecture, so one lecture's transcripts never appear under another.

### ClovaNote walkthrough

Two cases, each with a screenshot of the service's front page: 처음 사용해요 points at 개인용 시작하기, 이미 사용하고 있어요 points at 로그인. The walkthrough shows itself once; `localStorage` under `chagok.clovaGuideSeen` remembers that it has been read, and a storage failure simply means it shows again. 차곡차곡 never signs in to that service and does not track whether the learner has an account there.

### TXT upload

`src/lectureNotes.js` holds the file rules — `.txt` only, 3MB ceiling, empty-file and read-failure messages — with no React in it, so the processing and the UI can change apart from each other. `TxtUpload.jsx` is the drop zone: click or drag, a highlight while dragging, the file name, size and upload time, a preview of the text, and a delete button that clears the entry.

Each accepted file becomes `{ lectureId, fileId, fileName, fileSize, text, uploadedAt }` — the shape a later retrieval step would index. Nothing is sent anywhere: the text is read with the File API, held in React state, and lost on reload. There is no embedding, no vector search, and no model call.

## 복습 및 개인 공부 (v2.3)

The third section of 강의탭 used to say 준비 중. It now runs on the TXT files the learner already uploaded to 강의 이해 지원 — **one uploader, two sections**. `materialsFor()` in `src/lectureNotes.js` is the adapter: it turns a stored note into the `{ materialId, courseId, fileName, content, chunks }` the module expects, splitting the text into paragraph chunks on the way.

Pick a lecture record, then one of four ways in:

| | |
| --- | --- |
| 강의 내용 확인하기 | 원문과 발췌 문단 |
| 핵심 내용 파악하기 | 어려운 용어를 쉬운 말로 |
| 이해 여부 점검하기 | OX·빈칸 문제 |
| 부족한 부분 다시 학습하기 | 틀린 문제와 그 근거가 된 원문 |

Every claim carries the paragraph it came from, quoted underneath, so a learner can check it against the lecture rather than taking it on trust.

### 시연 범위 — 지금 할 수 없는 것

The module ships as a demo and says so on screen. These limits are real and none of them is papered over:

- **실제 OpenAI API, AI 요약, 의미 검색은 없습니다.** 요약은 원문 문단을 발췌한 것이고, 화면에도 그렇게 적혀 있습니다.
- 용어 설명과 문제는 미리 적어 둔 **학습과학 용어 몇 개**에만 반응합니다. 아무 강의 TXT나 이해하지는 못합니다.
- 퀴즈 정답이 클라이언트 코드에 있어 **평가 용도로 쓸 수 없습니다.**
- 오답 기록은 화면 상태일 뿐 저장되지 않습니다.
- 청크 검색은 **단순 키워드 일치**입니다.
- `apiTutorService`가 호출할 `/api/tutor` 서버는 아직 없습니다.
- 수업별 접근 제한, 인증, 외부 전송 동의와 삭제 정책은 실제 사용 전에 구현해야 합니다.

A TXT that is deleted takes its analysis and its wrong answers with it — keeping them would answer questions about a lecture the learner no longer has. `materialId` is unique per upload, so re-uploading the same file starts clean.

`docs/tutor-demo/` holds the sample lecture TXT files to upload while demonstrating, and `docs/Commu_SysPrompt.txt` the communication prompt.

### LLM으로 바꿀 자리

`src/services/tutorService.js` — one line points at the mock. An API provider returning the same `{ schemaVersion, materialId, mode, status, data, provider }` changes nothing above it; `ReviewStudyPage` already refuses a response whose `materialId`, `mode` or `schemaVersion` does not match what it asked for.

## 소통 준비하기 (v2.2)

Asking for help is its own skill, and a learner stuck on a question often cannot start the sentence. 곰곰이 asks four things and hands back a message to send. The panel opens from the card on the home board or from the 소통 준비하기 tab; **과제 도움받기** is the class chat, unchanged.

### 네 단계

1. **상대방과 상황** — 조원과 소통하기 or 교수님께 질문하기, then one of that person's three difficulties.
2. **확인할 정보** — each item gets 알고 있어요 / 알고 싶어요 / 잘 모르겠어요. All of them must be answered before moving on: what the learner does not know is what the question will be about.
3. **현재 상황 입력** — their own words, or 예시 사용하기 to drop in this situation's prepared example.
4. **질문 문장** — a medium (이메일 · 메시지 · 대면 질문, by recipient), an editable draft, 원래 문장으로 되돌리기, 문장 다시 구성하기, 문장 복사하기.

### 여섯 시나리오

| 상대 | situationId | 확인할 정보 | 매체 |
| --- | --- | --- | --- |
| 조원 | `role_unclear` | 담당 작업 · 결과물 형식 · 완료 기준 · 마감 기한 | 메시지 · 대면 |
| 조원 | `schedule_coordination` | 가능한 시간 · 중간 점검일 · 최종 마감일 | 메시지 · 대면 |
| 조원 | `message_unclear` | 요청의 의미 · 작업 범위 · 우선순위 · 결과물 형식 | 메시지 · 대면 |
| 교수님 | `assignment_unclear` | 과제의 목적 · 필수 내용 · 평가 기준 · 제출 형식 · 마감 기한 | 이메일 · 메시지 · 대면 |
| 교수님 | `lecture_unclear` | 핵심 개념 · 어려운 용어 · 개념 간 관계 · 구체적인 사례 · 참고 자료 | 이메일 · 메시지 · 대면 |
| 교수님 | `presentation_help` | 발표의 핵심 내용 · 발표 구성 · 예상 질문 · 답변 방법 · 평가 기준 | 이메일 · 메시지 · 대면 |

Fifteen prepared sentences in all, one per situation per medium, every one different. An email carries a greeting and a closing, a message is short, and a spoken question is one run of plain sentences. Each situation also carries an `exampleContext`; the two the original spec wrote are kept word for word and marked `exampleSource: "spec"`, the four written for this round are marked `"added"`.

### 무엇을 짓고 무엇을 짓지 않는가

There is no model behind this. The honest line runs through `contextSource`:

- The box still holds a prepared example, untouched → the prepared sentence answers it, and 곰곰이 uses the spec's wording.
- The learner typed their own words, or changed the example by a character → the sentence is a **template wrapped around their text, carried through as written**, and the panel says so: 적어 주신 내용은 고치지 않고 그대로 넣었어요. 곰곰이가 뜻을 읽은 것은 아니에요.

A prepared sentence is never presented as a reading of something the learner typed. `basis` on every draft says which of the two it is, so no screen can be mistaken about it. Nothing is added that the learner did not supply — `(학번) (이름)` is a blank for them to fill, the convention the spec's own examples use, not an invented identity. Nothing is sent anywhere; they copy the text and send it themselves.

Edits are kept apart from the original: `generatedText` never changes, `editedText` holds the learner's version, and 복사 takes `editedText` when `isUserEdited`. 원래 문장으로 되돌리기 drops the edit.

Korean particles are chosen from the last syllable's final consonant — 마감 기한**은**, 작업 범위**를** — rather than written 은(는).

### CommunicationDraft 계약

```json
{
  "schemaVersion": 1, "source": "mock", "status": "ready",
  "recipientId": "professor", "situationId": "assignment_unclear", "channel": "email",
  "basis": "prepared-example",
  "identifiedNeeds": ["과제에서 사용할 이론의 개수 확인"],
  "draft": { "generatedText": "교수님, 안녕하세요. …", "editedText": null, "isUserEdited": false }
}
```

### LLM으로 바꿀 자리

`generateDraft(session)` in `src/communication.js`. A Communication Agent returning the same draft changes nothing above it — the panel collects answers and renders what came back. `docs/Commu_SysPrompt.txt` is the prompt it would run. All wording and choices come from `src/data/communication.mock.json`; the components hold no copy of their own, and `src/components/communication/` splits them one per job: `CommunicationPanel` · `RecipientSelector` · `SituationSelector` · `InformationSelector` · `ContextInput` · `ChannelSelector` · `DraftEditor`.

## 이번 주 계획 (v2.2)

The assignment steps are already split up. What this adds is deciding **when** to do a few of them, and re-deciding when an hour goes by unused. `src/weekPlan.js` holds the rules with no React in it; the panels only ask the questions.

### 기능 A. 이번 주 계획 세우기

「이번 주 계획 세우기」 sits in the 이번주 block, and nowhere else: one way in, beside the week it fills. It opens 곰곰이 as a centred popup: the planning conversation needs more room than a side rail gives, and 고르기 and 언제 할지 are one scrolling conversation rather than two pages, so a learner can scroll back to what they picked while deciding the next thing.

- **처음 한 번만:** two choices of equal size — 먼저 예시를 볼까요 opens a finished example plan built from the learner's own steps and labelled 예시, 나도 세워 볼게요 goes straight to picking.
- **둘째 주부터:** 지난주 계획, 어땠나요? 일부만 or 못 했어요 leads to 시간을 더 짧게 / 단계를 더 적게 / 다른 시간에. 더 짧게 starts the duration at 10분; 더 적게 caps the week at two steps.
- **1/2 고르기:** as many steps as the learner wants, ordered by 마감이 가까운 것부터 or 어려운 것부터.
- **2/2 언제:** a free hour from the timetable, then 10·20·40분, then 이렇게 할까요?
- **완성:** the plan fills the 이번주 block, and 인쇄하기 puts it on one sheet for a notebook.

이번주 and 이번 주 남은 할 일 are one block. It counts the week the learner took on, not every step in every assignment: 차곡 블록 are one per planned step and fill as those steps are ticked, so the squares stand for a week someone chose rather than a dozen handed over at the start. Before a plan exists the block has nothing to count and asks for one instead.

목표일 is counted back from the deadline — the last step two days before it, each earlier step one day before the next — and the panel says so where the learner can read it. 나의 할 일 shows a target date on the step in hand only, so the list does not read as a wall of deadlines.

'어려운 것부터' is ordered by how many completion criteria a step has, with later steps counting as harder. The assignment file has no difficulty field and none was added to it; this is an ordering, not a claim about the step.

빈 시간 comes from the timetable in `assignments.mock.json`: weekday hours between 09:00 and 18:00 that no class occupies and that have not already passed, at most two a day so the choice reads as *which day*. Late in the week it rolls into next week's hours, labelled 다음 주.

### 기능 B. 계획 다시 짜기

Not visible in the ordinary case. When an hour set aside in the plan goes by and the step is not ticked, that row reads 아직이에요 and grows a 「다시 정하기」 button. 곰곰이 asks 언제 다시 해 볼까요?, shows 원래 목표 and 마감 for context, offers the free hours again, and offers to cut the sitting to 10분.

The copy avoids 지연 and 실패 throughout: a missed hour is 아직이에요, and the question is about the next attempt, not the last one.

### 계약과 검증

두 가지 모양이 한 방향으로 흐른다.

```
PlanProposal   { entries: [{ stepId, scheduledAt, minutes }] }
     │           planner가 정하는 것 — 지금은 mock, 나중엔 LLM agent
     ▼  buildPlan()
Plan Document  최상위 7필드 + entry 12필드
                 제목·과목·마감·단계 순서는 과제 데이터에서 조회
```

A planner decides three things per entry and nothing else, so there is nothing it can copy wrongly. `buildPlan()` looks up the rest. Both schemas are in `src/schemas/`, and `src/jsonSchema.js` checks against them — a small checker rather than Ajv, because this workspace cannot reach the npm registry; it reports which keywords it skipped rather than passing them off as checked.

**시간.** Every timestamp stored or exchanged is UTC ISO with milliseconds, `createdAt`·`scheduledAt`·`dueAt` alike; the assignment file's `+09:00` is normalized on the way in. `weekOf` and `targetDate` stay `YYYY-MM-DD`. Every date, weekday and week boundary is worked out in Asia/Seoul (`src/planTime.js`) whatever timezone the browser is in, and screens convert back to Seoul to display. Sorting and conflict checks compare real instants, not strings.

**날짜 표시.** Every time-picking button and the echo under it reads `11월 13일(금) 11:00`, from one function — `formatSeoulDateTime` in `src/planTime.js` — built from the entry's own `scheduledAt`. A year is shown only when the slot falls in a different year from today, so a plan made in late December reads `2027년 1월 5일(월) 09:00`. 다음 주 월 was dropped from the buttons: a weekday alone makes the reader work out which week is meant. The short form stays where room is tight — the plan list in the 이번주 block and in 나의 할 일.

**얼마나 고를지.** There is no 2–3 cap. A learner takes on what they can, and the free hours offered grow with the number of steps picked. `settings.maxPicks` is `null` for an uncapped week; it holds a number only when the learner chose 단계를 더 적게 in 돌아보기, and then it is enforced. Both schema files were widened for this: `entries.maxItems` is gone and `maxPicks` accepts an integer or `null`.

**검증.** `validatePlan()` in `src/planValidation.js` is a pure function — no React, no DOM, no storage — so the backend can run the same gate when the agent moves server-side. Beyond the schema it checks: real calendar dates and instants, `entries` within `settings.maxPicks`, the step exists in the assignment data, no duplicate step, no step already finished, no overlap between sittings, no overlap with a registered class, nothing newly scheduled in the past, and nothing beyond next week.

A sitting after its own deadline is a warning, not a refusal — it is shown and the learner decides. A past `targetDate` is fine; it is what 계획 다시 짜기 is for. With no timetable registered the class check is reported as `skipped-no-timetable`, so "no conflict" is never confused with "not looked at".

A plan is stored only when the schema, the reference checks and the conflict checks all pass and the learner confirms. A refusal names the steps at fault in Korean and sends them back for another hour; the plan already saved is left untouched.

### 대화는 데이터, 계획은 JSON

What 곰곰이 says, and where each answer leads, is not written into the screen. It comes from `src/data/planAgent.mock.json` through `src/planAgent.js`: a turn names the lines to say, the widget that collects the answer, the effect the answer has (`시간을 더 짧게` sets the duration to 10 minutes) and the turn to go to next. The screen knows how to draw a step picker and a slot grid; it does not hold a single question. Putting a real agent behind this means returning turns of the same shape — the screen does not change.

The conversation hands back a plan document, and that document is what the rest of the app reads:

```json
{
  "schemaVersion": 1,
  "source": "mock",
  "createdAt": "2026-11-12T14:00:00.000Z",
  "weekOf": "2026-11-09",
  "review": { "lastWeek": "some", "adjust": "shorter" },
  "settings": { "sortMode": "due", "maxPicks": 2, "defaultMinutes": 10 },
  "entries": [
    {
      "stepId": "ls-s1",
      "assignmentId": "ls-cognitive-load-01",
      "assignmentTitle": "인지부하 이론과 나의 학습 사례 보고서",
      "subjectId": "learning-science",
      "subjectName": "학습과학",
      "colorToken": "brown",
      "stepNumber": 1,
      "stepTitle": "인지부하 이론 자료 찾기",
      "targetDate": "2026-11-07",
      "dueAt": "2026-11-12T23:59:00+09:00",
      "scheduledAt": "2026-11-13T02:00:00.000Z",
      "minutes": 20
    }
  ]
}
```

나의 할 일 reads that document and nothing else. Before a plan exists the page is empty and says so; after one, it lists only the steps the learner set aside time for, grouped by subject, each with the hour it was given. `assignments.mock.json` still supplies what the steps *are* — it no longer decides what a learner's week holds.

### What is not in this

No backend. The plan lives in React state and is gone on reload; only "has this learner planned before" is kept, in `localStorage` under `chagok.weekPlan.planned`, to decide between the example and the 돌아보기 question. 지난주 계획 is not stored, so the 돌아보기 step asks about it rather than showing it.

## 변경사항

디자인만 수정했습니다. 과제 데이터(`src/data/assignments.mock.json`)는 바꾸지 않았습니다.

### 전체
- 크림 바탕·흰 카드·갈색 버튼은 그대로 두고, 색 이름을 `App.css` 맨 위 `:root`에 모았습니다(`--kraft`, `--track`, `--hover`, `--fab` 등).
- 상태 색을 추가했습니다. 완료는 초록(`--done`), 진행 중은 갈색, 대기는 회색(`--wait`), 마감 7일 이내 D-day는 주황빨강(`--soon`)입니다.
- 마감 칩 색은 `assignmentModel.js`에 추가한 `dueChipClass()`가 정합니다. 날짜 계산 방식은 바꾸지 않았습니다.
- 페이지 제목은 28px·700, 작은 라벨은 600으로 맞추고, 칩 모서리는 6px로 통일했습니다.
- 문구를 "~해요" 말투로 맞추고 느낌표를 뺐습니다(시간표 등록 안내, 나의 할 일 안내, 시간표 안내).
- 대화창이나 시간표 등록 창이 열리면 뒤 화면을 살짝 흐리게 했습니다(`.scrim`).

### 상단 메뉴
- 오른쪽 로고를 지웠습니다.
- 메뉴(홈 / 나의 할 일 / 시간표)를 밑줄 탭으로 바꿨습니다.

### 홈
- 제목·슬로건 자리에 배너 이미지(`public/brand/hero-banner.webp`, 새 파일)를 넣었습니다. 원래 제목은 화면 읽기용(`sr-only`)으로 남겼습니다.
- "지금 무엇을 해야 하지?"를 "무엇부터 할까요?"로 바꾸고 아이콘을 뺐습니다.
- 과목 카드를 한 줄 행으로 바꿨습니다. 순서는 과목 이름, 과제명, D-day와 마감, 진행 원, 자세히 보기입니다.
- 과목 아이콘과 홈의 단계 체크박스는 뺐습니다.
- 진행 정도는 원형 게이지로 보여 줍니다(`src/components/ProgressRing.jsx`, 새 파일).

### 오른쪽 패널
- 세 장의 카드로 나눴습니다.
  - 이번주: 차곡 블록
  - 다가오는 마감: 과목별 마감일과 D-day. 끝난 과제는 "완료"로 표시
  - 이번 주 남은 할 일: 남은 단계 수와 "나의 할 일 보기" 버튼
- "가장 많이 이야기한 수업", "최근에 배운 것"은 뺐습니다.
- "질문하기" 버튼은 곰곰이 이미지(`public/brand/gomgomi-question.webp`, 새 파일)를 넣은 어두운 갈색 버튼으로 바꿨습니다. 가이드 화면에서는 "도움받기"가 있으므로 숨깁니다.

### 나의 할 일
- 과목을 아코디언으로 바꿨습니다. 한 번에 한 과목만 열리고, 시간표에서 수업을 누르면 그 과목이 열립니다.
- 각 단계 옆에 상태 칩(완료 / 진행 중 / 대기)을 붙이고, 다음에 할 단계 행을 강조했습니다.

### 가이드(자세히 보기)
- "돌아가기"를 "‹ 홈으로"로 바꿨습니다. 위쪽에 과목, 과제명, D-day, 진행 원을 모았습니다.
- 단계 경로는 번호 원을 선으로 잇고, 원 아래에 완료 / 진행 중 / 대기를 적었습니다. 끝낸 단계는 초록입니다.
- 과제 지시문은 접어 두었습니다(크라프트색 면). 접힌 상태에서도 "교수님 요구사항" 표시와 요구사항 칩이 보이고, 펼치면 원문과 요구사항 표가 나옵니다.
- 단계 카드는 "N단계 / 4단계", 힌트(흰 바탕에 테두리), 완료 기준 순서입니다. 완료 기준은 번호 원을 선으로 이은 순서로 바꿨습니다.
- 입력란은 흰 바탕에 진한 테두리입니다. 저장하면 번호 원, 선, "저장됨" 버튼이 초록으로 바뀝니다.
- "이 단계 완료"와 "막혔나요? 도움받기"를 카드 맨 아래 한 줄로 모았습니다. 완료된 단계의 버튼은 "이 단계 완료됨"(초록)입니다.
- "도움받기"를 누르면 그 과목으로 곰곰이 대화가 열립니다.

### 곰곰이에게 질문하기
- 화면 가운데 창 대신 오른쪽 패널(폭 420px)로 열립니다.
- 제목과 과목 탭을 크라프트색 띠로 묶고, 부제에 "지금 단계: ○○"를 보여 줍니다.
- 처음에는 "어떤 점이 어려운가요?"와 선택지 3개를 곰곰이 말풍선 바로 아래에 보여 줍니다.
  - 어디서 시작해야 할지 모르겠어요
  - 어려운 말이 있어요
  - 제대로 했는지 확인하고 싶어요
- 답 다음에는 "예시 보기 / 하나씩 따라 하기 / 이제 할 수 있어요" 버튼이 같은 자리에 나옵니다.
- 답은 데이터 파일에 있는 지금 단계의 힌트, 예시, 완료 기준으로 만듭니다.
- 과목 탭을 바꾸면 대화가 처음부터 시작되고, 새 메시지가 오면 아래로 스크롤됩니다.

### 시간표
- 제목 아래에 안내 문구를 넣고, 오늘 요일에 "오늘" 칩과 옅은 배경을 넣었습니다.
- 수업이 있는 시간까지만 보여 줍니다(마지막 수업이 끝나는 시각까지).
- 틀 선을 1.5px로 진하게 하고, 요일은 가운데 정렬, 시각은 보통 굵기로 바꿨습니다.
- 수업 블록 위아래에 2px 여백을 두었습니다.

### 기타
- 차곡 블록 애니메이션을 튀지 않는 움직임으로 바꿨습니다(`src/components/ChagokBlocks.jsx`).
