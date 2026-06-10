// ============================================================
// Tutorial — partida guiada offline contra um "bot" scriptado.
// Ensina: jogar carta, auras (duo/counter), ataque, lógica de
// dano, especiais e minigames. Tudo local, sem socket.
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sword, Shield, Heart, ArrowRight, GraduationCap, Check } from 'lucide-react'
import { cardById } from '../data/cards'

let _uid = 1
function mk(cardId, over = {}) {
  const d = cardById(cardId) || {}
  return { uid: _uid++, cardId, atk: d.atk, def: d.def, hp: d.hp, maxHp: d.hp, canAttack: false, ...over }
}

function StatChip({ icon: Icon, value, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color, fontWeight: 700, fontSize: 12, textShadow: '0 1px 2px rgba(0,0,0,0.75)' }}>
      <Icon size={11} /> {value}
    </span>
  )
}

function Card({ m, accent, glow, dim, badge, onClick, clickable }) {
  const data = cardById(m.cardId) || {}
  return (
    <div onClick={clickable ? onClick : undefined} style={{
      width: 96, height: 122, borderRadius: 10, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: 'var(--surface-2)', border: `2px solid ${accent || data.accent || 'var(--line-3)'}`,
      boxShadow: glow || 'none', cursor: clickable ? 'pointer' : 'default',
      opacity: dim ? 0.5 : 1, transition: 'box-shadow var(--dur-fast), opacity var(--dur-fast)',
    }}>
      {badge && (
        <div className="mono" style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', zIndex: 8, background: badge.c, color: 'var(--bg)', fontSize: 7, fontWeight: 800, letterSpacing: '0.12em', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', boxShadow: `0 0 10px ${badge.c}` }}>{badge.t}</div>
      )}
      <div className="display" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: data.accent || 'var(--ink-3)', opacity: 0.4 }}>{(data.name || '?')[0].toUpperCase()}</div>
      <img src={`/cards/${m.cardId}.png`} alt={data.name} onError={e => { e.currentTarget.style.display = 'none' }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 52%, rgba(0,0,0,0.88) 100%)' }} />
      <div className="mono" style={{ position: 'absolute', top: 4, left: 0, right: 0, fontSize: 8, letterSpacing: '0.06em', color: '#fff', textAlign: 'center', fontWeight: 700, textShadow: '0 1px 3px #000', zIndex: 6 }}>{(data.name || m.cardId).toUpperCase()}</div>
      <div style={{ position: 'absolute', bottom: 5, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', zIndex: 6 }}>
        <StatChip icon={Sword} value={m.atk} color="#ff6b80" />
        <StatChip icon={Shield} value={m.def} color="#7ff0c8" />
        <StatChip icon={Heart} value={m.hp} color="#9cc4ff" />
      </div>
    </div>
  )
}

function Face({ name, hp, accent, isOpp }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, background: isOpp ? 'rgba(255,61,90,0.06)' : 'var(--gold-soft)', border: `1px solid ${isOpp ? 'var(--crimson-soft)' : 'var(--line-gold)'}` }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)', fontSize: 18 }}>{name[0].toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <div className="display" style={{ fontSize: 20, lineHeight: 1 }}>{name}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: accent, marginTop: 3 }}>{isOpp ? '● BOT' : '● VOCÊ'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--sapphire)' }}>
        <Heart size={16} /> <span className="display" style={{ fontSize: 26 }}>{hp}</span>
        <span className="mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>/20</span>
      </div>
    </div>
  )
}

