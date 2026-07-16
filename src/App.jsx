import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  createContourSet,
  createScenarioSummary,
  DECISION_USE_NOTICE,
  FICTION_NOTICE,
  getEvidence,
  getLensPosition,
  getNearestStop,
  NO_ENGAGEMENT_NOTICE,
  REGION,
  SCENARIO_ORDER,
  SYNTHETIC_NOTICE,
} from './data/region.js'

const TerrainScene = lazy(() => import('./components/TerrainScene.jsx'))

const CHAPTERS = [
  {
    id: 'access',
    number: '01',
    title: 'Access is not distance.',
    state: 'baseline',
    stop: 'E1',
    finding: 'The Baseline surface rises where frequency, handoffs, and ground variability accumulate. The shortest line is not the shortest journey.',
    prompt: 'What does the current trip actually contain?',
  },
  {
    id: 'transfer',
    number: '02',
    title: 'A transfer is a ridge.',
    state: 'proposed',
    stop: 'T1',
    finding: 'C1 lowers the central surface, but T1 remains visible. A planned handoff is still part of the proposition.',
    prompt: 'Where does reliability change hands?',
  },
  {
    id: 'dwell',
    number: '03',
    title: 'Endpoint dwell can erase speed.',
    state: 'proposed',
    stop: 'E2',
    finding: 'Arrival, weather protection, accessibility, luggage, and dispatch add fourteen assumed minutes at E2. They are designed, not hidden.',
    prompt: 'How long is the part before movement?',
  },
  {
    id: 'noise',
    number: '04',
    title: 'A limit stays a limit.',
    state: 'proposed',
    stop: 'E2',
    finding: 'N1 is excluded from C1 and C2. The Proposed surface improves access without treating a synthetic limit as negotiable.',
    prompt: 'What does the system refuse to solve by crossing?',
  },
  {
    id: 'energy',
    number: '05',
    title: 'Energy is an operating assumption.',
    state: 'proposed',
    stop: 'B1',
    finding: 'The energy layer is an illustrative comparison index in kWh-equivalent per passenger journey. It is not an engineering estimate or reduction claim.',
    prompt: 'Which assumption powers the timetable?',
  },
  {
    id: 'resilience',
    number: '06',
    title: 'Resilience is a recovery plan.',
    state: 'disrupted',
    stop: 'T1',
    finding: 'The fixed W1 case reduces the service window, restores an alternate transfer, and extends recovery. It is a deterministic scenario, not a forecast.',
    prompt: 'What happens when the preferred path is unavailable?',
  },
]

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

function ScenarioMark({ stateId }) {
  return <span className={`scenario-mark scenario-mark-${stateId}`} aria-hidden="true" />
}

function FictionNotice({ compact = false }) {
  return (
    <p className={compact ? 'fiction-notice compact' : 'fiction-notice'}>
      <span aria-hidden="true">CONCEPT 07</span>
      {FICTION_NOTICE}
    </p>
  )
}

function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Avenor Passage Systems, back to top">
        <span className="wordmark-symbol" aria-hidden="true"><i /><i /><i /></span>
        <span>AVENOR<br />PASSAGE SYSTEMS</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#scenario">Scenario</a>
        <a href="#corridors">Corridors</a>
        <a href="#method">Method</a>
        <a href="#studio">Studio</a>
      </nav>
      <a className="button button-small" href="#study">Commission a study</a>
    </header>
  )
}

function Legend({ selectedState }) {
  return (
    <div className="map-legend" aria-label="Scenario legend">
      <p>Scenario state</p>
      <ul>
        {SCENARIO_ORDER.map((stateId) => (
          <li key={stateId} aria-current={selectedState === stateId ? 'true' : undefined}>
            <ScenarioMark stateId={stateId} />
            <span>{REGION.states[stateId].label}</span>
          </li>
        ))}
      </ul>
      <small>Line pattern repeats state identity in print and low-color settings.</small>
    </div>
  )
}

