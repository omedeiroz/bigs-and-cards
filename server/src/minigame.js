const TYPES = ['teclado', 'choro', 'reacao', 'clique', 'par_impar', 'mira', 'jokenpo']

const SEQUENCES = [
  ['Q','W','A','S'], ['E','R','D','F'], ['A','S','D','F'],
  ['Q','E','A','D'], ['W','R','S','F'], ['Z','X','C','V'],
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generatePayload(type) {
  switch (type) {
    case 'teclado':   return { sequence: pick(SEQUENCES), durationMs: 8000 }
    case 'choro':     return { targetPct: 48 + Math.floor(Math.random() * 30), durationMs: 8000 }
    case 'reacao':    return { delayMs: 1500 + Math.floor(Math.random() * 2500), durationMs: 10000 }
    case 'clique':    return { durationMs: 5000 }
    case 'blefe':     return { durationMs: 12000 }
    case 'par_impar': return { durationMs: 15000 }
    case 'mira':      return { durationMs: 8000 }
    case 'jokenpo':   return { durationMs: 12000 }
    default:          return { durationMs: 10000 }
  }
}

function evaluate(type, payload, valA, valB) {
  // Se ninguém jogou, é empate — qualquer minigame
  if (valA == null && valB == null) return null

  switch (type) {
    case 'teclado': {
      const a = valA || { correct: 0, timeMs: Infinity }
      const b = valB || { correct: 0, timeMs: Infinity }
      if (a.correct !== b.correct) return a.correct > b.correct ? 'a' : 'b'
      if (a.timeMs !== b.timeMs) return a.timeMs < b.timeMs ? 'a' : 'b'
      return null
    }
    case 'choro': {
      const tgt = payload.targetPct
      // quem não jogou conta como erro máximo (não favorece ninguém)
      const da = valA?.pct == null ? Infinity : Math.abs(valA.pct - tgt)
      const db = valB?.pct == null ? Infinity : Math.abs(valB.pct - tgt)
      if (da === Infinity && db === Infinity) return null
      if (Math.abs(da - db) < 0.5) return null
      return da < db ? 'a' : 'b'
    }
    case 'reacao': {
      const ta = valA?.timeMs ?? Infinity
      const tb = valB?.timeMs ?? Infinity
      if (ta === Infinity && tb === Infinity) return null
      if (ta === Infinity) return 'b'
      if (tb === Infinity) return 'a'
      if (ta === tb) return null
      return ta < tb ? 'a' : 'b'
    }
    case 'clique': {
      const ca = valA?.clicks ?? 0
      const cb = valB?.clicks ?? 0
      if (ca === cb) return null
      return ca > cb ? 'a' : 'b'
    }
    case 'blefe': {
      const na = valA?.number ?? 0
      const nb = valB?.number ?? 0
      if (na === nb) return null
      return na > nb ? 'a' : 'b'
    }
    case 'par_impar': {
      const na = valA?.number ?? 1
      const nb = valB?.number ?? 1
      const parity = (na + nb) % 2 === 0 ? 'par' : 'impar'
      const aWins = valA?.choice === parity
      const bWins = valB?.choice === parity
      if (aWins && !bWins) return 'a'
      if (bWins && !aWins) return 'b'
      return null
    }
    case 'mira': {
      const ha = valA?.hits ?? 0
      const hb = valB?.hits ?? 0
      if (ha === hb) return null
      return ha > hb ? 'a' : 'b'
    }
    case 'jokenpo': {
      const pa = valA?.pick
      const pb = valB?.pick
      if (!pa && !pb) return null
      if (!pa) return 'b'
      if (!pb) return 'a'
      if (pa === pb) return null
      const beats = { pedra: 'tesoura', papel: 'pedra', tesoura: 'papel' }
      return beats[pa] === pb ? 'a' : 'b'
    }
    default: return null
  }
}

module.exports = { TYPES, generatePayload, evaluate }