const STEPS = [
  { k: 'intro',     title: 'BEM-VINDO AO TUTORIAL', body: 'Vou te ensinar o básico numa partida rápida contra um bot. O objetivo é zerar o HP do oponente — via minigames, dano direto e atrito de cartas. Bora?' },
  { k: 'relations', title: 'DUOS E COUNTERS', body: 'Cada carta tem combos (duos) e rivalidades (counters). Na partida real, passe o mouse numa carta sua pra ver as auras: 🟡 amarelo = duo no seu lado, 🟢 verde = você countera, 🔴 vermelho = te counteram.' },
  { k: 'play',      title: 'JOGUE UMA CARTA',  body: 'Cartas custam elixir pra entrar no tabuleiro. Clique no GBZIN na sua mão pra jogá-lo (custa 2).', action: 'play', card: 'gbzin' },
  { k: 'attack',    title: 'ATAQUE',           body: 'Clique no seu GBZIN pra selecionar, depois clique na carta inimiga (PIRULA) pra atacar.', action: 'attack' },
  { k: 'damage',    title: 'LÓGICA DE DANO',   body: 'O dano é simultâneo: cada carta tira (ATK − DEF) da outra. Gbzin (3 ATK) bateu na Pirula (1 DEF) = 2 de dano. A Pirula (4 ATK) revidou no Gbzin (2 DEF) = 2 de dano. DEF reduz, mas não some o dano que passa.' },
  { k: 'special',   title: 'ESPECIAIS',        body: 'Cada carta tem um especial que custa elixir e tem efeito único. Eles recarregam a cada 2 turnos (o Pirula é 1x por partida). Use no momento certo pra virar o jogo.' },
  { k: 'minigame',  title: 'MINIGAMES',        body: 'Algumas ações disparam minigames (reação, par ou ímpar, pedra-papel-tesoura...). Quem vence dá dano verdadeiro (ignora defesa) e ganha elixir; no empate, cada um leva 1 de elixir.' },
  { k: 'done',      title: 'PRONTO!',          body: 'É isso! Você já sabe o essencial. Agora é praticar numa partida de verdade.' },
]

