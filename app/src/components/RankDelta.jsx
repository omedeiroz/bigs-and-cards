// ============================================================
// RankDelta — evolução de rank pós-partida ranqueada
// Drop-in: app/src/components/RankDelta.jsx
//
// Consome o payload do evento socket `rank:update`:
//   { delta, newPts, isWin, rank }
// onde `rank` é o objeto de server/src/rank.js getRank():
//   { tier, division, label, pts, ptsInDiv, divMin, divMax }
// ============================================================
import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import RankBadge, { TIER_COLORS } from './RankBadge'

const DIV_LABELS = ['IV', 'III', 'II', 'I']

// anima um número de 0 até `to`
function useCountUp(to, dur = 900, run = true) {
  const [v, setV] = useState(run ? 0 : to)
  useEffect(() => {
    if (!run) { setV(to); return }
    let raf, t0
    const step = (ts) => {
      if (!t0) t0 = ts
      const k = Math.min(1, (ts - t0) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setV(Math.round(to * eased))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, run])
  return v
}

export default function RankDelta({ rankUpdate, animate = true }) {
  if (!rankUpdate) return null
  const { delta, newPts, isWin, rank } = rankUpdate
  const oldPts = newPts - delta
  const up = delta >= 0
  const c = TIER_COLORS[rank.tier] || TIER_COLORS['Dev do Itaú']
  const deltaColor = up ? 'var(--emerald)' : 'var(--crimson)'

  const animatedDelta = useCountUp(Math.abs(delta), 800, animate)
  const animatedPts = useCountUp(newPts, 1000, animate)

  const isFanfas = rank.tier === 'Big Fanfas'
  const pctTarget = isFanfas ? 100 : Math.max(0, Math.min(100, rank.ptsInDiv))
  const [barPct, setBarPct] = useState(
    animate ? Math.max(0, Math.min(100, oldPts - rank.divMin)) : pctTarget
  )
  useEffect(() => {
    if (!animate) { setBarPct(pctTarget); return }
    const t = setTimeout(() => setBarPct(pctTarget), 420)
    return () => clearTimeout(t)
  }, [pctTarget, animate])

  return (
    <div className="panel" style={{
      padding: 24, position: 'relative', overflow: 'hidden',
      background: up
        ? 'linear-gradient(180deg, rgba(138,226,52,0.10) 0%, var(--surface) 60%)'
        : 'linear-gradient(180deg, var(--crimson-soft) 0%, var(--surface) 60%)',
      borderColor: up ? 'rgba(138,226,52,0.4)' : 'var(--crimson-soft)',
    }}>
      <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.07, pointerEvents: 'none' }}>
        <div className="display" style={{ fontSize: 200, color: up ? 'var(--emerald)' : 'var(--crimson)' }}>{up ? '▲' : '▼'}</div>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="eyebrow" style={{ color: up ? 'var(--emerald)' : 'var(--crimson)' }}>
          ► RANQUEADA · {up ? 'SUBIU' : 'CAIU'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 16 }}>
          <div>
            <RankBadge rank={rank} />
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 10, letterSpacing: '0.12em' }}>
              {oldPts} → <span style={{ color: 'var(--ink-1)' }}>{animatedPts}</span> pts
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="display" style={{ fontSize: 64, lineHeight: 0.9, color: deltaColor, textShadow: `0 0 32px ${up ? 'rgba(138,226,52,0.4)' : 'var(--crimson-glow)'}` }}>
              {up ? '+' : '−'}{animatedDelta}
            </div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginTop: 2 }}>PONTOS</div>
          </div>
        </div>

        {isFanfas ? (
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={13} style={{ color: c.text }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: c.text }}>
              TIER MÁXIMO · {newPts} PTS TOTAIS
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-4)' }}>
                {rank.ptsInDiv}/100 NA DIVISÃO {rank.division}
              </span>
              <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-4)' }}>
                {rank.division === 'I'
                  ? 'PRÓX: SOBE DE TIER'
                  : `PRÓX: ${rank.tier} ${DIV_LABELS[DIV_LABELS.indexOf(rank.division) + 1] || ''}`}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${barPct}%`, background: up ? 'var(--emerald)' : 'var(--crimson)', borderRadius: 3, transition: 'width 0.8s var(--ease-out)' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
