export const SCENARIO_ORDER = ['baseline', 'proposed', 'disrupted']

export const FICTION_NOTICE = 'Fictional concept commission. Avenor Passage Systems is not an operating company.'
export const SYNTHETIC_NOTICE = 'This scenario is wholly synthetic.'
export const NO_ENGAGEMENT_NOTICE = 'No engagement was booked.'
export const DECISION_USE_NOTICE = 'It must not be used for planning, engineering, environmental, regulatory, procurement, investment, or operating decisions.'

const MAP_WIDTH = 1000
const MAP_HEIGHT = 700
const SURFACE_MINUTES = { min: 30, max: 110 }

export const REGION = {
  id: 'APS-SR-01',
  name: 'APS-SR-01',
  fictionalNotice: `${SYNTHETIC_NOTICE} Illustrative scenario data only.`,
  coordinateSystem: 'APS-SR-01 local planning grid, 0 to 1000 by 0 to 700',
  surfaceScale: 'Relief height is normalized from 30 to 110 modeled minutes; 1.0 height unit represents 80 modeled minutes.',
  palette: {
    baseline: '#007B9A',
    proposed: '#C84832',
    disrupted: '#6B4E9B',
  },
  states: {
    baseline: {
      label: 'Baseline',
      short: 'Existing access',
      lineStyle: 'solid',
      texture: 'none',
      description: 'Existing road, water, and scheduled transfer connections under a representative synthetic peak-season operating day.',
    },
    proposed: {
      label: 'Proposed',
      short: 'C1 and C2 concepts',
      lineStyle: 'dash',
      texture: 'forward hatch',
      description: 'Two bounded electric-corridor concepts, C1 and C2, with transfer and endpoint assumptions kept visible.',
    },
    disrupted: {
      label: 'Disrupted',
      short: 'Weather constraint',
      lineStyle: 'dot',
      texture: 'reverse hatch',
      description: 'A deterministic W1 crosswind and reduced-capacity case with an alternate transfer plan.',
    },
  },
  boundaryPath: 'M82 420 L116 278 L228 142 L396 88 L570 104 L736 62 L904 142 L942 302 L875 446 L914 590 L742 648 L578 602 L412 654 L246 614 L118 526 Z',
  waterPath: 'M82 420 C198 382 238 446 345 424 C471 398 490 326 610 348 C730 370 750 456 875 446 L914 590 L742 648 L578 602 L412 654 L246 614 L118 526 Z',
  terrainZones: [
    { id: 'terrain-n1', label: 'TERRAIN N1', path: 'M125 286 C242 142 404 106 546 142 C684 177 732 116 884 158 L856 248 C713 222 655 270 520 226 C373 179 264 220 166 342 Z' },
    { id: 'terrain-b1', label: 'TERRAIN B1', path: 'M214 356 C336 292 454 315 551 383 C457 463 351 500 242 456 Z' },
    { id: 'terrain-s1', label: 'TERRAIN S1', path: 'M560 254 C692 204 823 232 885 326 C813 395 708 411 615 368 Z' },
  ],
  zones: [
    { id: 'noise-n1', label: 'N1 noise limit', shortLabel: 'N1 LIMIT', kind: 'noise', path: 'M681 398 C751 360 842 386 873 451 C836 503 759 516 695 478 Z' },
    { id: 'weather-w1', label: 'W1 crosswind constraint', shortLabel: 'W1 WIND', kind: 'weather', path: 'M512 126 C617 88 727 91 802 145 C751 198 646 215 558 184 Z' },
    { id: 'energy-g1', label: 'G1 grid assumption', shortLabel: 'G1 GRID', kind: 'energy', path: 'M307 470 L405 449 L445 518 L337 550 Z' },
  ],
  terminals: [
    { id: 'E1', label: 'E1', short: 'E1', x: 155, y: 410, role: 'origin endpoint', labelDx: 17, textAnchor: 'start' },
    { id: 'T1', label: 'T1', short: 'T1', x: 425, y: 390, role: 'transfer point', labelDx: 17, textAnchor: 'start' },
    { id: 'E2', label: 'E2', short: 'E2', x: 846, y: 315, role: 'destination endpoint', labelDx: -17, textAnchor: 'end' },
  ],
  baselinePath: 'M155 410 C256 445 331 361 425 390 C568 435 677 448 846 315',
  corridors: [
    {
      id: 'C1',
      label: 'C1',
      shortLabel: 'C1',
      path: 'M155 410 C282 338 332 335 425 390 C565 472 690 365 846 315',
      serviceWindow: '06:30 to 22:30',
      transferPoints: 1,
      terminalDwell: 11,
      logic: 'C1 uses transfer point T1 and lowers the central time ridge while remaining outside N1.',
      limitation: 'One transfer remains. Peak resilience depends on a timed connection at T1.',
    },
    {
      id: 'C2',
      label: 'C2',
      shortLabel: 'C2',
      path: 'M155 410 C310 264 524 221 846 315',
      serviceWindow: '07:00 to 21:00',
      transferPoints: 0,
      terminalDwell: 17,
      logic: 'C2 is a direct E1–E2 concept that protects the B1 ground network from added demand.',
      limitation: 'W1 narrows the service window and increases disrupted-state sensitivity.',
    },
  ],
  lensStops: [
    { id: 'E1', label: 'E1', short: 'Endpoint', x: 155, y: 410, value: 8 },
    { id: 'B1', label: 'B1 terrain sample', short: 'Terrain', x: 355, y: 410, value: 35 },
    { id: 'T1', label: 'T1 transfer point', short: 'Transfer', x: 500, y: 355, value: 55 },
    { id: 'E2', label: 'E2', short: 'Endpoint', x: 846, y: 315, value: 92 },
  ],
  evidence: {
    E1: {
      baseline: { journey: 58, transfers: 2, dwell: 18, energy: 37, noise: 'Inside existing access envelope', window: '05:45 to 23:10', uncertainty: '±9 min' },
      proposed: { journey: 46, transfers: 1, dwell: 11, energy: 31, noise: 'No new N1 crossing', window: '06:30 to 22:30', uncertainty: '±8 min' },
      disrupted: { journey: 66, transfers: 2, dwell: 19, energy: 34, noise: 'N1 operating limit retained', window: '08:10 to 19:40', uncertainty: '±13 min' },
    },
    B1: {
      baseline: { journey: 72, transfers: 3, dwell: 24, energy: 43, noise: 'Ground traffic near B1 edge', window: '06:00 to 22:45', uncertainty: '±11 min' },
      proposed: { journey: 49, transfers: 1, dwell: 12, energy: 33, noise: 'N1 boundary remains excluded', window: '06:30 to 22:30', uncertainty: '±9 min' },
      disrupted: { journey: 78, transfers: 2, dwell: 23, energy: 38, noise: 'Alternate transfer adds ground movement', window: '08:10 to 19:40', uncertainty: '±15 min' },
    },
    T1: {
      baseline: { journey: 83, transfers: 3, dwell: 29, energy: 47, noise: 'Existing interchange exposure', window: '06:00 to 22:20', uncertainty: '±13 min' },
      proposed: { journey: 52, transfers: 1, dwell: 11, energy: 35, noise: 'Terminal activity within study envelope', window: '06:30 to 22:30', uncertainty: '±10 min' },
      disrupted: { journey: 91, transfers: 3, dwell: 31, energy: 41, noise: 'Recovery movements capped after 20:00', window: '08:10 to 19:40', uncertainty: '±17 min' },
    },
    E2: {
      baseline: { journey: 104, transfers: 3, dwell: 26, energy: 54, noise: 'Endpoint ground arrival dominates', window: '06:20 to 21:50', uncertainty: '±15 min' },
      proposed: { journey: 45, transfers: 1, dwell: 14, energy: 39, noise: 'N1 remains a hard limit', window: '06:30 to 22:30', uncertainty: '±11 min' },
      disrupted: { journey: 96, transfers: 2, dwell: 28, energy: 46, noise: 'No exception to N1 limit', window: '08:10 to 19:40', uncertainty: '±18 min' },
    },
  },
  assumptions: [
    'Representative synthetic peak-season weekday, not observed demand.',
    'Door-to-door time includes access, transfer, endpoint dwell, and a planned reliability margin.',
    'Energy is an illustrative comparison index in kWh-equivalent per passenger journey, not an engineering estimate.',
    'N1 is a synthetic planning limit, not an environmental assessment.',
    'The disrupted state is one deterministic scenario, not a probability forecast.',
  ],
  methodology: [
    'Use the four evidence samples as control points for one synthetic minute surface.',
    'Interpolate access, frequency, transfer, endpoint, and reliability minutes across APS-SR-01.',
    'Apply C1 and C2 only where their stated assumptions apply.',
    'Keep N1, W1, G1, and operating limits visible in every state.',
    'Generate 2D contours and optional relief from that same minute surface.',
  ],
  services: [
    { name: 'Board Scenario Briefing', timing: '2 fictional weeks', price: 'CHF 25,000 to 45,000', scope: 'Executive decision package and bounded next question.' },
    { name: 'Corridor Opportunity Study', timing: '8 to 10 fictional weeks', price: 'CHF 120,000 to 220,000', scope: 'Baseline access map, C1 and C2, endpoint dwell, limits, disruption, and board recommendation.' },
    { name: 'Endpoint Programming', timing: 'Scope dependent', price: 'From CHF 250,000', scope: 'Site criteria, flows, accessibility, baggage, weather protection, and operator brief.' },
    { name: 'Operations and Procurement Advisory', timing: 'Milestone based', price: 'CHF 180,000 to 500,000', scope: 'Service model, requirements, shortlist, evaluation, and mobilization plan.' },
    { name: 'Scenario Platform License', timing: 'Annual', price: 'CHF 75,000 to 180,000 per year', scope: 'Managed capacity, schedule, transfer, disruption, and board-reporting scenarios.' },
  ],
}

