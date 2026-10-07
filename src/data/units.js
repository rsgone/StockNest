export const UNIT_TYPES = {
  weight: { label: 'Weight', units: ['kg', 'g'] },
  volume: { label: 'Volume', units: ['L', 'ml'] },
  count: { label: 'Quantity', units: ['pcs'] },
}

export const ALL_UNITS = ['kg', 'g', 'L', 'ml', 'pcs']

export function unitTypeOf(unit) {
  if (unit === 'kg' || unit === 'g') return 'weight'
  if (unit === 'L' || unit === 'ml') return 'volume'
  return 'count'
}

const STEP_BY_UNIT = {
  kg: 0.5,
  g: 50,
  L: 0.5,
  ml: 50,
  pcs: 1,
}

export function stepFor(unit) {
  return STEP_BY_UNIT[unit] ?? 1
}

export function formatQty(qty, unit) {
  const rounded = Math.round(qty * 100) / 100
  return `${rounded} ${unit}`
}

const QUICK_DELTAS = {
  kg: [-1, -0.5, 0.5, 1],
  g: [-100, -50, 50, 100],
  L: [-1, -0.5, 0.5, 1],
  ml: [-100, -50, 50, 100],
  pcs: [-2, -1, 1, 2],
}

export function quickDeltasFor(unit) {
  return QUICK_DELTAS[unit] ?? [-1, -0.5, 0.5, 1]
}