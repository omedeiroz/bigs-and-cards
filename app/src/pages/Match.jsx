import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sword, Shield, Heart, Layers, Crosshair, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { cardById } from '../data/cards'
import { CostGem } from '../components/Card'

const PREVIEW_W = 280
const PREVIEW_H = 440

function StatChip({ icon: Icon, value, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color, fontWeight: 700, fontSize: 12, textShadow: '0 1px 2px rgba(0,0,0,0.75)' }}>
      <Icon size={11} /> {value}
    </span>
  )
}

function Section({ label, color, text }) {
  if (!text) return null
  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line-1)' }}>
      <div className="mono" style={{ fontSize: 8, letterSpacing: '0.2em', color, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.4 }}>{text}</div>
    </div>
  )
}

function HPRing({ hp, hpMax, size = 56, color = 'var(--sapphire)' }) {
  const r = size / 2 - 4
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, hp / hpMax)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray var(--dur-base) var(--ease-out)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="display" style={{ fontSize: size * 0.42, lineHeight: 1, color: 'var(--ink-1)' }}>{hp}</span>
        <span className="mono" style={{ fontSize: 8, color: 'var(--ink-4)', marginTop: -2 }}>/{hpMax}</span>
      </div>
    </div>
  )
}

function ElixirBar({ elixir, elixirMax }) {
  const slots = Array.from({ length: elixirMax }, (_, i) => i < elixir)
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {slots.map((on, i) => (
        <div key={i} style={{
          width: 12, height: 16,
          background: on ? 'radial-gradient(circle at 35% 30%, #D7A5FF, var(--purple) 70%)' : 'var(--surface-2)',
          border: `1px solid ${on ? 'var(--purple)' : 'var(--line-2)'}`,
          borderRadius: 2,
          boxShadow: on ? '0 0 5px rgba(177,123,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.4)' : 'none',
          transition: 'all var(--dur-base) var(--ease-out)',
        }} />
      ))}
      <span className="mono" style={{ fontSize: 11, color: 'var(--purple)', marginLeft: 6, fontWeight: 700 }}>{elixir}/{elixirMax}</span>
    </div>
  )
}