const stopById = new Map(REGION.lensStops.map((stop) => [stop.id, stop]))
const contourCache = new Map()

export function getNearestStop(lensValue) {
  let nearest = REGION.lensStops[0]
  let distance = Math.abs(lensValue - nearest.value)
  for (let index = 1; index < REGION.lensStops.length; index += 1) {
    const candidate = REGION.lensStops[index]
    const candidateDistance = Math.abs(lensValue - candidate.value)
    if (candidateDistance < distance) {
      nearest = candidate
      distance = candidateDistance
    }
  }
  return nearest
}

export function getEvidence(stateId, stopId) {
  const safeState = SCENARIO_ORDER.includes(stateId) ? stateId : SCENARIO_ORDER[0]
  const safeStop = stopById.has(stopId) ? stopId : REGION.lensStops[0].id
  return REGION.evidence[safeStop][safeState]
}

export function getLensPosition(lensValue) {
  const stops = REGION.lensStops
  const clamped = Math.max(0, Math.min(100, lensValue))
  for (let index = 0; index < stops.length - 1; index += 1) {
    const from = stops[index]
    const to = stops[index + 1]
    if (clamped >= from.value && clamped <= to.value) {
      const span = to.value - from.value || 1
      const progress = (clamped - from.value) / span
      return {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
      }
    }
  }
  return { x: stops.at(-1).x, y: stops.at(-1).y }
}

