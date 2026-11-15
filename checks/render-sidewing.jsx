// SideWing renders on every screen, so a ReferenceError in it kills the app.
// My earlier harness rendered App, whose failure on a fake-window shim masked
// exactly this bug. Rendering the component on its own does not.
import { renderToString } from 'react-dom/server'
import SideWing from '/home/claude/learningscience/src/components/SideWing.jsx'
import { data } from '/home/claude/learningscience/src/assignmentModel.js'

const cases = [
  { label: '계획 없음', props: { stepCompletion: {}, planEntries: [] } },
  {
    label: '계획 있음',
    props: {
      stepCompletion: { [data.assignments[0].steps[0].id]: true },
      planEntries: [
        {
          stepId: data.assignments[0].steps[0].id,
          assignmentId: data.assignments[0].id,
          slotAt: '2026-11-17T05:00:00.000Z',
          minutes: 60,
        },
      ],
    },
  },
]

// The crash the user hit: a chunked assignment with no stated deadline.
data.assignments.push({
  id: 'asg-nodue-check',
  subjectId: data.assignments[0].subjectId,
  title: '마감일 없는 과제',
  dueAt: null,
  steps: [{ id: 'step-nodue-1', title: '1단계', description: '' }],
})
cases.push({ label: 'dueAt null 포함', props: { stepCompletion: {}, planEntries: [] } })

let failed = 0
for (const item of cases) {
  try {
    const html = renderToString(<SideWing {...item.props} />)
    if (!html || html.length < 20) throw new Error('빈 출력')
    console.log(`PASS  ${item.label} (${html.length}자)`)
  } catch (error) {
    console.log(`FAIL  ${item.label} → ${error.message}`)
    failed += 1
  }
}
process.exitCode = failed ? 1 : 0