function BoardSlot({ highlight }) {
  return (
    <div style={{
      width: 92, height: 116, borderRadius: 10, flexShrink: 0,
      border: `1px dashed ${highlight ? 'var(--gold)' : 'var(--line-2)'}`,
      background: highlight ? 'rgba(255,201,60,0.04)' : 'rgba(255,255,255,0.02)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="mono" style={{ fontSize: 8, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>VAZIO</span>
    </div>
  )
}

function GameLog({ log }) {
  if (!log.length) return null
  const recent = log.slice(-6)
  return (
    <div style={{
      position: 'fixed', top: 60, right: 16, width: 240, zIndex: 40,
      background: 'rgba(10,9,8,0.78)', backdropFilter: 'blur(16px)',
      border: '1px solid var(--line-1)', borderRadius: 8, padding: '10px 12px',
      fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.55,
    }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginBottom: 6 }}>► LOG</div>
      {recent.map((l, i) => {
        const color = l.kind === 'sys' ? 'var(--ink-4)' : l.kind === 'me' ? 'var(--gold)' : 'var(--crimson)'
        const prefix = l.kind === 'sys' ? '◇ ' : l.kind === 'me' ? '› você ' : '‹ adv. '
        return (
          <div key={l.id} style={{ color, opacity: i === recent.length - 1 ? 1 : 0.55 }}>
            {prefix}{l.text}
          </div>
        )
      })}
    </div>
  )
}

function HoverCard({ data, live, anchor }) {
  if (!data || !anchor) return null

  const cx = anchor.left + anchor.width / 2
  const above = anchor.top - 12 - PREVIEW_H
  const below = anchor.bottom + 12
  const top = above >= 8 ? above : Math.min(window.innerHeight - PREVIEW_H - 8, below)
  const left = Math.min(Math.max(8, cx - PREVIEW_W / 2), window.innerWidth - PREVIEW_W - 8)

  const atk = live?.atk ?? data.atk
  const def = live?.def ?? data.def
  const hp = live?.hp ?? data.hp
  const maxHp = live?.maxHp ?? data.hp

  return (
    <div style={{
      position: 'fixed', top, left, width: PREVIEW_W,
      background: 'var(--bg-2)', border: `2px solid ${data.accent}`,
      borderRadius: 12, padding: 12, zIndex: 100,
      boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <CostGem cost={data.cost} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{data.name}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: data.accent, textTransform: 'uppercase', marginTop: 2 }}>▸ {data.tagline}</div>
        </div>
      </div>

      <div style={{ marginTop: 10, height: 130, borderRadius: 8, overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
        <img src={`/cards/${data.id}.png`} alt={data.name} onError={e => { e.currentTarget.style.display = 'none' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.92) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 6, left: 10, right: 10, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <StatChip icon={Sword} value={atk} color="#ff6b80" />
          <StatChip icon={Shield} value={def} color="#7ff0c8" />
          <StatChip icon={Heart} value={`${hp}/${maxHp}`} color="#9cc4ff" />
        </div>
      </div>

      <Section label="PASSIVA" color="var(--gold)" text={data.passive} />
      {data.special && (
        <Section
          label={`ESPECIAL · ${data.special.name?.toUpperCase()} (${data.special.cost})`}
          color="var(--purple)"
          text={data.special.desc}
        />
      )}
      {data.counter && (
        <Section
          label={`COUNTER · ${data.counter.name?.toUpperCase()}`}
          color="var(--crimson)"
          text={data.counter.desc}
        />
      )}
      {(data.duo || []).map((d, i) => (
        <Section
          key={i}
          label={`DUO · ${d.name?.toUpperCase()}`}
          color="var(--mint)"
          text={d.desc}
        />
      ))}
    </div>
  )
}

function Minion({ m, selectable, selected, targetable, onClick, onHover, onLeave, innerRef, flashKey, flashColor, specialBtn }) {
  const data = cardById(m.cardId) || {}
  const dim = m.summoned || m.hasAttacked
  const interactive = selectable || targetable
  let border = data.accent || 'var(--line-3)'
  let shadow = 'none'
  if (selected) { border = 'var(--gold)'; shadow = '0 0 0 2px var(--bg), 0 0 12px var(--gold)' }
  else if (targetable) { border = 'var(--crimson)'; shadow = '0 0 10px rgba(255,61,90,0.6)' }
  else if (selectable) { shadow = '0 0 8px rgba(255,201,60,0.4)' }
  if (m.counterImmune) { border = 'var(--mint)'; shadow = '0 0 10px rgba(84,224,176,0.5)' }

  return (
    <div
      ref={innerRef}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={e => onHover?.(data, e.currentTarget.getBoundingClientRect(), m)}
      onMouseLeave={onLeave}
      style={{
        width: 92, height: 116, borderRadius: 10, flexShrink: 0,
        background: 'var(--surface-2)', border: `2px solid ${border}`, boxShadow: shadow,
        position: 'relative', overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        opacity: dim && !selected ? 0.55 : 1,
        transition: 'box-shadow var(--dur-fast), opacity var(--dur-fast)',
        animation: flashKey ? 'hitShake 0.35s ease-out' : 'none',
      }}
    >
      <div className="display" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: data.accent || 'var(--ink-3)', opacity: 0.4 }}>
        {(data.name || '?')[0].toUpperCase()}
      </div>
      <img src={`/cards/${m.cardId}.png`} alt={data.name || m.cardId} onError={e => { e.currentTarget.style.display = 'none' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 52%, rgba(0,0,0,0.88) 100%)' }} />
      {flashKey && (
        <div key={flashKey} style={{ position: 'absolute', inset: 0, background: flashColor || 'rgba(255,61,90,0.55)', animation: 'hitFlash 0.45s ease-out forwards', pointerEvents: 'none', zIndex: 5 }} />
      )}
      {m.summoned && (
        <span className="mono" style={{ position: 'absolute', top: 4, right: 5, fontSize: 7, letterSpacing: '0.1em', color: '#fff', textShadow: '0 1px 2px #000', zIndex: 6 }}>ZZ</span>
      )}
      <div className="mono" style={{ position: 'absolute', top: 4, left: 0, right: 0, fontSize: 8, letterSpacing: '0.06em', color: '#fff', textAlign: 'center', fontWeight: 700, textShadow: '0 1px 3px #000', zIndex: 6 }}>
        {(data.name || m.cardId).toUpperCase()}
      </div>
      <div style={{ position: 'absolute', bottom: 5, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 6 }}>
        <StatChip icon={Sword} value={m.atk} color="#ff6b80" />
        <StatChip icon={Shield} value={m.def} color="#7ff0c8" />
        <StatChip icon={Heart} value={m.hp} color="#9cc4ff" />
      </div>
      {specialBtn && (
        <button
          title={`Especial (${specialBtn.cost} elixir)`}
          onClick={e => { e.stopPropagation(); specialBtn.onClick() }}
          disabled={!specialBtn.enabled}
          style={{
            position: 'absolute', top: 22, right: 4, zIndex: 7,
            width: 22, height: 22, borderRadius: '50%',
            background: specialBtn.enabled ? 'var(--purple)' : 'rgba(177,123,255,0.25)',
            color: '#fff', border: '1px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: specialBtn.enabled ? 'pointer' : 'not-allowed',
            padding: 0, boxShadow: specialBtn.active ? '0 0 0 2px var(--purple), 0 0 10px var(--purple)' : 'none',
          }}
        >
          <Sparkles size={11} />
        </button>
      )}
    </div>
  )
}

function HandCard({ cardId, playable, onPlay, onHover, onLeave }) {
  const data = cardById(cardId) || {}
  return (
    <button
      onClick={playable ? onPlay : undefined}
      onMouseEnter={e => onHover?.(data, e.currentTarget.getBoundingClientRect(), null)}
      onMouseLeave={onLeave}
      style={{
        width: 100, height: 132, borderRadius: 12, flexShrink: 0,
        background: 'var(--surface-2)', border: `2px solid ${data.accent || 'var(--line-3)'}`,
        position: 'relative', overflow: 'hidden', padding: 0,
        cursor: playable ? 'pointer' : 'default',
        opacity: playable ? 1 : 0.55,
        transition: 'transform var(--dur-fast)',
      }}
      onMouseOver={e => { if (playable) e.currentTarget.style.transform = 'translateY(-8px)' }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div className="display" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: data.accent || 'var(--ink-3)', opacity: 0.4 }}>
        {(data.name || '?')[0].toUpperCase()}
      </div>
      <img src={`/cards/${cardId}.png`} alt={data.name || cardId} onError={e => { e.currentTarget.style.display = 'none' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 32%, transparent 50%, rgba(0,0,0,0.88) 100%)' }} />
      <div style={{
        position: 'absolute', top: 5, left: 5,
        width: 24, height: 24, borderRadius: '50%',
        background: 'var(--purple)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 12, border: '2px solid var(--bg)'
      }}>
        {data.cost}
      </div>
      <div className="mono" style={{ position: 'absolute', top: 6, left: 0, right: 0, fontSize: 8, letterSpacing: '0.05em', color: '#fff', textAlign: 'center', fontWeight: 700, textShadow: '0 1px 3px #000' }}>
        {(data.name || cardId).toUpperCase()}
      </div>
      <div style={{ position: 'absolute', bottom: 6, left: 7, right: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatChip icon={Sword} value={data.atk} color="#ff6b80" />
        <StatChip icon={Shield} value={data.def} color="#7ff0c8" />
        <StatChip icon={Heart} value={data.hp} color="#9cc4ff" />
      </div>
    </button>
  )
}

// ============================================================
// MINIGAME OVERLAY
// ============================================================
const MG_META = {
  teclado:   { name: 'Teclado Quente',      type: 'QTE',       accent: 'var(--crimson)' },
  choro:     { name: 'Segura o Choro',       type: 'QTE',       accent: 'var(--gold)'    },
  reacao:    { name: 'Reação Pura',          type: 'QTE',       accent: 'var(--emerald)' },
  clique:    { name: 'Clique Frenético',     type: 'QTE',       accent: 'var(--sapphire)'},
  par_impar: { name: 'Par ou Ímpar',         type: 'Clássico',  accent: 'var(--mint)'    },
  mira:      { name: 'Mira Louca',           type: 'Precisão',  accent: 'var(--crimson)' },
  jokenpo:   { name: 'Pedra Papel Tesoura',  type: 'Estratégia',accent: 'var(--gold)'    },
}

function CountdownRing({ total, remaining, accent }) {
  const r = 60, c = 2 * Math.PI * r
  const pct = Math.max(0, remaining / total)
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width={140} height={140} viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--line-2)" strokeWidth="6" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={accent} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${accent})`, transition: 'stroke-dashoffset 0.1s linear' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="display" style={{ fontSize: 40, color: accent, lineHeight: 1 }}>{remaining.toFixed(1)}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>SEG</div>
      </div>
    </div>
  )
}

function MGKeySeq({ sequence, typed }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {sequence.map((k, i) => {
        const state = i < typed ? 'ok' : i === typed ? 'next' : 'pending'
        const colors = { ok: 'var(--gold)', next: 'var(--ink-1)', pending: 'var(--ink-4)' }
        const bgs = { ok: 'var(--gold-soft)', next: 'var(--surface-3)', pending: 'var(--bg)' }
        return (
          <div key={i} style={{
            width: 52, height: 52, borderRadius: 8,
            background: bgs[state], border: `2px solid ${colors[state]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 22, color: colors[state],
            boxShadow: state === 'next' ? `0 0 0 3px var(--gold-soft)` : 'none',
          }}>{k}</div>
        )
      })}
    </div>
  )
}

function JShape({ kind, color, size = 40 }) {
  if (kind === 'pedra') return (
    <svg width={size} height={size} viewBox="0 0 64 64"><defs><radialGradient id={`rg${kind}${color}`} cx="0.35" cy="0.35"><stop offset="0" stopColor={color} stopOpacity="0.9"/><stop offset="1" stopColor={color} stopOpacity="0.3"/></radialGradient></defs><circle cx="32" cy="34" r="22" fill={`url(#rg${kind}${color})`} stroke={color} strokeWidth="2"/></svg>
  )
  if (kind === 'papel') return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth="2.5"><path d="M12 14 L44 14 L52 22 L52 52 L12 52 Z" fill={`${color}22`}/><path d="M44 14 L44 22 L52 22"/><line x1="18" y1="30" x2="46" y2="30" opacity="0.6"/><line x1="18" y1="38" x2="46" y2="38" opacity="0.6"/></svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="46" r="8" fill={`${color}22`}/><circle cx="46" cy="46" r="8" fill={`${color}22`}/><line x1="24" y1="40" x2="50" y2="14"/><line x1="40" y1="40" x2="14" y2="14"/></svg>
  )
}

function MGPlay({ type, payload, onSubmit, submitted }) {
  const { useEffect: ue, useRef: ur, useState: us } = { useEffect, useRef, useState }
  const accent = MG_META[type]?.accent || 'var(--gold)'

  // TECLADO
  if (type === 'teclado') {
    const [typed, setTyped] = us(0)
    const [startMs] = us(() => Date.now())
    ue(() => {
      if (submitted) return
      function onKey(e) {
        const seq = payload.sequence
        if (e.key.toUpperCase() === seq[typed]) {
          const next = typed + 1
          setTyped(next)
          if (next >= seq.length) onSubmit({ correct: seq.length, timeMs: Date.now() - startMs })
        } else {
          onSubmit({ correct: typed, timeMs: Date.now() - startMs })
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [typed, submitted])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>DIGITA A SEQUÊNCIA — RÁPIDO</div>
        <MGKeySeq sequence={payload.sequence} typed={typed} />
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-4)' }}>{typed}/{payload.sequence.length}</div>
      </div>
    )
  }

  // CHORO
  if (type === 'choro') {
    const [pct, setPct] = us(0)
    const [stopped, setStopped] = us(false)
    const [dir, setDir] = us(1)
    const animRef = ur(null)
    const pctRef = ur(0)
    const dirRef = ur(1)
    ue(() => {
      if (stopped || submitted) return
      const speed = 0.85
      function frame() {
        pctRef.current += speed * dirRef.current
        if (pctRef.current >= 100) { pctRef.current = 100; dirRef.current = -1 }
        if (pctRef.current <= 0)   { pctRef.current = 0;   dirRef.current = 1  }
        setPct(pctRef.current)
        animRef.current = requestAnimationFrame(frame)
      }
      animRef.current = requestAnimationFrame(frame)
      return () => cancelAnimationFrame(animRef.current)
    }, [stopped, submitted])
    function stop() {
      if (stopped) return
      setStopped(true)
      cancelAnimationFrame(animRef.current)
      onSubmit({ pct: pctRef.current })
    }
    ue(() => {
      function onKey(e) { if (e.code === 'Space') { e.preventDefault(); stop() } }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [stopped])
    const tgt = payload.targetPct
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>PARA A BARRA NA ZONA DOURADA</div>
        <div style={{ width: 600, position: 'relative', paddingTop: 24, paddingBottom: 24 }}>
          <div style={{ width: '100%', height: 52, background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${tgt - 6}%`, width: '12%', background: 'var(--gold-soft)', borderLeft: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }} />
            <div style={{ position: 'absolute', top: -4, bottom: -4, left: `${pct}%`, width: 4, background: 'var(--ink-1)', boxShadow: '0 0 12px var(--ink-1)', transform: 'translateX(-2px)' }} />
          </div>
          <div className="mono" style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em' }}>
            ZONA ALVO: {tgt}% — SUA POS: {Math.round(pct)}%
          </div>
        </div>
        <button onClick={stop} disabled={stopped} className="btn btn-primary btn-lg" style={{ height: 64, padding: '0 40px', fontSize: 28, opacity: stopped ? 0.6 : 1 }}>
          {stopped ? `PAROU · ${Math.round(pct)}%` : 'PARAR! (ESPAÇO)'}
        </button>
      </div>
    )
  }

  // REAÇÃO
  if (type === 'reacao') {
    const [phase, setPhase] = us('waiting') // waiting | go | done
    const [startMs, setStartMs] = us(null)
    const [rt, setRt] = us(null)
    ue(() => {
      if (submitted) return
      const t = setTimeout(() => { setPhase('go'); setStartMs(Date.now()) }, payload.delayMs)
      return () => clearTimeout(t)
    }, [submitted])
    ue(() => {
      // timeout: se não clicar em 3s depois do GO, submit null
      if (phase !== 'go' || submitted) return
      const t = setTimeout(() => { setPhase('done'); onSubmit({ timeMs: null }) }, 3000)
      return () => clearTimeout(t)
    }, [phase, submitted])
    function click() {
      if (phase === 'waiting') { setPhase('done'); onSubmit({ timeMs: null }) }
      else if (phase === 'go') {
        const time = Date.now() - startMs
        setRt(time)
        setPhase('done')
        onSubmit({ timeMs: time })
      }
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>QUANDO FICAR VERDE — APERTA</div>
        <button onClick={click} disabled={phase === 'done'} style={{
          width: 600, height: 280, borderRadius: 16, border: 'none', cursor: phase === 'done' ? 'default' : 'pointer',
          background: phase === 'go' ? 'var(--emerald)' : phase === 'done' ? 'var(--surface-3)' : 'var(--surface-2)',
          boxShadow: phase === 'go' ? '0 0 80px rgba(138,226,52,0.6)' : 'none',
          transition: 'background 0.1s',
        }}>
          <div className="display" style={{ fontSize: 120, color: phase === 'go' ? 'var(--bg)' : 'var(--ink-4)', lineHeight: 1 }}>
            {phase === 'waiting' ? '...' : phase === 'go' ? 'VAI!' : rt ? `${rt}ms` : 'CEDO'}
          </div>
        </button>
      </div>
    )
  }

  // CLIQUE
  if (type === 'clique') {
    const [clicks, setClicks] = us(0)
    const [timeLeft, setTimeLeft] = us(5)
    const clicksRef = ur(0)
    const doneRef = ur(false)
    ue(() => {
      if (submitted) return
      const start = Date.now()
      const interval = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000
        const left = Math.max(0, 5 - elapsed)
        setTimeLeft(left)
        if (left <= 0 && !doneRef.current) {
          doneRef.current = true
          clearInterval(interval)
          onSubmit({ clicks: clicksRef.current })
        }
      }, 50)
      return () => clearInterval(interval)
    }, [submitted])
    function click() {
      if (doneRef.current) return
      clicksRef.current++
      setClicks(clicksRef.current)
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>5 SEGUNDOS · MAIS CLIQUES VENCE</div>
        <CountdownRing total={5} remaining={timeLeft} accent={accent} />
        <div className="display" style={{ fontSize: 80, color: accent, lineHeight: 1 }}>{clicks}</div>
        <button onClick={click} style={{
          width: 220, height: 220, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}, ${accent}99)`,
          border: `3px solid ${accent}`,
          color: 'var(--bg)', fontFamily: 'var(--font-display)', fontSize: 32,
          boxShadow: `0 8px 0 rgba(0,0,0,0.3), 0 0 48px ${accent}66`,
          cursor: 'pointer',
        }}>
          CLICAR
        </button>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-4)' }}>CLIQUE OU PRESSIONE ESPAÇO</div>
      </div>
    )
  }

  // PAR OU ÍMPAR
  if (type === 'par_impar') {
    const [num, setNum] = us(null)
    const done = submitted
    const myParity = (payload.yourParity || '').toUpperCase()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>
          VOCÊ É <span style={{ color: accent, fontWeight: 700 }}>{myParity}</span> · ESCOLHE UM NÚMERO (1-10) · A SOMA DECIDE
        </div>
        <div style={{
          padding: '8px 24px', borderRadius: 10, border: `2px solid ${accent}`,
          background: 'var(--surface-2)', fontFamily: 'var(--font-display)', fontSize: 28, color: accent,
        }}>
          {myParity}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 52px)', gap: 8 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => !done && setNum(n)} style={{
              width: 52, height: 52, borderRadius: 8,
              background: num === n ? 'var(--mint)' : 'var(--surface-2)',
              border: `2px solid ${num === n ? 'var(--mint)' : 'var(--line-2)'}`,
              fontFamily: 'var(--font-display)', fontSize: 22,
              color: num === n ? 'var(--bg)' : 'var(--ink-1)',
              cursor: done ? 'default' : 'pointer',
            }}>{n}</button>
          ))}
        </div>
        <button onClick={() => num && onSubmit({ number: num })} disabled={!num || done} className="btn btn-primary btn-lg" style={{ opacity: (!num || done) ? 0.5 : 1 }}>
          {done ? 'Aguardando oponente...' : 'Confirmar'}
        </button>
      </div>
    )
  }

  // MIRA LOUCA
  if (type === 'mira') {
    const [hits, setHits] = us(0)
    const [pos, setPos] = us({ x: 50, y: 50 })
    const hitsRef = ur(0)
    const doneRef = ur(false)
    const animRef = ur(null)
    const posRef = ur({ x: 50, y: 50 })
    ue(() => {
      if (submitted) return
      // Move target smoothly
      let t = 0
      function frame() {
        t += 0.045
        const x = 20 + 60 * (0.5 + 0.5 * Math.sin(t * 1.7))
        const y = 20 + 60 * (0.5 + 0.5 * Math.cos(t * 1.3))
        posRef.current = { x, y }
        setPos({ x, y })
        animRef.current = requestAnimationFrame(frame)
      }
      animRef.current = requestAnimationFrame(frame)
      // Timeout
      const timeout = setTimeout(() => {
        if (!doneRef.current) { doneRef.current = true; cancelAnimationFrame(animRef.current); onSubmit({ hits: hitsRef.current }) }
      }, payload.durationMs)
      return () => { cancelAnimationFrame(animRef.current); clearTimeout(timeout) }
    }, [submitted])
    function hitTarget(e) {
      if (doneRef.current) return
      e.stopPropagation()
      hitsRef.current++
      setHits(hitsRef.current)
      if (hitsRef.current >= 3) { doneRef.current = true; cancelAnimationFrame(animRef.current); onSubmit({ hits: 3 }) }
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>ALVO MOVENDO · 3 HITS VENCEM · {hits}/3</div>
        <div style={{ width: 600, height: 320, background: 'var(--bg-2)', border: '2px solid var(--line-2)', borderRadius: 14, position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--line-1) 1px, transparent 1px), linear-gradient(90deg, var(--line-1) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }} />
          <div onClick={hitTarget} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', width: 64, height: 64, cursor: 'crosshair' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--crimson)', boxShadow: '0 0 20px var(--crimson)' }} />
            <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', border: '2px solid var(--crimson)', opacity: 0.5 }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, borderRadius: '50%', background: 'var(--crimson)', transform: 'translate(-50%,-50%)' }} />
          </div>
          <div className="mono" style={{ position: 'absolute', top: 8, left: 8, fontSize: 9, letterSpacing: '0.16em', color: 'var(--crimson)' }}>◎ {hits}/3 HITS</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: i < hits ? 'var(--emerald)' : 'transparent', border: `2px solid ${i < hits ? 'var(--emerald)' : 'var(--line-2)'}` }} />
          ))}
        </div>
      </div>
    )
  }

  // PEDRA PAPEL TESOURA
  if (type === 'jokenpo') {
    const [pick, setPick] = us(null)
    const opts = ['pedra','papel','tesoura']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>PEDRA PAPEL TESOURA · ESCOLHA E CONFIRME</div>
        <div style={{ display: 'flex', gap: 16 }}>
          {opts.map(o => (
            <button key={o} onClick={() => !submitted && setPick(o)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 24px',
              background: pick === o ? 'var(--gold-soft)' : 'var(--surface-2)',
              border: `2px solid ${pick === o ? 'var(--gold)' : 'var(--line-2)'}`,
              borderRadius: 12, color: pick === o ? 'var(--gold)' : 'var(--ink-2)',
              fontFamily: 'var(--font-display)', fontSize: 18,
              boxShadow: pick === o ? '0 0 24px var(--gold-glow)' : 'none',
              cursor: submitted ? 'default' : 'pointer',
            }}>
              <JShape kind={o} color={pick === o ? 'var(--gold)' : 'var(--ink-3)'} />
              {o.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={() => pick && onSubmit({ pick })} disabled={!pick || submitted} className="btn btn-primary btn-lg" style={{ opacity: (!pick || submitted) ? 0.5 : 1 }}>
          {submitted ? 'Aguardando oponente...' : 'Confirmar'}
        </button>
      </div>
    )
  }

  return <div className="mono" style={{ color: 'var(--ink-4)' }}>CARREGANDO MINIGAME...</div>
}

function MinigameConfirm({ data, socket, roomId }) {
  const [sent, setSent] = useState(false)
  const [readyCount, setReadyCount] = useState(0)
  const meta = MG_META[data.type] || MG_META.teclado
  const accent = meta.accent

  useEffect(() => {
    function onReadyState({ ready }) { setReadyCount(ready) }
    socket.on('minigame:readyState', onReadyState)
    return () => socket.off('minigame:readyState', onReadyState)
  }, [socket])

  function handleReady() {
    if (sent) return
    setSent(true)
    socket.emit('minigame:ready', roomId)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
    }}>
      <div className="eyebrow" style={{ color: accent, letterSpacing: '0.22em' }}>◆ MINIGAME CHEGANDO ◆</div>
      <div className="display" style={{
        fontSize: 80, lineHeight: 0.9, textAlign: 'center',
        background: `linear-gradient(180deg, var(--ink-1), ${accent})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {meta.name.toUpperCase()}
      </div>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>
        {meta.type.toUpperCase()} · RODADA {data.round}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            width: 52, height: 52, borderRadius: '50%',
            border: `2px solid ${i < readyCount ? 'var(--emerald)' : 'var(--line-2)'}`,
            background: i < readyCount ? 'rgba(138,226,52,0.12)' : 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
            fontSize: 22,
          }}>
            <span style={{ color: i < readyCount ? 'var(--emerald)' : 'var(--ink-4)' }}>
              {i < readyCount ? '✓' : '·'}
            </span>
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)', marginTop: -16 }}>
        {readyCount}/2 prontos
      </div>

      <button
        onClick={handleReady}
        disabled={sent}
        className="btn btn-primary btn-lg"
        style={{ height: 64, padding: '0 56px', fontSize: 20, opacity: sent ? 0.6 : 1 }}
      >
        {sent ? 'Aguardando oponente...' : 'PRONTO!'}
      </button>

      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>
        começa automaticamente em alguns segundos se não confirmar
      </div>
    </div>
  )
}

// Revela o que cada jogador jogou (par/ímpar, jokenpo) antes da tela de dano
function RevealStage({ type, result, myId, me, opponent, accent }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1000)
    return () => clearTimeout(t)
  }, [])

  const myVal = result.values?.[myId]
  const oppVal = result.values?.[opponent?.id]
  const iWon = result.winner === myId
  const oppWon = result.winner === opponent?.id

  function Pane({ who, sub, color, won, children }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color }}>{who}</div>
        <div style={{
          width: 170, height: 210, borderRadius: 16,
          border: `2px solid ${shown && won ? 'var(--emerald)' : color}`,
          background: 'var(--surface-2)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: shown ? `0 0 36px ${won ? 'rgba(138,226,52,0.5)' : color + '44'}` : 'none',
          transform: shown ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.45s var(--ease-out)',
        }}>
          {shown ? children : <span className="display" style={{ fontSize: 90, color: 'var(--ink-4)' }}>?</span>}
        </div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: shown && won ? 'var(--emerald)' : 'var(--ink-4)', minHeight: 12 }}>
          {shown ? (won ? `${sub} · VENCEU` : sub) : '...'}
        </div>
      </div>
    )
  }

  let myContent = null, oppContent = null, center = null
  if (type === 'jokenpo') {
    const lbl = p => (p || '—').toUpperCase()
    myContent = <><JShape kind={myVal?.pick} color={accent} size={72} /><span className="display" style={{ fontSize: 20 }}>{lbl(myVal?.pick)}</span></>
    oppContent = <><JShape kind={oppVal?.pick} color="var(--crimson)" size={72} /><span className="display" style={{ fontSize: 20 }}>{lbl(oppVal?.pick)}</span></>
  } else if (type === 'par_impar') {
    const myPar = result.reveal?.parities?.[myId]
    const oppPar = result.reveal?.parities?.[opponent?.id]
    const sum = (myVal?.number ?? 0) + (oppVal?.number ?? 0)
    const finalPar = sum % 2 === 0 ? 'PAR' : 'ÍMPAR'
    myContent = <><span className="display" style={{ fontSize: 72, color: accent, lineHeight: 1 }}>{myVal?.number ?? '—'}</span><span className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: accent }}>{(myPar || '').toUpperCase()}</span></>
    oppContent = <><span className="display" style={{ fontSize: 72, color: 'var(--crimson)', lineHeight: 1 }}>{oppVal?.number ?? '—'}</span><span className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--crimson)' }}>{(oppPar || '').toUpperCase()}</span></>
    center = shown ? (
      <div style={{ textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 40, color: 'var(--ink-1)', lineHeight: 1 }}>{sum}</div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--gold)', marginTop: 4 }}>SOMA = {finalPar}</div>
      </div>
    ) : null
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="eyebrow" style={{ color: accent, marginBottom: 24 }}>◆ O QUE CADA UM JOGOU ◆</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <Pane who={`@${me?.username}`} sub="VOCÊ" color="var(--gold)" won={iWon}>{myContent}</Pane>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 90 }}>
          <div className="display" style={{ fontSize: 32, color: 'var(--ink-4)' }}>VS</div>
          {center}
        </div>
        <Pane who={`@${opponent?.username}`} sub="OPONENTE" color="var(--crimson)" won={oppWon}>{oppContent}</Pane>
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)', marginTop: 26 }}>
        {shown ? 'apurando o resultado...' : 'revelando...'}
      </div>
    </div>
  )
}

function MinigameOverlay({ data, socket, roomId, myId, me, opponent, onClose }) {
  const [phase, setPhase] = useState('ready')
  const [countdown, setCountdown] = useState(data.type === 'teclado' ? 1 : 5)
  const [result, setResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const meta = MG_META[data.type] || MG_META.teclado
  const accent = meta.accent

  // Ready countdown
  useEffect(() => {
    if (phase !== 'ready') return
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); setPhase('play'); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  // Listen for result
  useEffect(() => {
    function onResult(res) {
      setResult(res)
      const versus = res.type === 'par_impar' || res.type === 'jokenpo'
      if (versus) {
        setPhase('reveal')
        setTimeout(() => setPhase('result'), 3000)
        setTimeout(onClose, 3000 + 4500)
      } else {
        setPhase('result')
        setTimeout(onClose, 4500)
      }
    }
    socket.on('minigame:result', onResult)
    return () => socket.off('minigame:result', onResult)
  }, [socket, onClose])

  function handleSubmit(value) {
    if (submitted) return
    setSubmitted(true)
    socket.emit('minigame:submit', { roomId, value })
  }

  const iWon = result?.winner === myId
  const isDraw = result?.draw

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: `radial-gradient(ellipse at center, ${accent}18, var(--bg) 60%), linear-gradient(180deg, #16100b 0%, #0a0908 100%)`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* glow backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(900px 500px at 50% 45%, ${accent}18, transparent 70%)`, pointerEvents: 'none' }} />

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 2, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, rgba(10,9,8,0.9) 0%, transparent 100%)' }}>
        <span className="pill" style={{ background: 'rgba(255,61,90,0.18)', color: 'var(--crimson)', border: '1px solid var(--crimson-soft)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--crimson)', boxShadow: '0 0 8px var(--crimson)' }} /> MINIGAME ATIVO
        </span>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: accent }}>{meta.name.toUpperCase()}</div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>RODADA {data.round} · TIPO: {meta.type.toUpperCase()}</div>
      </div>

      {/* opponent banner */}
      <div style={{ position: 'relative', zIndex: 2, padding: '8px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', background: 'rgba(255,61,90,0.06)', border: '1px solid var(--crimson-soft)', borderRadius: 10, maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--crimson), var(--bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-1)' }}>{opponent?.username?.[0]?.toUpperCase()}</div>
          <div className="display" style={{ fontSize: 18 }}>{opponent?.username}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--crimson)' }}>● OPONENTE · {opponent?.hp} HP</div>
        </div>
      </div>

      {/* stage */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        {phase === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: accent, marginBottom: 20 }}>◆◆◆ MINIGAME EM {countdown} SEGUNDO{countdown !== 1 ? 'S' : ''} ◆◆◆</div>
            <div className="display" style={{ fontSize: 80, lineHeight: 0.9, background: `linear-gradient(180deg, var(--ink-1), ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>{meta.name}</div>
            <div style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 480, margin: '0 auto 36px' }}>
              {data.type === 'teclado'   && `Sequência: ${data.payload.sequence?.join(' · ')} — mais rápido vence`}
              {data.type === 'choro'     && `Para a barra na zona dourada (${data.payload.targetPct}%) — mais perto vence`}
              {data.type === 'reacao'    && 'Quando ficar verde — aperta o mais rápido possível'}
              {data.type === 'clique'    && '5 segundos — mais cliques vence'}
              {data.type === 'par_impar' && `Você é ${(data.payload?.yourParity || '').toUpperCase()} — escolhe um número, a soma decide`}
              {data.type === 'mira'      && 'Alvo em movimento — 3 hits vence'}
              {data.type === 'jokenpo'   && 'Pedra, papel ou tesoura — reveal simultâneo'}
            </div>
            <div style={{ width: 180, height: 180, margin: '0 auto', borderRadius: '50%', border: `3px solid ${accent}`, boxShadow: `0 0 48px ${accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="display" style={{ fontSize: 120, lineHeight: 1, color: accent }}>{countdown}</div>
            </div>
          </div>
        )}

        {phase === 'play' && (
          <div style={{ width: '100%', maxWidth: 800 }}>
            <MGPlay type={data.type} payload={data.payload} onSubmit={handleSubmit} submitted={submitted} />
            {submitted && (
              <div className="mono" style={{ textAlign: 'center', marginTop: 24, fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>
                ◆ AGUARDANDO OPONENTE...
              </div>
            )}
          </div>
        )}

        {phase === 'reveal' && result && (
          <RevealStage type={result.type} result={result} myId={myId} me={me} opponent={opponent} accent={accent} />
        )}

        {phase === 'result' && result && (
          <div style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: isDraw ? 'var(--gold)' : iWon ? 'var(--emerald)' : 'var(--crimson)', marginBottom: 12 }}>◆ MINIGAME ENCERRADO ◆</div>
            <div className="display" style={{ fontSize: 120, lineHeight: 0.9, color: isDraw ? 'var(--gold)' : iWon ? 'var(--emerald)' : 'var(--crimson)', textShadow: `0 0 48px ${isDraw ? 'rgba(255,201,60,0.5)' : iWon ? 'rgba(138,226,52,0.5)' : 'rgba(255,61,90,0.5)'}`, marginBottom: 12 }}>
              {isDraw ? 'EMPATE' : iWon ? 'VITÓRIA' : 'DERROTA'}
            </div>
            {!isDraw && result.damage > 0 && (
              <div style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 10 }}>
                {iWon ? `${opponent?.username} leva ${result.damage} de dano verdadeiro` : `Você levou ${result.damage} de dano verdadeiro`}
              </div>
            )}
            <div style={{ fontSize: 14, color: 'var(--purple)', marginBottom: 18, fontWeight: 600 }}>
              {isDraw ? '⬡ +1 elixir para cada' : iWon ? '⬡ +2 elixir para você' : '⬡ sem elixir desta vez'}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>Voltando à partida...</div>
          </div>
        )}
      </div>

      {/* me banner */}
      <div style={{ position: 'relative', zIndex: 2, padding: '8px 32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', background: 'var(--gold-soft)', border: '1px solid var(--line-gold)', borderRadius: 10, maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)' }}>{me?.username?.[0]?.toUpperCase()}</div>
          <div className="display" style={{ fontSize: 18 }}>@{me?.username}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--gold)' }}>● VOCÊ · {me?.hp} HP</div>
        </div>
      </div>
    </div>
  )
}