function gaussian(x, y, centerX, centerY, spreadX, spreadY) {
  return Math.exp(-(((x - centerX) ** 2) / spreadX + ((y - centerY) ** 2) / spreadY))
}

export function sampleTimeSurface(normalizedX, normalizedY, stateId) {
  const safeState = SCENARIO_ORDER.includes(stateId) ? stateId : SCENARIO_ORDER[0]
  const samples = REGION.lensStops.map((stop) => ({
    x: stop.x / MAP_WIDTH,
    y: stop.y / MAP_HEIGHT,
    minutes: REGION.evidence[stop.id][safeState].journey,
  }))

  let weightedMinutes = 0
  let weightTotal = 0
  let minimumDistance = Infinity
  for (const sample of samples) {
    const dx = normalizedX - sample.x
    const dy = (normalizedY - sample.y) * (MAP_HEIGHT / MAP_WIDTH)
    const distanceSquared = dx * dx + dy * dy
    if (distanceSquared < 0.0000001) return sample.minutes
    minimumDistance = Math.min(minimumDistance, Math.sqrt(distanceSquared))
    const weight = 1 / Math.pow(distanceSquared + 0.0018, 1.35)
    weightedMinutes += sample.minutes * weight
    weightTotal += weight
  }

  const ridge = gaussian(normalizedX, normalizedY, 0.49, 0.31, 0.055, 0.018)
  const northMass = gaussian(normalizedX, normalizedY, 0.69, 0.18, 0.08, 0.025)
  const basin = gaussian(normalizedX, normalizedY, 0.36, 0.58, 0.065, 0.06)
  const corridorBand = gaussian(normalizedX, normalizedY, 0.58, 0.49, 0.22, 0.012)
  const wind = gaussian(normalizedX, normalizedY, 0.68, 0.2, 0.08, 0.02)
  const detailStrength = Math.min(1, minimumDistance * 8)
  let detail = (ridge * 13 + northMass * 10 - basin * 4) * detailStrength
  if (safeState === 'proposed') detail -= corridorBand * 11 * detailStrength
  if (safeState === 'disrupted') detail += (wind * 20 + 7) * detailStrength

  return Math.max(28, Math.min(118, weightedMinutes / weightTotal + detail))
}