function RegionMap({ stateId, lensValue = 35, introActive = false, compact = false, corridorId = null }) {
  const lens = getLensPosition(lensValue)
  const currentState = REGION.states[stateId]
  const contours = createContourSet(stateId, compact ? 42 : 58)
  const reactId = useId().replace(/:/g, '')
  const titleId = `map-title-${reactId}`
  const descriptionId = `map-desc-${reactId}`
  const clipId = `region-clip-${reactId}`
  const forwardPatternId = `forward-hatch-${reactId}`
  const reversePatternId = `reverse-hatch-${reactId}`
  const visibleCorridors = corridorId
    ? REGION.corridors.filter((corridor) => corridor.id === corridorId)
    : REGION.corridors

  return (
    <figure className={`region-map ${introActive ? 'intro-map-active' : ''} ${compact ? 'compact-map' : ''}`}>
      <div className="map-plot">
        <svg viewBox="0 0 1000 700" role="img" aria-labelledby={titleId} aria-describedby={descriptionId}>
          <title id={titleId}>{REGION.id}, {currentState.label} time surface{corridorId ? `, ${corridorId} concept` : ''}</title>
          <desc id={descriptionId}>A wholly synthetic APS-SR-01 time surface with endpoints E1 and E2, transfer point T1, corridors C1 and C2, constraints N1, W1, and G1, and the current Time Lens position. Contours are generated from the same minute surface as the optional relief.</desc>
          <defs>
            <clipPath id={clipId}>
              <path d={REGION.boundaryPath} />
            </clipPath>
            <pattern id={forwardPatternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="12" className="pattern-proposed" />
            </pattern>
            <pattern id={reversePatternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
              <line x1="0" y1="0" x2="0" y2="12" className="pattern-disrupted" />
            </pattern>
          </defs>

          <rect width="1000" height="700" className="map-sheet" />
          <path d={REGION.boundaryPath} className="region-land" />
          <g clipPath={`url(#${clipId})`}>
            {REGION.terrainZones.map((zone) => <path key={zone.id} d={zone.path} className={`terrain-zone ${zone.id}`} />)}
            <path d={REGION.waterPath} className="region-water" />
            {contours.minor.map((contour) => <path key={contour.minutes} d={contour.path} className={`minor-contour contour-${stateId}`} />)}
            {contours.major.map((contour) => (
              <g key={contour.minutes}>
                <path d={contour.path} className={`major-contour contour-${stateId}`} />
                {contour.label ? <text x={contour.label.x} y={contour.label.y} className="contour-label">{contour.minutes} MIN</text> : null}
              </g>
            ))}
            {REGION.zones.map((zone) => (
              <path
                key={zone.id}
                d={zone.path}
                className={`constraint-zone constraint-${zone.kind}`}
                fill={zone.kind === 'weather'
                  ? `url(#${reversePatternId})`
                  : zone.kind === 'energy'
                    ? `url(#${forwardPatternId})`
                    : undefined}
              />
            ))}

            {stateId === 'baseline' ? <path d={REGION.baselinePath} className="state-line state-line-baseline" /> : null}
            {stateId !== 'baseline' ? visibleCorridors.map((corridor) => (
              <path key={corridor.id} d={corridor.path} className={`state-line state-line-${stateId} corridor-${corridor.id.toLowerCase()} ${corridorId === corridor.id ? 'corridor-selected' : ''}`} />
            )) : null}
          </g>

          <path d={REGION.boundaryPath} className="region-outline" />
          <text x="115" y="105" className="map-label terrain-label">TERRAIN N1</text>
          <text x="300" y="455" className="map-label terrain-label">TERRAIN B1</text>
          <text x="688" y="278" className="map-label terrain-label">TERRAIN S1</text>
          <text x="742" y="470" className="map-label constraint-label mobile-critical">N1 LIMIT</text>
          <text x="590" y="145" className="map-label constraint-label mobile-critical">W1 WIND</text>
          <text x="326" y="520" className="map-label constraint-label mobile-critical">G1 GRID</text>

          {REGION.terminals.map((terminal) => (
            <g key={terminal.id} className="terminal-marker" transform={`translate(${terminal.x} ${terminal.y})`}>
              <rect x="-11" y="-11" width="22" height="22" />
              <circle r="4" />
              <text x={terminal.labelDx} y="-10" textAnchor={terminal.textAnchor}>{terminal.label}</text>
              <text x={terminal.labelDx} y="8" textAnchor={terminal.textAnchor} className="terminal-role">{terminal.role.toUpperCase()}</text>
            </g>
          ))}

          {stateId === 'proposed' ? (
            <g className="direct-route-labels">
              {(!corridorId || corridorId === 'C1') ? <text x="470" y="438" className="mobile-critical">C1</text> : null}
              {(!corridorId || corridorId === 'C2') ? <text x="465" y="244" className="mobile-critical">C2</text> : null}
            </g>
          ) : null}
          {stateId === 'baseline' ? <text x="510" y="455" className="direct-route-labels mobile-critical">BASELINE</text> : null}
          {stateId === 'disrupted' ? <text x="475" y="452" className="direct-route-labels mobile-critical">DISRUPTED</text> : null}

          <g className="lens-marker" transform={`translate(${lens.x} ${lens.y})`}>
            <circle r="35" />
            <line x1="-49" y1="0" x2="49" y2="0" />
            <line x1="0" y1="-49" x2="0" y2="49" />
            <circle r="6" />
          </g>

          <text x="54" y="656" className="map-caption">APS-SR-01 · SYNTHETIC MODELED-MINUTE CONTOURS</text>
          <text x="945" y="656" textAnchor="end" className="map-caption">ILLUSTRATIVE ONLY · NOT A FORECAST</text>
        </svg>
      </div>
      {!compact ? <Legend selectedState={stateId} /> : null}
      <figcaption>{REGION.fictionalNotice} Current view: {currentState.label}{corridorId ? ` · ${corridorId}` : ''}.</figcaption>
    </figure>
  )
}

function StateControls({ stateId, setStateId }) {
  return (
    <div className="state-controls" aria-label="Select scenario state">
      {SCENARIO_ORDER.map((id) => (
        <button
          key={id}
          type="button"
          className={stateId === id ? 'active' : ''}
          aria-pressed={stateId === id}
          onClick={() => setStateId(id)}
        >
          <ScenarioMark stateId={id} />
          {REGION.states[id].label}
        </button>
      ))}
    </div>
  )
}

function TimeLens({ value, onChange, selectedStopId, onSelectStop }) {
  const lensId = useId().replace(/:/g, '')
  const inputId = `time-lens-${lensId}`
  const labelId = `time-lens-label-${lensId}`
  const helpId = `lens-help-${lensId}`
  const nearestStop = getNearestStop(value)
  const handleKeyDown = (event) => {
    const stops = REGION.lensStops
    const currentIndex = stops.findIndex((stop) => stop.id === selectedStopId)
    if (event.key === 'Home') {
      event.preventDefault()
      onSelectStop(stops[0])
    }
    if (event.key === 'End') {
      event.preventDefault()
      onSelectStop(stops.at(-1))
    }
    if (event.key === 'ArrowLeft' && event.altKey) {
      event.preventDefault()
      onSelectStop(stops[Math.max(0, currentIndex - 1)])
    }
    if (event.key === 'ArrowRight' && event.altKey) {
      event.preventDefault()
      onSelectStop(stops[Math.min(stops.length - 1, currentIndex + 1)])
    }
  }

  return (
    <div className="time-lens-control">
      <div className="control-heading">
        <div>
          <label id={labelId} htmlFor={inputId}>Time Lens</label>
          <span>Move across the fixed APS-SR-01 transect</span>
        </div>
        <output htmlFor={inputId}>{nearestStop.label}</output>
      </div>
      <input
        id={inputId}
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onKeyDown={handleKeyDown}
        aria-labelledby={labelId}
        aria-describedby={helpId}
        aria-valuetext={`${nearestStop.label}, position ${value} of 100`}
      />
      <div className="lens-stops" aria-label="Predefined Time Lens stops">
        {REGION.lensStops.map((stop) => (
          <button key={stop.id} type="button" className={selectedStopId === stop.id ? 'active' : ''} onClick={() => onSelectStop(stop)}>
            <span>{stop.short || stop.label.split(' ')[0]}</span>
            {stop.label}
          </button>
        ))}
      </div>
      <p id={helpId} className="control-help">Arrow keys move the lens. Alt plus left or right arrow moves between named stops. Home selects E1; End selects E2.</p>
    </div>
  )
}

function EvidencePanel({ stateId, stopId }) {
  const state = REGION.states[stateId]
  const stop = REGION.lensStops.find((item) => item.id === stopId)
  const evidence = getEvidence(stateId, stopId)

  return (
    <aside id="evidence-panel" className="evidence-panel" aria-labelledby="evidence-title">
      <div className="evidence-heading">
        <div>
          <p id="evidence-title">Evidence at {stop.label}</p>
          <span>{state.label} · illustrative synthetic assumption · not a forecast</span>
        </div>
        <ScenarioMark stateId={stateId} />
      </div>
      <dl>
        <div className="primary-evidence">
          <dt>Door-to-door duration</dt>
          <dd>{evidence.journey} <small>minutes</small></dd>
          <span>{evidence.uncertainty} modeled uncertainty · illustrative synthetic {state.label}-state assumption · not a forecast</span>
        </div>
        <div><dt>Transfers</dt><dd>{evidence.transfers}</dd></div>
        <div><dt>Endpoint dwell</dt><dd>{evidence.dwell} min</dd></div>
        <div className="energy-evidence"><dt>Illustrative energy comparison index</dt><dd>{evidence.energy} kWh-eq <small>per passenger journey</small></dd><span>Not an engineering estimate.</span></div>
        <div><dt>Service window</dt><dd>{evidence.window}</dd></div>
        <div className="wide-evidence"><dt>N1 boundary</dt><dd>{evidence.noise}</dd></div>
      </dl>
      <details>
        <summary>Assumptions and uncertainty</summary>
        <ul>{REGION.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
      </details>
    </aside>
  )
}

function EvidenceTable() {
  return (
    <div className="table-wrap">
      <table>
        <caption>Accessible comparison of all APS-SR-01 Time Lens stops and scenario states. Every value is a wholly synthetic illustrative assumption, not a forecast.</caption>
        <thead>
          <tr>
            <th scope="col">Lens stop</th>
            <th scope="col">State</th>
            <th scope="col">Journey, min</th>
            <th scope="col">Transfers</th>
            <th scope="col">Endpoint dwell, min</th>
            <th scope="col">Illustrative energy index, kWh-eq per passenger journey</th>
            <th scope="col">Modeled uncertainty</th>
            <th scope="col">Model status</th>
          </tr>
        </thead>
        <tbody>
          {REGION.lensStops.flatMap((stop) => SCENARIO_ORDER.map((stateId, stateIndex) => {
            const evidence = getEvidence(stateId, stop.id)
            return (
              <tr key={`${stop.id}-${stateId}`}>
                {stateIndex === 0 ? <th scope="rowgroup" rowSpan="3">{stop.label}</th> : null}
                <th scope="row"><ScenarioMark stateId={stateId} /> {REGION.states[stateId].label}</th>
                <td>{evidence.journey}</td>
                <td>{evidence.transfers}</td>
                <td>{evidence.dwell}</td>
                <td>{evidence.energy} · not an engineering estimate</td>
                <td>{evidence.uncertainty}</td>
                <td>Illustrative synthetic {REGION.states[stateId].label}-state assumption; not a forecast</td>
              </tr>
            )
          }))}
        </tbody>
      </table>
    </div>
  )
}

function ScenarioBoard({ stateId, setStateId, lensValue, setLensValue, stopId, setStopId, reliefEnabled, setReliefEnabled, isMobile, reducedMotion, onManualInteraction, explorationMode, introActive = false }) {
  const [reliefUnavailable, setReliefUnavailable] = useState(false)
  const [reliefMessage, setReliefMessage] = useState('')

  const onLensChange = (nextValue) => {
    onManualInteraction()
    setLensValue(nextValue)
    setStopId(getNearestStop(nextValue).id)
  }

  const onSelectStop = (stop) => {
    onManualInteraction()
    setLensValue(stop.value)
    setStopId(stop.id)
  }

  const handleReliefUnavailable = useCallback(() => {
    setReliefEnabled(false)
    setReliefUnavailable(true)
    setReliefMessage('Relief unavailable; 2D map active.')
  }, [setReliefEnabled])

  const toggleRelief = () => {
    if (reliefUnavailable) return
    setReliefMessage('')
    setReliefEnabled((value) => !value)
  }

  return (
    <div id="scenario-board" className="scenario-board">
      <div className="board-context">
        <p className="board-notice">{FICTION_NOTICE}</p>
        <p className={`board-mode ${explorationMode ? 'manual' : ''}`}>{explorationMode ? 'Manual exploration' : 'Chapter narrative'}</p>
      </div>
      <div className="board-toolbar">
        <StateControls stateId={stateId} setStateId={setStateId} />
        <button type="button" className="relief-toggle" onClick={toggleRelief} aria-pressed={reliefEnabled} disabled={reliefUnavailable}>
          <span aria-hidden="true">▱</span>
          {reliefUnavailable ? 'Relief unavailable' : reliefEnabled ? 'Use 2D map' : isMobile ? 'View relief' : 'Enable relief'}
        </button>
      </div>
      <div className={`map-stage ${reliefEnabled ? 'relief-active' : ''}`}>
        {reliefEnabled ? (
          <Suspense fallback={<div className="terrain-loading" aria-hidden="true">Preparing registered relief</div>}>
            <TerrainScene stateId={stateId} reducedMotion={reducedMotion} resolution={isMobile ? 64 : 96} onUnavailable={handleReliefUnavailable} />
          </Suspense>
        ) : null}
        <RegionMap stateId={stateId} lensValue={lensValue} introActive={introActive} />
      </div>
      {reliefEnabled ? <p className="relief-scale">{REGION.surfaceScale} The semantic 2D boundary, identifiers, routes, and contours remain canonical above the opt-in relief.</p> : null}
      <p className="relief-live-status" role="status" aria-live="polite">{reliefMessage}</p>
      <TimeLens value={lensValue} onChange={onLensChange} selectedStopId={stopId} onSelectStop={onSelectStop} />
    </div>
  )
}

function SummaryActions({ stateId, stopId }) {
  const downloadSummary = () => {
    const summary = createScenarioSummary(stateId, stopId)
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `APS-SR-01-${stateId}-${stopId}-scenario-summary.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <div className="summary-actions">
      <button type="button" className="button" onClick={downloadSummary}>Export scenario summary</button>
      <button type="button" className="text-button" onClick={() => window.print()}>Print one-page view</button>
    </div>
  )
}

function CorridorComparison() {
  return (
    <section id="corridors" className="corridor-section section-pad" aria-labelledby="corridor-title">
      <div className="section-intro">
        <p className="section-number">Two bounded concepts</p>
        <h2 id="corridor-title">Design the corridor around the handoff.</h2>
        <p>Neither concept is a winner animation. Each makes a different promise and carries a different operating limit.</p>
      </div>
      <div className="corridor-comparison">
        {REGION.corridors.map((corridor, index) => (
          <article key={corridor.id}>
            <div className="corridor-map-mini">
              <RegionMap stateId="proposed" lensValue={index === 0 ? 55 : 82} compact corridorId={corridor.id} />
            </div>
            <div className="corridor-copy">
              <p>Concept {corridor.id}</p>
              <h3>{corridor.label}</h3>
              <dl>
                <div><dt>Service window</dt><dd>{corridor.serviceWindow}</dd></div>
                <div><dt>Transfers</dt><dd>{corridor.transferPoints}</dd></div>
                <div><dt>Terminal dwell</dt><dd>{corridor.terminalDwell} min</dd></div>
              </dl>
              <p>{corridor.logic}</p>
              <p className="corridor-limit"><strong>Limit:</strong> {corridor.limitation}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function TerminalFlow() {
  const steps = [
    ['01', 'Arrival threshold', '7 min', 'Covered curb, step-free route, luggage handoff'],
    ['02', 'Identity and safety', '3 min', 'One assumed check, no repeated queue'],
    ['03', 'Weather room', '2 min', 'Protected pause with service updates'],
    ['04', 'Dispatch seam', '2 min', 'Staff handoff and timed departure'],
  ]
  return (
    <section className="terminal-section section-pad" aria-labelledby="terminal-title">
      <div className="terminal-heading">
        <p className="section-number">E2 endpoint programming</p>
        <h2 id="terminal-title">Fourteen minutes before movement.</h2>
        <p>E2 is modeled as a sequence, not an icon. Accessibility, luggage, weather, and staff handoffs are part of door-to-door time.</p>
      </div>
      <ol className="terminal-flow">
        {steps.map(([number, title, duration, note]) => (
          <li key={number}>
            <span>{number}</span>
            <div><h3>{title}</h3><p>{note}</p></div>
            <strong>{duration}</strong>
          </li>
        ))}
      </ol>
    </section>
  )
}

function LimitsSection() {
  return (
    <section className="limits-section section-pad" aria-labelledby="limits-title">
      <div className="limits-title-block">
        <p className="section-number">Respect the limits</p>
        <h2 id="limits-title">What the proposed system does not solve.</h2>
      </div>
      <div className="limits-ledger">
        <article><span className="limit-symbol quiet" aria-hidden="true" /><h3>N1 noise limit</h3><p>No C1 or C2 crossing. No modeled exception. The synthetic boundary remains fixed in every state.</p></article>
        <article><span className="limit-symbol weather" aria-hidden="true" /><h3>W1 crosswind</h3><p>C2 loses service hours in the Disrupted state. The model restores an alternate transfer rather than implying continuity.</p></article>
        <article><span className="limit-symbol energy" aria-hidden="true" /><h3>G1 grid assumption</h3><p>Energy is an illustrative comparison index in kWh-equivalent per passenger journey. It is not an engineering estimate, vehicle specification, or reduction claim.</p></article>
      </div>
    </section>
  )
}

function MethodSection() {
  return (
    <section id="method" className="method-section section-pad" aria-labelledby="method-title">
      <div className="method-title-block">
        <p className="section-number">Method and uncertainty</p>
        <h2 id="method-title">One definition, carried through every view.</h2>
        <p>The map, relief, evidence panel, table, and export use the same local scenario object. No visible value is separately authored.</p>
      </div>
      <ol className="method-list">
        {REGION.methodology.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}
      </ol>
      <div className="method-note">
        <h3>Use boundary</h3>
        <p>{SYNTHETIC_NOTICE} {DECISION_USE_NOTICE} It cannot calculate a real route, predict demand, establish feasibility, or indicate regulatory acceptance.</p>
      </div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section className="services-section section-pad" aria-labelledby="services-title">
      <div className="services-heading">
        <p className="section-number">Service scope</p>
        <h2 id="services-title">Begin with a bounded decision.</h2>
        <p>Indicative fictional pricing and timing. No current fees, availability, pipeline, or outcomes are implied.</p>
      </div>
      <div className="services-list">
        {REGION.services.map((service, index) => (
          <article key={service.name} className={index === 1 ? 'featured-service' : ''}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{service.name}</h3>
            <p>{service.scope}</p>
            <div><strong>{service.timing}</strong><strong>{service.price}</strong></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function StudioSection() {
  return (
    <section id="studio" className="studio-section section-pad" aria-labelledby="studio-title">
      <div className="studio-portrait" role="img" aria-label="Abstract illustrated profile of fictional founder Leila Sato assembled from cartographic planning shapes">
        <svg viewBox="0 0 640 760" aria-hidden="true">
          <rect width="640" height="760" className="portrait-sheet" />
          <path d="M110 606 C177 490 200 319 306 228 C396 151 510 178 558 284 L558 666 L108 666 Z" className="portrait-field" />
          <circle cx="355" cy="276" r="112" className="portrait-head" />
          <path d="M250 264 C262 128 466 118 487 272 C437 222 365 205 250 264 Z" className="portrait-hair" />
          <path d="M292 392 C330 420 392 418 431 389 L492 666 L228 666 Z" className="portrait-body" />
          <path d="M68 540 C186 494 305 512 584 439" className="portrait-route" />
          <path d="M74 584 C250 520 376 574 588 510" className="portrait-contour" />
          <text x="42" y="52">FICTIONAL PROFILE · LEILA SATO</text>
          <text x="42" y="714">TRANSPORT SYSTEMS × HOSPITALITY OPERATIONS</text>
        </svg>
      </div>
      <div className="studio-copy">
        <p className="section-number">Founder and studio</p>
        <h2 id="studio-title">Plan the system, not the vehicle.</h2>
        <p className="large-copy">Leila Sato is a fictional transport-systems engineer and former hospitality operations executive. Her invented perspective joins network planning, guest experience, terminal operations, procurement, and service reliability.</p>
        <p>Avenor has fictional offices in Zürich and Singapore. The studio does not build vehicles, sell seats, operate routes, hold approvals, or claim deployed software.</p>
        <ul>
          <li>Define the door-to-door question before the mode.</li>
          <li>Keep terminal friction visible in the headline.</li>
          <li>Show limits before projecting outcomes.</li>
        </ul>
      </div>
    </section>
  )
}

function QualificationForm({ stateId, stopId }) {
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const confirmationRef = useRef(null)
  const firstFieldRef = useRef(null)
  const wasSubmittedRef = useRef(false)

  useEffect(() => {
    if (submitted) {
      wasSubmittedRef.current = true
      window.requestAnimationFrame(() => confirmationRef.current?.focus())
    } else if (wasSubmittedRef.current) {
      wasSubmittedRef.current = false
      window.requestAnimationFrame(() => firstFieldRef.current?.focus())
    }
  }, [submitted])

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      setFormError('Complete the required fields before reviewing the prototype confirmation.')
      return
    }
    setFormError('')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div ref={confirmationRef} className="prototype-confirmation" role="status" tabIndex="-1">
        <p>Prototype confirmation</p>
        <h3>No request was sent.</h3>
        <p>{FICTION_NOTICE}</p>
        <p>{SYNTHETIC_NOTICE} {NO_ENGAGEMENT_NOTICE}</p>
        <p>No study, briefing, license, engagement, payment, booking, or response request was created. Your selections remained in this browser demonstration.</p>
        <p>{DECISION_USE_NOTICE}</p>
        <button type="button" className="text-button" onClick={() => setSubmitted(false)}>Return to the qualification form</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="APS-SR-01 prototype qualification form">
      <input type="hidden" name="region-id" value={REGION.id} />
      <input type="hidden" name="scenario-state" value={stateId} />
      <input type="hidden" name="lens-stop" value={stopId} />
      <div className="form-grid">
        <label>Region type<select ref={firstFieldRef} name="region-type" required defaultValue=""><option value="" disabled>Select one</option><option>Resort region</option><option>Private campus</option><option>Destination district</option><option>Difficult intercity connection</option></select></label>
        <label>Current access problem<input name="access-problem" required placeholder="Transfers, seasonality, dwell, resilience" /></label>
        <label>Endpoint types for E1 and E2<input name="endpoints" required placeholder="Origin and destination types" /></label>
        <label>Seasonal pattern<select name="seasonality" required defaultValue=""><option value="" disabled>Select one</option><option>Sharp peak season</option><option>Two seasonal peaks</option><option>Event-led variation</option><option>Year-round demand</option></select></label>
        <label>Decision deadline<input name="deadline" type="month" required /></label>
        <label>Available data<select name="data" required defaultValue=""><option value="" disabled>Select one</option><option>Early assumptions only</option><option>Travel and operations data</option><option>Masterplan and site data</option><option>Demand study available</option></select></label>
        <label>Stakeholder stage<select name="stakeholder-stage" required defaultValue=""><option value="" disabled>Select one</option><option>Board question forming</option><option>Masterplan in progress</option><option>Technical procurement planned</option><option>Existing service under review</option></select></label>
        <label>Indicative fictional budget band<select name="budget" required defaultValue=""><option value="" disabled>Select one</option><option>CHF 25,000 to 45,000</option><option>CHF 120,000 to 220,000</option><option>CHF 250,000 and above</option><option>Budget not yet bounded</option></select></label>
      </div>
      <label className="form-consent"><input type="checkbox" required /> I understand this is a portfolio prototype and no request will be sent to Avenor Passage Systems or any operating company.</label>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      <button className="button" type="submit">Review prototype qualification</button>
    </form>
  )
}

function StudySection({ stateId, stopId }) {
  const evidence = getEvidence(stateId, stopId)
  const stop = REGION.lensStops.find((item) => item.id === stopId)
  return (
    <section id="study" className="study-section section-pad" aria-labelledby="study-title">
      <div className="study-heading">
        <FictionNotice compact />
        <p className="section-number">Corridor Opportunity Study</p>
        <h2 id="study-title">Eight to ten fictional weeks to a board decision.</h2>
        <p>Fixed-scope baseline, two corridor concepts, door-to-door comparison, terminal dwell, noise and energy assumptions, disruption response, recommendation, and next-phase scope.</p>
        <div className="study-price"><span>Indicative fictional fee</span><strong>CHF 120,000 to 220,000</strong></div>
      </div>
      <div className="selected-summary" aria-label="Selected scenario context">
        <p>{REGION.id} · current scenario carried into the form</p>
        <h3>{REGION.states[stateId].label} · {stop.label}</h3>
        <p className="selected-model-status">Illustrative synthetic {REGION.states[stateId].label}-state assumption · {evidence.uncertainty} modeled uncertainty · not a forecast</p>
        <dl>
          <div><dt>Journey</dt><dd>{evidence.journey} min {evidence.uncertainty}</dd></div>
          <div><dt>Transfers</dt><dd>{evidence.transfers}</dd></div>
          <div><dt>Dwell</dt><dd>{evidence.dwell} min</dd></div>
        </dl>
        <SummaryActions stateId={stateId} stopId={stopId} />
      </div>
      <QualificationForm stateId={stateId} stopId={stopId} />
    </section>
  )
}

function PrintSummary({ stateId, stopId }) {
  const stop = REGION.lensStops.find((item) => item.id === stopId)
  const evidence = getEvidence(stateId, stopId)
  return (
    <section className="print-summary" aria-label="Printable APS-SR-01 scenario summary">
      <header>
        <p>AVENOR PASSAGE SYSTEMS · {REGION.id}</p>
        <h1>Time is the terrain.</h1>
        <p>{FICTION_NOTICE}</p>
      </header>
      <div className="print-map">
        <RegionMap stateId={stateId} lensValue={stop.value} compact />
      </div>
      <div className="print-evidence">
        <p>Selected scenario</p>
        <h2>{REGION.states[stateId].label} · {stop.label}</h2>
        <p className="print-model-status">Illustrative synthetic {REGION.states[stateId].label}-state assumption · {evidence.uncertainty} modeled uncertainty · not a forecast</p>
        <dl>
          <div><dt>Door-to-door duration</dt><dd>{evidence.journey} min {evidence.uncertainty}</dd></div>
          <div><dt>Transfers</dt><dd>{evidence.transfers}</dd></div>
          <div><dt>Endpoint dwell</dt><dd>{evidence.dwell} min</dd></div>
          <div><dt>Energy comparison index</dt><dd>{evidence.energy} kWh-eq per passenger journey</dd></div>
          <div><dt>Energy status</dt><dd>Illustrative only; not an engineering estimate.</dd></div>
          <div><dt>Service window</dt><dd>{evidence.window}</dd></div>
          <div><dt>N1 boundary</dt><dd>{evidence.noise}</dd></div>
        </dl>
        <h3>Assumptions and limits</h3>
        <ul>{REGION.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
      </div>
      <footer>
        <p>{SYNTHETIC_NOTICE} {NO_ENGAGEMENT_NOTICE}</p>
        <p>No study, briefing, license, engagement, payment, booking, or response request was created or sent.</p>
        <p>{DECISION_USE_NOTICE}</p>
      </footer>
    </section>
  )
}

function App() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isMobile = useMediaQuery('(max-width: 760px)')
  const [stateId, setStateId] = useState('baseline')
  const [lensValue, setLensValue] = useState(35)
  const [stopId, setStopId] = useState('B1')
  const [reliefEnabled, setReliefEnabled] = useState(false)
  const [introActive, setIntroActive] = useState(() => !reducedMotion)
  const [activeChapter, setActiveChapter] = useState('access')
  const [explorationMode, setExplorationMode] = useState(false)
  const [inspectedChapterId, setInspectedChapterId] = useState(null)
  const storyRef = useRef(null)
  const manualModeRef = useRef(false)
  const manualOriginChapterRef = useRef('access')
  const manualStartScrollYRef = useRef(0)
  const chapterResponseRefs = useRef(new Map())
  const liveMessage = useMemo(() => `${REGION.id}. ${REGION.states[stateId].label} scenario selected at ${REGION.lensStops.find((stop) => stop.id === stopId).label}.`, [stateId, stopId])

  const markManualInteraction = useCallback(() => {
    manualModeRef.current = true
    manualStartScrollYRef.current = window.scrollY
    if (activeChapter) manualOriginChapterRef.current = activeChapter
    setActiveChapter(null)
    setExplorationMode(true)
    setInspectedChapterId(null)
  }, [activeChapter])

  const selectState = useCallback((nextState) => {
    markManualInteraction()
    setStateId(nextState)
  }, [markManualInteraction])

  const finishIntro = useCallback(() => {
    setIntroActive(false)
    try { window.localStorage.setItem('avenor-intro-v1', 'seen') } catch { /* storage is optional */ }
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setIntroActive(false)
      return undefined
    }
    let repeatVisit = false
    try { repeatVisit = window.localStorage.getItem('avenor-intro-v1') === 'seen' } catch { repeatVisit = false }
    const timer = window.setTimeout(finishIntro, repeatVisit ? 1400 : 5200)
    return () => window.clearTimeout(timer)
  }, [finishIntro, reducedMotion])

  useEffect(() => {
    const root = storyRef.current
    if (!root) return undefined
    const chapters = [...root.querySelectorAll('[data-story-chapter]')]
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const chapter = CHAPTERS.find((item) => item.id === visible.target.dataset.storyChapter)
      if (!chapter) return
      if (manualModeRef.current) {
        const movedToAnotherChapter = Math.abs(window.scrollY - manualStartScrollYRef.current) > 120
          && chapter.id !== manualOriginChapterRef.current
        if (!movedToAnotherChapter) return
      }
      manualModeRef.current = false
      setExplorationMode(false)
      setActiveChapter(chapter.id)
      setStateId(chapter.state)
      const stop = REGION.lensStops.find((item) => item.id === chapter.stop)
      if (stop) {
        setStopId(stop.id)
        setLensValue(stop.value)
      }
    }, { rootMargin: '-24% 0px -38% 0px', threshold: [0.2, 0.45, 0.7] })
    chapters.forEach((chapter) => observer.observe(chapter))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = storyRef.current
    if (!root) return undefined
    let frameId = 0
    const update = () => {
      frameId = 0
      const rect = root.getBoundingClientRect()
      const total = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / total))
      root.style.setProperty('--story-progress', progress.toFixed(4))
    }
    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const inspectChapter = useCallback((chapter) => {
    manualModeRef.current = false
    setExplorationMode(false)
    setActiveChapter(chapter.id)
    setStateId(chapter.state)
    const stop = REGION.lensStops.find((item) => item.id === chapter.stop)
    if (stop) {
      setStopId(stop.id)
      setLensValue(stop.value)
    }
    setInspectedChapterId(chapter.id)
    window.requestAnimationFrame(() => chapterResponseRefs.current.get(chapter.id)?.focus())
  }, [])

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div id="top" className={introActive ? 'page intro-active' : 'page intro-complete'}>
        <FictionNotice />
        <Header />
        <main id="main-content">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="hero-index">APS-SR-01 · wholly synthetic study</p>
              <h1 id="hero-title">Time is<br /><span>the terrain.</span></h1>
              <p className="hero-deck">Avenor plans premium low-noise mobility around access, transfers, terminal comfort, energy, and resilience. Not around a vehicle.</p>
              <div className="hero-actions">
                <a className="button" href="#study">Commission a study</a>
                <a className="text-button" href="#scenario">Read the region</a>
              </div>
              <dl className="hero-register">
                <div><dt>Region</dt><dd>APS-SR-01 · wholly synthetic</dd></div>
                <div><dt>Network</dt><dd>E1–E2 · corridors C1 and C2</dd></div>
                <div><dt>States</dt><dd>Baseline · Proposed · Disrupted</dd></div>
              </dl>
            </div>
            <div className="hero-map-wrap">
              <div className="hero-map-note"><span>Proposed-state assumption · E2</span><strong>45 min ±11 min</strong><small>Illustrative synthetic modeled uncertainty · not a forecast</small></div>
              <RegionMap stateId={introActive ? 'proposed' : stateId} lensValue={introActive ? 70 : lensValue} introActive={introActive} />
            </div>
            {introActive ? <button type="button" className="intro-skip" onClick={finishIntro}>Skip opening</button> : null}
          </section>

          <section className="premise-band" aria-label="Core premise">
            <p>Physical distance stays fixed.</p>
            <p>Transfers, dwell, frequency, weather, noise, and recovery reshape the journey.</p>
          </section>

          <section id="scenario" className="scenario-section" ref={storyRef} aria-labelledby="scenario-title">
            <div className="scenario-heading section-pad">
              <p className="section-number">Flagship scenario · APS-SR-01</p>
              <h2 id="scenario-title">Time is the terrain.</h2>
              <p>One synthetic resort region. Two corridor concepts. Exactly three operating states. The map is explanatory, not a calculator.</p>
            </div>
            <div className="story-progress" aria-hidden="true"><span /></div>
            <div className="story-layout">
              <div className="story-map-column">
                <ScenarioBoard
                  stateId={stateId}
                  setStateId={selectState}
                  lensValue={lensValue}
                  setLensValue={setLensValue}
                  stopId={stopId}
                  setStopId={setStopId}
                  reliefEnabled={reliefEnabled}
                  setReliefEnabled={setReliefEnabled}
                  isMobile={isMobile}
                  reducedMotion={reducedMotion}
                  onManualInteraction={markManualInteraction}
                  explorationMode={explorationMode}
                />
                <EvidencePanel stateId={stateId} stopId={stopId} />
              </div>
              <div className="story-chapters">
                {CHAPTERS.map((chapter) => {
                  const chapterStop = REGION.lensStops.find((item) => item.id === chapter.stop)
                  const chapterEvidence = getEvidence(chapter.state, chapter.stop)
                  return (
                    <article key={chapter.id} data-story-chapter={chapter.id} className={activeChapter === chapter.id ? 'active' : ''}>
                      <span>{chapter.number}</span>
                      <p>{chapter.prompt}</p>
                      <h3>{chapter.title}</h3>
                      <p>{chapter.finding}</p>
                      <button type="button" onClick={() => inspectChapter(chapter)} aria-expanded={inspectedChapterId === chapter.id}>Inspect this evidence</button>
                      {inspectedChapterId === chapter.id ? (
                        <div
                          ref={(node) => {
                            if (node) chapterResponseRefs.current.set(chapter.id, node)
                            else chapterResponseRefs.current.delete(chapter.id)
                          }}
                          className="chapter-evidence-response"
                          role="status"
                          tabIndex="-1"
                        >
                          <p>{REGION.id} · {REGION.states[chapter.state].label} · {chapterStop.label}</p>
                          <strong>{chapterEvidence.journey} min {chapterEvidence.uncertainty}</strong>
                          <span>Illustrative synthetic {REGION.states[chapter.state].label}-state assumption · not a forecast</span>
                          <dl>
                            <div><dt>Transfers</dt><dd>{chapterEvidence.transfers}</dd></div>
                            <div><dt>Endpoint dwell</dt><dd>{chapterEvidence.dwell} min</dd></div>
                            <div><dt>Energy index</dt><dd>{chapterEvidence.energy} kWh-eq per passenger journey · not an engineering estimate</dd></div>
                          </dl>
                          <a href="#scenario-board">View the canonical 2D map and full evidence</a>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
            <div className="table-disclosure section-pad">
              <details>
                <summary>Open complete accessible data table</summary>
                <EvidenceTable />
              </details>
              <SummaryActions stateId={stateId} stopId={stopId} />
            </div>
          </section>

          <CorridorComparison />
          <TerminalFlow />
          <LimitsSection />
          <MethodSection />
          <ServicesSection />
          <StudioSection />
          <StudySection stateId={stateId} stopId={stopId} />
        </main>
        <PrintSummary stateId={stateId} stopId={stopId} />
        <footer>
          <a className="wordmark footer-wordmark" href="#top"><span>AVENOR<br />PASSAGE SYSTEMS</span></a>
          <div><p>Fictional offices in Zürich and Singapore.</p><p>Planning access, not manufacturing or operating vehicles.</p></div>
          <div><a href="#method">Method</a><a href="#study">Prototype qualification</a><a href="#top">Back to top</a></div>
          <FictionNotice compact />
        </footer>
      </div>
      <p className="sr-status" role="status" aria-live="polite">{liveMessage}</p>
    </>
  )
}

export default App
