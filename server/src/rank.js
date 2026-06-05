const TIERS = [
  { name: 'Dev do Itaú',     min: 0    },
  { name: 'Arame Farpado',   min: 400  },
  { name: 'Buzz do Outback', min: 800  },
  { name: 'Consultor HCM',   min: 1200 },
  { name: 'New Hadez',       min: 1600 },
  { name: 'Big Fanfas',      min: 2000 },
]
const DIV_LABELS = ['IV', 'III', 'II', 'I']

function getRank(pts) {
  const p = Math.max(0, pts)
  let tierIdx = 0
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (p >= TIERS[i].min) { tierIdx = i; break }
  }
  const tier = TIERS[tierIdx]
  if (tier.name === 'Big Fanfas') {
    return { tier: 'Big Fanfas', division: null, label: 'Big Fanfas', pts: p, ptsInDiv: p - 2000, divMin: 2000, divMax: null }
  }
  const divIndex = Math.min(3, Math.floor((p - tier.min) / 100))
  const divMin = tier.min + divIndex * 100
  return {
    tier: tier.name,
    division: DIV_LABELS[divIndex],
    label: `${tier.name} ${DIV_LABELS[divIndex]}`,
    pts: p,
    divMin,
    divMax: divMin + 99,
    ptsInDiv: p - divMin,
  }
}

function applyMatchResult(currentPts, isWin) {
  if (isWin) {
    const gain = 15 + Math.floor(Math.random() * 11) // 15–25
    return { newPts: currentPts + gain, delta: gain }
  } else {
    const loss = 15 + Math.floor(Math.random() * 6)  // 15–20
    const newPts = Math.max(0, currentPts - loss)
    return { newPts, delta: -(currentPts - newPts) }
  }
}

module.exports = { getRank, applyMatchResult, TIERS }