export function createHeightField(stateId, resolution = 96) {
  const safeResolution = Math.max(32, Math.min(128, Math.round(resolution)))
  const values = new Float32Array(safeResolution * safeResolution)
  const minutes = new Float32Array(safeResolution * safeResolution)
  for (let row = 0; row < safeResolution; row += 1) {
    for (let column = 0; column < safeResolution; column += 1) {
      const index = row * safeResolution + column
      const sampledMinutes = sampleTimeSurface(
        column / (safeResolution - 1),
        row / (safeResolution - 1),
        stateId,
      )
      minutes[index] = sampledMinutes
      values[index] = Math.max(0, Math.min(1.1, (sampledMinutes - SURFACE_MINUTES.min) / (SURFACE_MINUTES.max - SURFACE_MINUTES.min)))
    }
  }
  return { resolution: safeResolution, values, minutes, minuteRange: SURFACE_MINUTES }
}

function interpolateEdge(level, first, second, firstPoint, secondPoint) {
  const span = second - first
  const amount = Math.abs(span) < 0.00001 ? 0.5 : Math.max(0, Math.min(1, (level - first) / span))
  return {
    x: firstPoint.x + (secondPoint.x - firstPoint.x) * amount,
    y: firstPoint.y + (secondPoint.y - firstPoint.y) * amount,
  }
}

function contourSegments(values, resolution, level) {
  const segments = []
  const stepX = MAP_WIDTH / (resolution - 1)
  const stepY = MAP_HEIGHT / (resolution - 1)
  const add = (first, second) => segments.push([first, second])

  for (let row = 0; row < resolution - 1; row += 1) {
    for (let column = 0; column < resolution - 1; column += 1) {
      const topLeft = values[row * resolution + column]
      const topRight = values[row * resolution + column + 1]
      const bottomLeft = values[(row + 1) * resolution + column]
      const bottomRight = values[(row + 1) * resolution + column + 1]
      const code = (topLeft >= level ? 8 : 0)
        | (topRight >= level ? 4 : 0)
        | (bottomRight >= level ? 2 : 0)
        | (bottomLeft >= level ? 1 : 0)
      if (code === 0 || code === 15) continue

      const x = column * stepX
      const y = row * stepY
      const top = interpolateEdge(level, topLeft, topRight, { x, y }, { x: x + stepX, y })
      const right = interpolateEdge(level, topRight, bottomRight, { x: x + stepX, y }, { x: x + stepX, y: y + stepY })
      const bottom = interpolateEdge(level, bottomLeft, bottomRight, { x, y: y + stepY }, { x: x + stepX, y: y + stepY })
      const left = interpolateEdge(level, topLeft, bottomLeft, { x, y }, { x, y: y + stepY })

      if (code === 1) add(left, bottom)
      if (code === 2) add(bottom, right)
      if (code === 3) add(left, right)
      if (code === 4) add(top, right)
      if (code === 5) { add(top, left); add(bottom, right) }
      if (code === 6) add(top, bottom)
      if (code === 7) add(top, left)
      if (code === 8) add(left, top)
      if (code === 9) add(top, bottom)
      if (code === 10) { add(top, right); add(left, bottom) }
      if (code === 11) add(top, right)
      if (code === 12) add(left, right)
      if (code === 13) add(bottom, right)
      if (code === 14) add(left, bottom)
    }
  }
  return segments
}

