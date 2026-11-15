import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Network } from 'lucide-react'

/**
 * The concept diagram, drawn when mermaid is available and described in words
 * when it is not.
 *
 * mermaid is not a dependency of this project yet, so the import is dynamic
 * and its absence is an expected state rather than an error: the panel falls
 * back to the diagram's alt text, which every template carries. The spec asks
 * for that fallback anyway, for the times rendering fails in a browser that
 * does have mermaid.
 *
 * Nothing here injects a string into the DOM as HTML. mermaid runs with
 * securityLevel 'strict', which turns off HTML labels and click handlers, and
 * the SVG it returns is placed through a ref rather than dangerouslySetInnerHTML
 * so the fallback path never touches innerHTML at all.
 */
export default function ConceptDiagram({ diagram }) {
  const [state, setState] = useState('loading') // loading | drawn | text
  const [reason, setReason] = useState('')
  const host = useRef(null)

  useEffect(() => {
    let alive = true
    async function draw() {
      try {
        // The specifier is a variable and the import is ignored by the
        // bundler on purpose. mermaid is not installed here, and a literal
        // import('mermaid') is a build error rather than a missing module at
        // runtime — which would mean this component could not ship at all
        // until the package lands. This way the build passes either way and
        // the diagram draws itself the moment mermaid is installed.
        const name = 'mermaid'
        const mermaid = (await import(/* @vite-ignore */ name)).default
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', htmlLabels: false })
        // Syntax first. A string that parses is still only a string that
        // parses — whether it says something true was settled on the server.
        await mermaid.parse(diagram.mermaidCode)
        const { svg } = await mermaid.render(`d-${diagram.visualId}-${Date.now()}`, diagram.mermaidCode)
        if (!alive) return
        if (host.current) {
          host.current.replaceChildren()
          const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml')
          const node = parsed.documentElement
          node.setAttribute('role', 'img')
          node.setAttribute('aria-label', diagram.altText)
          host.current.append(node)
        }
        setState('drawn')
      } catch (problem) {
        if (!alive) return
        setReason(String(problem?.message || problem))
        setState('text')
      }
    }
    draw()
    return () => {
      alive = false
    }
  }, [diagram.mermaidCode, diagram.visualId, diagram.altText])

  return (
    <figure className="concept-diagram">
      <figcaption>
        <Network aria-hidden="true" size={15} />
        {diagram.title}
      </figcaption>

      {state === 'loading' ? <p className="concept-note">관계도를 그리고 있어요…</p> : null}

      {/* Scrolls sideways rather than shrinking, so the labels stay readable
          on a phone. */}
      <div className="concept-diagram-canvas" ref={host} hidden={state !== 'drawn'} />

      {state === 'text' ? <p className="concept-diagram-alt">{diagram.altText}</p> : null}

      {diagram.caveat ? (
        <p className="concept-watch">
          <AlertTriangle aria-hidden="true" size={14} />
          {diagram.caveat}
        </p>
      ) : null}

      {diagram.humanReviewed === false ? (
        <p className="concept-note">이 관계도는 아직 사람이 원전과 대조하지 않았어요.</p>
      ) : null}

      {state === 'text' && reason ? <p className="concept-note">그림 대신 설명으로 보여드려요.</p> : null}
    </figure>
  )
}
