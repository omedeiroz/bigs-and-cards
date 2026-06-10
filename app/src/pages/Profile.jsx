import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trophy, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Sidebar from '../components/Sidebar'
import { CARDS } from '../data/cards'

const RANK_COLORS = {
  'Dev do Itaú':     { bg: '#1a2a1a', border: '#3a5a3a', text: '#6a9a6a', glow: 'rgba(106,154,106,0.15)' },
  'Arame Farpado':   { bg: '#2a1a1a', border: '#6a3a3a', text: '#cc7777', glow: 'rgba(204,119,119,0.15)' },
  'Buzz do Outback': { bg: '#2a2a1a', border: '#7a6a2a', text: '#ccaa44', glow: 'rgba(204,170,68,0.15)'  },
  'Consultor HCM':   { bg: '#1a1a2a', border: '#3a4a7a', text: '#6688cc', glow: 'rgba(102,136,204,0.15)' },
  'New Hadez':       { bg: '#2a1a2a', border: '#6a3a8a', text: '#bb77ee', glow: 'rgba(187,119,238,0.15)' },
  'Big Fanfas':      { bg: '#2a2000', border: '#cc9900', text: '#ffc93c', glow: 'rgba(255,201,60,0.2)'   },
}

const RARITY_COLORS = { comum: 'var(--ink-3)', raro: 'var(--sapphire)', épico: 'var(--purple)', lendário: 'var(--gold)' }