function segmentsToContour(segments, level) {
  const path = segments.map(([first, second]) => `M${first.x.toFixed(1)} ${first.y.toFixed(1)}L${second.x.toFixed(1)} ${second.y.toFixed(1)}`).join('')
  if (!segments.length) return { minutes: level, path, label: null }
  const target = { x: 250 + ((level / 15) % 4) * 150, y: 205 + ((level / 15) % 3) * 125 }
  const candidate = segments.reduce((best, segment) => {
    const midpoint = { x: (segment[0].x + segment[1].x) / 2, y: (segment[0].y + segment[1].y) / 2 }
    const score = (midpoint.x - target.x) ** 2 + (midpoint.y - target.y) ** 2
    return !best || score < best.score ? { midpoint, score } : best
  }, null)
  return { minutes: level, path, label: { x: candidate.midpoint.x + 7, y: candidate.midpoint.y - 7 } }
}

export function createContourSet(stateId, resolution = 54) {
  const safeState = SCENARIO_ORDER.includes(stateId) ? stateId : SCENARIO_ORDER[0]
  const safeResolution = Math.max(36, Math.min(72, Math.round(resolution)))
  const cacheKey = `${safeState}-${safeResolution}`
  if (contourCache.has(cacheKey)) return contourCache.get(cacheKey)
  const field = createHeightField(safeState, safeResolution)
  const majorLevels = [30, 50, 60, 75, 90, 105]
  const minorLevels = [40, 55, 67.5, 82.5, 97.5]
  const result = {
    major: majorLevels.map((level) => segmentsToContour(contourSegments(field.minutes, safeResolution, level), level)).filter((item) => item.path),
    minor: minorLevels.map((level) => segmentsToContour(contourSegments(field.minutes, safeResolution, level), level)).filter((item) => item.path),
  }
  contourCache.set(cacheKey, result)
  return result
}

export function createScenarioSummary(stateId, stopId) {
  const safeState = SCENARIO_ORDER.includes(stateId) ? stateId : SCENARIO_ORDER[0]
  const safeStopId = stopById.has(stopId) ? stopId : REGION.lensStops[0].id
  const state = REGION.states[safeState]
  const stop = stopById.get(safeStopId)
  const evidence = getEvidence(safeState, safeStopId)
  return [
    'AVENOR PASSAGE SYSTEMS',
    FICTION_NOTICE,
    SYNTHETIC_NOTICE,
    NO_ENGAGEMENT_NOTICE,
    DECISION_USE_NOTICE,
    '',
    `${REGION.id} · ${state.label} · ${stop.label}`,
    `Journey duration: ${evidence.journey} minutes ${evidence.uncertainty}`,
    `Status: Illustrative synthetic ${state.label}-state assumption; not a forecast.`,
    `Transfers: ${evidence.transfers}`,
    `Endpoint dwell: ${evidence.dwell} minutes`,
    `Illustrative energy comparison index: ${evidence.energy} kWh-equivalent per passenger journey; not an engineering estimate.`,
    `Noise boundary: ${evidence.noise}`,
    `Service window: ${evidence.window}`,
    '',
    'Assumptions and limits:',
    ...REGION.assumptions.map((assumption) => `• ${assumption}`),
    '',
    'No study, briefing, license, engagement, payment, booking, or response request was created or sent.',
  ].join('\n')
}