export default function Tutorial() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [hand, setHand] = useState(['gbzin', 'davi', 'ian'])
  const [board, setBoard] = useState([])
  const [enemy, setEnemy] = useState(() => [mk('pirula')])
  const [elixir, setElixir] = useState(5)
  const [pHP, setPHP] = useState(20)
  const [eHP, setEHP] = useState(20)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const cur = STEPS[step]
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1))

  function playHand(i) {
    if (cur.action !== 'play') return
    const cardId = hand[i]
    if (cardId !== cur.card) { flash('Pra esse passo, jogue o GBZIN.'); return }
    setHand(h => h.filter((_, j) => j !== i))
    setBoard(b => [...b, mk(cardId, { canAttack: true })])
    setElixir(e => e - 2)
    next()
  }

  function clickMine(uid) {
    if (cur.action !== 'attack') return
    setSelected(s => (s === uid ? null : uid))
  }

  function attackEnemy(uid) {
    if (cur.action !== 'attack' || selected == null) return
    const atk = board.find(m => m.uid === selected)
    const def = enemy.find(m => m.uid === uid)
    if (!atk || !def) return
    const dmgToDef = Math.max(0, atk.atk - def.def)
    const dmgToAtk = Math.max(0, def.atk - atk.def)
    setEnemy(es => es.map(m => m.uid === uid ? { ...m, hp: m.hp - dmgToDef } : m).filter(m => m.hp > 0))
    setBoard(bs => bs.map(m => m.uid === selected ? { ...m, hp: m.hp - dmgToAtk, canAttack: false } : m).filter(m => m.hp > 0))
    setSelected(null)
    flash(`Gbzin deu ${dmgToDef} · levou ${dmgToAtk} de volta`)
    next()
  }

  function flash(msg) { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const aiming = cur.action === 'attack'
  // destaca o alvo do passo atual
  const enemyGlow = (cur.k === 'attack') ? '0 0 14px rgba(255,61,90,0.7)' : undefined
  const enemyAccent = (cur.k === 'attack') ? 'var(--crimson)' : undefined

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0d05 0%, #0a0908 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,9,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line-1)' }}>
        <button onClick={() => navigate('/home')} className="btn btn-ghost btn-sm">← Sair do tutorial</button>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <GraduationCap size={14} /> TUTORIAL · PASSO {step + 1}/{STEPS.length}
        </div>
        <div style={{ width: 120 }} />
      </div>

      {/* arena */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px 280px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Face name="Bot" hp={eHP} accent="var(--crimson)" isOpp />
        <div className="eyebrow" style={{ color: 'var(--crimson)', textAlign: 'center' }}>► TABULEIRO DO BOT</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, minHeight: 122 }}>
          {enemy.length === 0
            ? <div className="mono" style={{ color: 'var(--ink-4)', fontSize: 10, alignSelf: 'center' }}>SEM CARTAS</div>
            : enemy.map(m => (
              <Card key={m.uid} m={m} accent={enemyAccent} glow={enemyGlow}
                clickable={aiming && selected != null}
                onClick={() => attackEnemy(m.uid)}
                badge={cur.k === 'attack' ? { t: 'ALVO', c: 'var(--crimson)' } : null} />
            ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
          <div className="display" style={{ fontSize: 18, color: 'var(--gold)' }}>VS</div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        </div>

        <div className="eyebrow" style={{ color: 'var(--gold)', textAlign: 'center' }}>► SEU TABULEIRO</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, minHeight: 122 }}>
          {board.length === 0
            ? <div className="mono" style={{ color: 'var(--ink-4)', fontSize: 10, alignSelf: 'center' }}>JOGUE UMA CARTA DA SUA MÃO</div>
            : board.map(m => (
              <Card key={m.uid} m={m}
                accent={selected === m.uid ? 'var(--gold)' : undefined}
                glow={selected === m.uid ? '0 0 0 2px var(--bg), 0 0 12px var(--gold)' : (aiming && m.canAttack ? '0 0 8px rgba(255,201,60,0.5)' : undefined)}
                clickable={aiming && m.canAttack}
                onClick={() => clickMine(m.uid)} />
            ))}
        </div>
        <Face name="Você" hp={pHP} accent="var(--gold)" />
      </div>

      {/* mão */}
      <div style={{ position: 'fixed', bottom: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, zIndex: 20 }}>
        {hand.map((cardId, i) => {
          const isTarget = cur.action === 'play' && cardId === cur.card
          return (
            <div key={i} onClick={() => playHand(i)} style={{ cursor: cur.action === 'play' ? 'pointer' : 'default' }}>
              <Card m={mk(cardId)} clickable={cur.action === 'play'} onClick={() => playHand(i)}
                accent={isTarget ? 'var(--gold)' : undefined}
                glow={isTarget ? '0 0 16px var(--gold-glow)' : undefined}
                dim={cur.action === 'play' && !isTarget}
                badge={isTarget ? { t: 'JOGUE', c: 'var(--gold)' } : null} />
            </div>
          )
        })}
      </div>

      {/* elixir */}
      <div style={{ position: 'fixed', bottom: 150, right: 24, zIndex: 21 }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--purple)', textAlign: 'right' }}>ELIXIR</div>
        <div className="display" style={{ fontSize: 28, color: 'var(--purple)', lineHeight: 1 }}>{elixir}<span style={{ fontSize: 14, color: 'var(--ink-4)' }}>/10</span></div>
      </div>

      {/* painel de instrução */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '18px 24px 22px', background: 'rgba(15,12,10,0.96)', backdropFilter: 'blur(20px)', borderTop: '2px solid var(--gold)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>► {cur.title}</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>{cur.body}</p>
            {cur.k === 'relations' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="pill pill-gold">🟡 DUO</span>
                <span className="pill pill-emerald">🟢 VANTAGEM</span>
                <span className="pill pill-crimson">🔴 PERIGO</span>
              </div>
            )}
          </div>
          {cur.action ? (
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
              ◆ FAÇA A AÇÃO ACIMA
            </div>
          ) : cur.k === 'done' ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/roster')} className="btn btn-ghost btn-lg">Ver cartas</button>
              <button onClick={() => navigate('/home')} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Jogar de verdade <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <button onClick={next} className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              {step === 0 ? 'Começar' : 'Próximo'} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--ink-on-gold)', padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