export default function Profile() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const { rankUpdate, clearRankUpdate } = useSocket()
  const [stats, setStats] = useState(null)
  const [matches, setMatches] = useState([])
  const [pickingCard, setPickingCard] = useState(false)
  const [savingCard, setSavingCard] = useState(false)
  const [editingNick, setEditingNick] = useState(false)
  const [nickValue, setNickValue] = useState('')
  const [nickError, setNickError] = useState('')
  const [savingNick, setSavingNick] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('bigs-token')
    if (!token) return
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/users/matches', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setMatches(data) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!rankUpdate) return
    setStats(prev => prev ? { ...prev, rankPoints: rankUpdate.newPts, rank: rankUpdate.rank } : prev)
    clearRankUpdate()
  }, [rankUpdate])

  async function setMainCard(cardId) {
    setSavingCard(true)
    const token = localStorage.getItem('bigs-token')
    try {
      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainCardId: cardId }),
      })
      setStats(prev => prev ? { ...prev, mainCardId: cardId } : prev)
      setPickingCard(false)
    } catch {}
    setSavingCard(false)
  }

  function handleLogout() { logout(); navigate('/login') }

  async function saveNick() {
    const name = nickValue.trim()
    if (name === user?.username) { setEditingNick(false); return }
    setSavingNick(true); setNickError('')
    const token = localStorage.getItem('bigs-token')
    try {
      const res = await fetch('/api/users/me/username', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
      })
      const data = await res.json()
      if (!res.ok) { setNickError(data.error || 'Erro ao trocar o nick'); setSavingNick(false); return }
      login(data.user, data.token)  // atualiza usuário + token (username vive no JWT)
      setStats(prev => prev ? { ...prev, username: data.user.username } : prev)
      setEditingNick(false)
    } catch {
      setNickError('Erro de conexão')
    }
    setSavingNick(false)
  }

  const rank = stats?.rank
  const rc = rank ? (RANK_COLORS[rank.tier] || RANK_COLORS['Dev do Itaú']) : null
  const winRate = stats && stats.matchesPlayed > 0 ? Math.round((stats.wins / stats.matchesPlayed) * 100) : null
  const mainCard = CARDS.find(c => c.id === stats?.mainCardId)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        {/* hero */}
        <div className="panel" style={{ padding: 32, background: 'linear-gradient(135deg, var(--gold-soft) 0%, var(--surface) 60%)', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.1 }}>
            <div className="display" style={{ fontSize: 220, color: 'var(--gold)' }}>{user?.username?.[0]?.toUpperCase()}</div>
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 42, color: 'var(--ink-on-gold)', boxShadow: '0 16px 40px var(--gold-glow)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="eyebrow" style={{ color: 'var(--gold)' }}>► PERFIL</div>
              {editingNick ? (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      className="input"
                      value={nickValue}
                      autoFocus
                      maxLength={20}
                      onChange={e => setNickValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveNick(); if (e.key === 'Escape') { setEditingNick(false); setNickError('') } }}
                      style={{ fontSize: 22, maxWidth: 280 }}
                    />
                    <button onClick={saveNick} disabled={savingNick} className="btn btn-primary btn-sm">
                      <Check size={12} /> Salvar
                    </button>
                    <button onClick={() => { setEditingNick(false); setNickError('') }} className="btn btn-ghost btn-sm">Cancelar</button>
                  </div>
                  {nickError && <div className="mono" style={{ fontSize: 10, color: 'var(--crimson)', marginTop: 6, letterSpacing: '0.1em' }}>{nickError}</div>}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <h1 className="display" style={{ fontSize: 64, lineHeight: 0.95 }}>{user?.username}</h1>
                  <button onClick={() => { setNickValue(user?.username || ''); setNickError(''); setEditingNick(true) }} className="btn btn-ghost btn-sm" title="Trocar nick">
                    <Pencil size={12} /> Nick
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{user?.email}</span>
                {stats?.rankedUnlocked && rank && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: `1px solid ${rc.border}`, background: rc.bg }}>
                    <Trophy size={11} style={{ color: rc.text }} />
                    <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: rc.text }}>{rank.label}</span>
                    {rank.tier !== 'Big Fanfas' && <span className="mono" style={{ fontSize: 9, color: rc.text, opacity: 0.7 }}>• {stats.rankPoints} pts</span>}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--crimson)', borderColor: 'var(--crimson-soft)' }}>Sair</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* rank card */}
          {stats?.rankedUnlocked && rank ? (
            <div className="panel" style={{ padding: 24, border: `1px solid ${rc.border}`, background: `linear-gradient(135deg, ${rc.bg} 0%, var(--surface) 60%)`, boxShadow: `0 0 40px ${rc.glow}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
                <div>
                  <div className="eyebrow" style={{ color: rc.text }}>► RANKING ATUAL</div>
                  <div className="display" style={{ fontSize: 40, lineHeight: 1, marginTop: 6, color: rc.text }}>{rank.label}</div>
                  {rank.tier !== 'Big Fanfas' ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{rank.ptsInDiv}/100 pts</span>
                        <span className="mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>Total: {stats.rankPoints}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${rank.ptsInDiv}%`, background: rc.text, borderRadius: 3, transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="mono" style={{ fontSize: 11, color: rc.text, marginTop: 8 }}>{stats.rankPoints} pts totais</div>
                  )}
                </div>
                <Trophy size={60} style={{ color: rc.text, opacity: 0.2 }} />
              </div>
            </div>
          ) : (
            <div className="panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="eyebrow" style={{ color: 'var(--ink-4)' }}>► RANKED BLOQUEADO</div>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Jogue mais {2 - (stats?.matchesPlayed ?? 0)} partida(s) para desbloquear.</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0,1].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: (stats?.matchesPlayed ?? 0) > i ? 'var(--gold)' : 'var(--surface-3)', border: '1px solid var(--line-2)' }} />)}
              </div>
            </div>
          )}

          {/* main card */}
          <div className="panel" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ color: 'var(--purple)' }}>► CARTA PRINCIPAL</div>
            {!pickingCard ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                {mainCard ? (
                  <>
                    <div style={{ width: 52, height: 68, borderRadius: 8, border: `2px solid ${mainCard.accent}`, background: 'var(--surface-2)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      <img src={`/cards/${mainCard.id}.png`} alt={mainCard.name} onError={e => { e.currentTarget.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div className="display" style={{ fontSize: 22, lineHeight: 1, color: mainCard.accent }}>{mainCard.name}</div>
                      <div className="mono" style={{ fontSize: 9, color: RARITY_COLORS[mainCard.rarity] || 'var(--ink-4)', letterSpacing: '0.14em', marginTop: 4 }}>{mainCard.rarity?.toUpperCase()}</div>
                    </div>
                    <button onClick={() => setPickingCard(true)} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                      <Pencil size={11} /> Trocar
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 4 }}>Nenhuma carta escolhida.</div>
                    </div>
                    <button onClick={() => setPickingCard(true)} className="btn btn-ghost btn-sm">Escolher</button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {CARDS.map(c => (
                    <button key={c.id} onClick={() => setMainCard(c.id)} disabled={savingCard} title={c.name} style={{
                      width: 44, height: 56, borderRadius: 6, padding: 0, overflow: 'hidden', cursor: 'pointer',
                      border: `2px solid ${stats?.mainCardId === c.id ? c.accent : 'var(--line-2)'}`,
                      background: 'var(--surface-2)', position: 'relative', flexShrink: 0,
                      boxShadow: stats?.mainCardId === c.id ? `0 0 12px ${c.accent}88` : 'none',
                    }}>
                      <img src={`/cards/${c.id}.png`} alt={c.name} onError={e => { e.currentTarget.style.display='none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {stats?.mainCardId === c.id && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}><Check size={18} color="#fff" /></div>}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPickingCard(false)} className="btn btn-ghost btn-sm">Cancelar</button>
              </div>
            )}
          </div>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'PARTIDAS', v: stats?.matchesPlayed ?? '—', color: 'var(--ink-1)'  },
            { l: 'VITÓRIAS', v: stats?.wins ?? '—',          color: 'var(--emerald)'},
            { l: 'DERROTAS', v: stats?.losses ?? '—',        color: 'var(--crimson)'},
            { l: 'WIN RATE', v: winRate != null ? `${winRate}%` : '—', color: 'var(--gold)' },
          ].map(s => (
            <div key={s.l} className="panel" style={{ padding: 20 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>{s.l}</div>
              <div className="display" style={{ fontSize: 32, color: s.color, marginTop: 10, lineHeight: 1 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* match history */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <header style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 className="display" style={{ fontSize: 26 }}>HISTÓRICO</h3>
            <span className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>{matches.length} PARTIDAS</span>
          </header>
          {matches.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUMA PARTIDA AINDA</div>
            </div>
          ) : (
            <div>
              {matches.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: '1px solid var(--line-1)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: m.draw ? 'var(--surface-3)' : m.won ? 'rgba(138,226,52,0.12)' : 'rgba(255,61,90,0.12)', border: `1px solid ${m.draw ? 'var(--line-2)' : m.won ? 'rgba(138,226,52,0.4)' : 'rgba(255,61,90,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="display" style={{ fontSize: 18, color: m.draw ? 'var(--ink-4)' : m.won ? 'var(--emerald)' : 'var(--crimson)' }}>{m.draw ? '=' : m.won ? 'V' : 'D'}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>vs @{m.opponent?.username}</div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-4)', marginTop: 3 }}>
                      {m.matchType === 'ranked' ? '★ RANQUEADA' : 'CASUAL'} · RODADA {m.rounds} · {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <span className="pill" style={{ background: m.draw ? 'var(--surface-3)' : m.won ? 'rgba(138,226,52,0.15)' : 'rgba(255,61,90,0.15)', color: m.draw ? 'var(--ink-3)' : m.won ? 'var(--emerald)' : 'var(--crimson)', fontSize: 9, letterSpacing: '0.14em' }}>
                    {m.draw ? 'EMPATE' : m.won ? 'VITÓRIA' : 'DERROTA'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