function PlayerBar({ p, isTurn, isOpponent, targetable, onClick, innerRef, children }) {
  const handCount = p.handCount ?? p.hand?.length ?? 0
  const accent = isOpponent ? 'var(--crimson)' : 'var(--gold)'
  return (
    <div
      ref={innerRef}
      onClick={targetable ? onClick : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 18px', borderRadius: 12,
        background: isOpponent ? 'rgba(255,61,90,0.06)' : 'var(--gold-soft)',
        border: targetable
          ? '1px solid var(--crimson)'
          : `1px solid ${isOpponent ? 'var(--crimson-soft)' : 'var(--line-gold)'}`,
        boxShadow: targetable ? '0 0 12px rgba(255,61,90,0.6)' : 'none',
        cursor: targetable ? 'pointer' : 'default',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--gold), var(--crimson))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, color: 'var(--ink-on-gold)', fontSize: 22, flexShrink: 0,
        boxShadow: isTurn ? '0 0 0 2px var(--bg), 0 0 0 4px var(--gold)' : 'none'
      }}>
        {p.username?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>@{p.username}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: accent, marginTop: 4 }}>
          {isOpponent ? `● OPONENTE · ${handCount} CARTAS` : (isTurn ? '● SUA VEZ' : '○ AGUARDANDO')}
        </div>
      </div>
      <HPRing hp={p.hp} hpMax={20} size={56} color={isOpponent ? 'var(--crimson)' : 'var(--sapphire)'} />
      <ElixirBar elixir={p.elixir} elixirMax={p.maxElixir} />
      {isOpponent && handCount > 0 && (
        <div style={{ display: 'flex', flexShrink: 0 }}>
          {Array.from({ length: Math.min(handCount, 6) }).map((_, i) => (
            <div key={i} style={{
              width: 22, height: 30, background: 'var(--bg-2)',
              border: '1px solid var(--gold)', borderRadius: 2, marginLeft: i ? -8 : 0,
            }} />
          ))}
        </div>
      )}
      {children}
    </div>
  )
}

export default function Match() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, match, clearMatch } = useSocket()
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [specialAim, setSpecialAim] = useState(null)  // { sourceUid, targetType: 'enemyCard'|'allyCard' }
  const [hover, setHover] = useState(null)            // { data, anchor, live }
  const [hits, setHits] = useState([])                // [{ id, x, y, text, color }]
  const [flashes, setFlashes] = useState({})          // { uid: { nonce, color } }
  const [log, setLog] = useState([])                  // [{ id, kind, text }]
  const [handOpen, setHandOpen] = useState(true)
  const [minigame, setMinigame] = useState(null)  // { type, payload, round }
  const matchStartRef = useRef(Date.now())
  const minionRefs = useRef(new Map())
  const oppFaceRef = useRef(null)
  const myFaceRef = useRef(null)
  const nonceRef = useRef(1)

  function registerMinionRef(uid) {
    return (el) => {
      if (el) minionRefs.current.set(uid, el)
      else minionRefs.current.delete(uid)
    }
  }

  function spawnHit(rect, text, color) {
    if (!rect) return
    const id = nonceRef.current++
    setHits(prev => [...prev, {
      id,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      text, color,
    }])
    setTimeout(() => setHits(prev => prev.filter(h => h.id !== id)), 950)
  }

  function flashMinion(uid, color) {
    const nonce = nonceRef.current++
    setFlashes(prev => ({ ...prev, [uid]: { nonce, color: color || 'rgba(255,61,90,0.55)' } }))
    setTimeout(() => {
      setFlashes(prev => {
        if (prev[uid]?.nonce !== nonce) return prev
        const next = { ...prev }; delete next[uid]; return next
      })
    }, 500)
  }

  function pushLog(kind, text) {
    setLog(prev => [...prev.slice(-30), { id: nonceRef.current++, kind, text }])
  }
  function cardName(cardId) { return cardById(cardId)?.name || cardId }

  useEffect(() => {
    if (!socket || !match) return
    socket.emit('game:join', match.roomId)

    function onState(s) { setState(s); setSelected(null); setSpecialAim(null) }
    function onError(msg) {
      setError(msg)
      setTimeout(() => setError(''), 2000)
    }
    function onEvent(ev) {
      if (ev.type === 'attack') {
        const mineActed = ev.attackerOwner === user.id
        if (ev.dmgToTarget > 0) {
          if (ev.target?.type === 'player') {
            const rect = (ev.target.ownerId === user.id ? myFaceRef : oppFaceRef).current?.getBoundingClientRect()
            spawnHit(rect, `-${ev.dmgToTarget}`, '#ff5470')
            pushLog(mineActed ? 'me' : 'opp', `atacou na cara (-${ev.dmgToTarget})`)
          } else {
            const el = minionRefs.current.get(ev.target.uid)
            spawnHit(el?.getBoundingClientRect(), `-${ev.dmgToTarget}`, '#ff5470')
            flashMinion(ev.target.uid)
          }
        }
        if (ev.dmgToAttacker > 0) {
          const el = minionRefs.current.get(ev.attackerUid)
          spawnHit(el?.getBoundingClientRect(), `-${ev.dmgToAttacker}`, '#ff5470')
          flashMinion(ev.attackerUid)
        }
        if (ev.target?.type === 'card') {
          pushLog(mineActed ? 'me' : 'opp', `${ev.taunt ? 'foi forçado a enfrentar ' : 'atacou '}(-${ev.dmgToTarget}/-${ev.dmgToAttacker})`)
        }
        if (ev.deaths?.length) pushLog('sys', `${ev.deaths.length} carta(s) morreram`)
      } else if (ev.type === 'special') {
        const mineActed = ev.sourceOwner === user.id
        if (ev.sourceUid) flashMinion(ev.sourceUid, 'rgba(177,123,255,0.55)')
        if (ev.target?.type === 'card') {
          flashMinion(ev.target.uid, 'rgba(177,123,255,0.55)')
        } else if (ev.target?.type === 'player' && ev.dmgToTarget > 0) {
          const rect = (ev.target.ownerId === user.id ? myFaceRef : oppFaceRef).current?.getBoundingClientRect()
          spawnHit(rect, `-${ev.dmgToTarget}`, '#b17bff')
        }
        const data = cardById(ev.cardId)
        pushLog(mineActed ? 'me' : 'opp', `usou ${data?.special?.name || 'especial'}${ev.dmgToTarget ? ` (-${ev.dmgToTarget})` : ''}`)
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') { setSelected(null); setSpecialAim(null) }
    }
    function onMinigamePending(data) {
      setMinigame({ type: data.type, round: data.round, phase: 'confirm' })
    }
    function onMinigameStart(data) {
      setMinigame({ type: data.type, payload: data.payload, round: data.round, phase: 'active' })
    }
    socket.on('game:state', onState)
    socket.on('game:error', onError)
    socket.on('game:event', onEvent)
    socket.on('minigame:pending', onMinigamePending)
    socket.on('minigame:start', onMinigameStart)
    window.addEventListener('keydown', onKey)
    return () => {
      socket.off('game:state', onState)
      socket.off('game:error', onError)
      socket.off('game:event', onEvent)
      socket.off('minigame:pending', onMinigamePending)
      socket.off('minigame:start', onMinigameStart)
      window.removeEventListener('keydown', onKey)
    }
  }, [socket, match, user])

  function playCard(handIndex) {
    socket.emit('game:playCard', { roomId: match.roomId, handIndex })
  }
  function endTurn() {
    setSelected(null)
    socket.emit('game:endTurn', match.roomId)
  }
  function doAttack(target) {
    if (selected == null) return
    socket.emit('game:attack', { roomId: match.roomId, attackerUid: selected, target })
    setSelected(null)
  }
  function openSpecial(m) {
    setSelected(null)
    if (specialAim?.sourceUid === m.uid) { setSpecialAim(null); return }
    if (!m.specialTarget) {
      socket.emit('game:special', { roomId: match.roomId, sourceUid: m.uid, target: null })
      setSpecialAim(null)
    } else {
      setSpecialAim({ sourceUid: m.uid, targetType: m.specialTarget })
    }
  }
  function doSpecial(target) {
    if (!specialAim) return
    socket.emit('game:special', { roomId: match.roomId, sourceUid: specialAim.sourceUid, target })
    setSpecialAim(null)
  }
  function exit() {
    if (match && state?.status === 'playing') socket.emit('game:surrender', match.roomId)
    clearMatch()
    navigate('/home')
  }

  function goToEnd() {
    const s = state
    const iWon = s ? s.winner === user.id : false
    const isDraw = s ? s.winner == null : false
    const secs = Math.round((Date.now() - matchStartRef.current) / 1000)
    const duration = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
    const meBoard = s?.me?.board || []
    const mvp = meBoard.length > 0
      ? meBoard.reduce((best, m) => (m.hp > best.hp ? m : best)).cardId
      : (s?.me?.graveyard?.[s.me.graveyard.length - 1] || 'bigs')
    clearMatch()
    navigate('/end', { state: {
      result: isDraw ? 'draw' : iWon ? 'win' : 'loss',
      score: `${s?.me?.hp ?? 0}–${s?.opponent?.hp ?? 0}`,
      rounds: s?.round ?? 0,
      duration,
      opponent: s?.opponent?.username ?? '???',
      matchType: match?.type || 'casual',
      mvp,
      stats: [
        { l: 'CARTAS JOGADAS',   v: s?.me?.stats?.cardsPlayed  ?? 0 },
        { l: 'ESPECIAIS USADAS', v: s?.me?.stats?.specialsUsed ?? 0 },
        { l: 'DANO INFLIGIDO',   v: s?.me?.stats?.damageDealt  ?? 0 },
        { l: 'MINIGAMES GANHOS', v: s?.me?.stats?.minigamesWon ?? 0 },
      ],
    }})
  }

  if (!match) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUMA PARTIDA ATIVA</div>
        <button onClick={() => navigate('/home')} className="btn btn-primary btn-lg">Voltar pra Home</button>
      </div>
    )
  }
  if (!state) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>CARREGANDO PARTIDA...</div>
      </div>
    )
  }

  const { me, opponent, isMyTurn, round, status, winner } = state
  const boardCap = state.boardCap ?? 3
  const ended = status === 'ended'
  const iWon = winner === user.id
  const canAttackWith = (m) => isMyTurn && !ended && !m.summoned && !m.hasAttacked
  const aiming = selected != null
  const aimingEnemy = specialAim?.targetType === 'enemyCard'
  const aimingAlly  = specialAim?.targetType === 'allyCard'

  const onCardHover = (data, anchor, m) => setHover({ data, anchor, live: m })
  const onCardLeave = () => setHover(null)

  function specialBtnFor(m) {
    if (!isMyTurn || ended) return null
    if (!m.specialImplemented) return null
    const enabled = !m.specialUsed && me.elixir >= (m.specialCost ?? 99) && !aiming
    return {
      cost: m.specialCost,
      enabled,
      active: specialAim?.sourceUid === m.uid,
      onClick: () => openSpecial(m),
    }
  }

  return (
    <>
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0d05 0%, #0a0908 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,9,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line-1)' }}>
        <button onClick={exit} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={12} /> Desistir
        </button>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: isMyTurn ? 'var(--gold)' : 'var(--ink-3)' }}>
          RODADA {round} — {isMyTurn ? '► SEU TURNO' : 'TURNO DO OPONENTE'}
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* arena centralizada */}
      <div style={{ paddingTop: 20, paddingBottom: handOpen ? 220 : 60, transition: 'padding var(--dur-base)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* opponent bar */}
          <PlayerBar p={opponent} isOpponent isTurn={!isMyTurn} innerRef={oppFaceRef} />

          <div className="eyebrow" style={{ color: 'var(--crimson)', textAlign: 'center' }}>► TABULEIRO DO OPONENTE</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {Array.from({ length: boardCap }).map((_, i) => {
              const m = opponent.board[i]
              if (!m) return <BoardSlot key={'oe' + i} />
              return (
                <Minion key={m.uid} m={m}
                  targetable={aiming || aimingEnemy}
                  onClick={() => {
                    if (aimingEnemy) doSpecial({ type: 'card', uid: m.uid })
                    else if (aiming) doAttack({ type: 'card', uid: m.uid })
                  }}
                  onHover={onCardHover} onLeave={onCardLeave}
                  innerRef={registerMinionRef(m.uid)}
                  flashKey={flashes[m.uid]?.nonce}
                  flashColor={flashes[m.uid]?.color}
                />
              )
            })}
          </div>

          {/* divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
            <div className="display" style={{ fontSize: 22, color: 'var(--gold)' }}>RODADA {round}</div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
          </div>

          <div className="eyebrow" style={{ color: 'var(--gold)', textAlign: 'center' }}>► SEU TABULEIRO</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {Array.from({ length: boardCap }).map((_, i) => {
              const m = me.board[i]
              if (!m) return <BoardSlot key={'me' + i} highlight={isMyTurn && me.hand.length > 0} />
              return (
                <Minion key={m.uid} m={m}
                  selectable={canAttackWith(m) && !specialAim}
                  selected={selected === m.uid}
                  targetable={aimingAlly}
                  onClick={() => {
                    if (aimingAlly) doSpecial({ type: 'card', uid: m.uid })
                    else if (canAttackWith(m)) setSelected(selected === m.uid ? null : m.uid)
                  }}
                  onHover={onCardHover} onLeave={onCardLeave}
                  innerRef={registerMinionRef(m.uid)}
                  flashKey={flashes[m.uid]?.nonce}
                  flashColor={flashes[m.uid]?.color}
                  specialBtn={specialBtnFor(m)}
                />
              )
            })}
          </div>

          {/* my bar */}
          <PlayerBar p={me} isTurn={isMyTurn} innerRef={myFaceRef}>
            <button onClick={() => setHandOpen(o => !o)} className="btn btn-ghost btn-sm">
              {handOpen ? 'Esconder mão ▾' : 'Abrir mão ▴'}
            </button>
            <button
              onClick={endTurn}
              disabled={!isMyTurn || ended}
              className="btn btn-primary btn-lg"
              style={{ opacity: (!isMyTurn || ended) ? 0.5 : 1, flexShrink: 0 }}
            >
              {isMyTurn ? 'Encerrar turno' : 'Aguardando...'}
            </button>
          </PlayerBar>
        </div>
      </div>

      {/* hand drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: '14px 32px 18px',
        background: 'rgba(15,12,10,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '2px solid var(--gold)',
        transform: handOpen ? 'translateY(0)' : 'translateY(calc(100% - 36px))',
        transition: 'transform var(--dur-base) var(--ease-out)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="eyebrow" style={{ color: me.cardPlayBlocked ? 'var(--crimson)' : 'var(--gold)' }}>
            {me.cardPlayBlocked ? '⚠ PEPÃO BIG HEAD — NÃO PODE JOGAR CARTAS' : `► SUA MÃO · ${me.hand.length} CARTAS`}
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>DECK {me.deckCount}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, minHeight: 132 }}>
          {me.hand.map((cardId, i) => {
            const data = cardById(cardId) || {}
            const playable = isMyTurn && !ended && !me.cardPlayBlocked && me.elixir >= (data.cost ?? 99) && me.board.length < boardCap
            return (
              <HandCard key={i} cardId={cardId} playable={playable} onPlay={() => playCard(i)}
                onHover={onCardHover} onLeave={onCardLeave} />
            )
          })}
        </div>
      </div>

      {/* log flutuante */}
      <GameLog log={log} />

      {aiming && (
        <div style={{ position: 'absolute', bottom: 92, left: '50%', transform: 'translateX(-50%)', background: 'var(--crimson)', color: '#fff', padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crosshair size={14} /> Escolha uma carta inimiga para atacar
        </div>
      )}

      {specialAim && (
        <div style={{ position: 'absolute', bottom: 92, left: '50%', transform: 'translateX(-50%)', background: 'var(--purple)', color: '#fff', padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} /> Escolha {aimingEnemy ? 'uma carta inimiga' : 'uma carta aliada'} (Esc cancela)
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)', background: 'var(--crimson)', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 20 }}>
          {error}
        </div>
      )}

      {ended && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,9,8,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, zIndex: 30 }}>
          <div className="eyebrow" style={{ color: iWon ? 'var(--emerald)' : 'var(--crimson)' }}>► FIM DE PARTIDA</div>
          <h1 className="display" style={{ fontSize: 80, lineHeight: 0.9, color: iWon ? 'var(--emerald)' : 'var(--crimson)' }}>
            {iWon ? 'VITÓRIA' : 'DERROTA'}
          </h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={exit} className="btn btn-ghost btn-lg">← Home</button>
            <button onClick={goToEnd} className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 28px' }}>
              Ver resultado →
            </button>
          </div>
        </div>
      )}

      {/* hover preview */}
      {hover && <HoverCard data={hover.data} live={hover.live} anchor={hover.anchor} />}

      {/* números voadores de dano */}
      {hits.map(h => (
        <div key={h.id} style={{
          position: 'fixed', left: h.x, top: h.y,
          transform: 'translate(-50%, 0)',
          fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800,
          color: h.color, textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(255,61,90,0.7)',
          animation: 'floatUp 0.95s ease-out forwards',
          pointerEvents: 'none', zIndex: 80,
        }}>
          {h.text}
        </div>
      ))}
    </div>

    {/* blur/dim quando minigame ativo */}
    {minigame && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 190,
        backdropFilter: 'blur(8px)',
        background: 'rgba(0,0,0,0.6)',
        pointerEvents: 'none',
      }} />
    )}

    {/* tela de confirmação "Pronto!" */}
    {minigame?.phase === 'confirm' && (
      <MinigameConfirm
        data={minigame}
        socket={socket}
        roomId={match.roomId}
      />
    )}

    {/* minigame em si */}
    {minigame?.phase === 'active' && (
      <MinigameOverlay
        data={minigame}
        socket={socket}
        roomId={match.roomId}
        myId={user.id}
        me={state?.me}
        opponent={state?.opponent}
        onClose={() => setMinigame(null)}
      />
    )}
    </>
  )
}
