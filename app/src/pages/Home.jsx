import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Swords, Trophy, Lock, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Sidebar from '../components/Sidebar'

function RankBadge({ rank, size = 'md' }) {
  if (!rank) return null
  const colors = {
    'Dev do Itaú':     { bg: '#1a2a1a', border: '#3a5a3a', text: '#6a9a6a' },
    'Arame Farpado':   { bg: '#2a1a1a', border: '#6a3a3a', text: '#cc7777' },
    'Buzz do Outback': { bg: '#2a2a1a', border: '#7a6a2a', text: '#ccaa44' },
    'Consultor HCM':   { bg: '#1a1a2a', border: '#3a4a7a', text: '#6688cc' },
    'New Hadez':       { bg: '#2a1a2a', border: '#6a3a8a', text: '#bb77ee' },
    'Big Fanfas':      { bg: '#2a2000', border: '#cc9900', text: '#ffc93c' },
  }
  const c = colors[rank.tier] || colors['Dev do Itaú']
  const isSm = size === 'sm'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: isSm ? 4 : 6,
      padding: isSm ? '3px 8px' : '5px 12px',
      borderRadius: 6, border: `1px solid ${c.border}`,
      background: c.bg,
    }}>
      <Trophy size={isSm ? 10 : 13} style={{ color: c.text, flexShrink: 0 }} />
      <span className="mono" style={{ fontSize: isSm ? 9 : 11, letterSpacing: '0.12em', color: c.text }}>
        {rank.label}
      </span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { onlineIds, joinQueue, rankedJustUnlocked, clearRankedUnlocked } = useSocket()
  const [friends, setFriends] = useState([])
  const [stats, setStats] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('bigs-token')
    if (!token) return
    fetch('/api/friends', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setFriends(data) }).catch(() => {})
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/users/matches', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setRecentMatches(data.slice(0, 5)) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (rankedJustUnlocked) {
      const token = localStorage.getItem('bigs-token')
      fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setStats).catch(() => {})
      clearRankedUnlocked()
    }
  }, [rankedJustUnlocked])

  function playCasual() {
    joinQueue('casual')
    navigate('/lobby')
  }

  function playRanked() {
    if (!stats?.rankedUnlocked) return
    joinQueue('ranked')
    navigate('/lobby')
  }

  const sortedFriends = [...friends].sort((a, b) =>
    (onlineIds.includes(b.id) ? 1 : 0) - (onlineIds.includes(a.id) ? 1 : 0)
  )

  const winRate = stats && stats.matchesPlayed > 0
    ? Math.round((stats.wins / stats.matchesPlayed) * 100)
    : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div className="eyebrow">BEM-VINDO DE VOLTA</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 8, lineHeight: 1 }}>E aí, <span style={{ color: 'var(--gold)' }}>{user?.username}</span></h1>
            {stats?.rankedUnlocked && stats.rank && (
              <div style={{ marginTop: 8 }}>
                <RankBadge rank={stats.rank} />
                {stats.rank.tier !== 'Big Fanfas' && (
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 8, letterSpacing: '0.1em' }}>
                    {stats.rankPoints} pts
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/challenges')} className="btn btn-ghost">
              <Bell size={14} /> Desafios
            </button>
            <button onClick={playCasual} className="btn btn-primary btn-lg">
              <Swords size={16} /> Jogar agora
            </button>
            <button onClick={logout} className="btn btn-ghost" title="Sair da conta">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { l: 'VITÓRIAS',  v: stats?.wins    ?? '—', color: 'var(--emerald)' },
                { l: 'DERROTAS',  v: stats?.losses  ?? '—', color: 'var(--crimson)' },
                { l: 'WIN %',     v: winRate != null ? `${winRate}%` : '—', color: 'var(--gold)' },
                { l: 'PARTIDAS',  v: stats?.matchesPlayed ?? '—', color: 'var(--sapphire)' },
              ].map(s => (
                <div key={s.l} className="panel-2" style={{ padding: 16 }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>{s.l}</div>
                  <div className="display" style={{ fontSize: 28, color: s.color, marginTop: 8, lineHeight: 1 }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* ranked card */}
            <div className="panel" style={{
              padding: 28,
              background: stats?.rankedUnlocked
                ? 'linear-gradient(135deg, rgba(255,201,60,0.08) 0%, var(--surface) 60%)'
                : 'var(--surface)',
              position: 'relative', overflow: 'hidden',
            }}>
              {stats?.rankedUnlocked && (
                <div style={{ position: 'absolute', right: -40, top: -40, opacity: 0.06 }}>
                  <div className="display" style={{ fontSize: 200, color: 'var(--gold)' }}>★</div>
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <div className="eyebrow" style={{ color: stats?.rankedUnlocked ? 'var(--gold)' : 'var(--ink-4)' }}>
                  ► RANQUEADA
                </div>
                {stats?.rankedUnlocked ? (
                  <>
                    <h2 className="display" style={{ fontSize: 40, marginTop: 8, lineHeight: 1 }}>QUER A LAVADA?</h2>
                    {stats.rank && (
                      <div style={{ marginTop: 10 }}>
                        <RankBadge rank={stats.rank} />
                        {stats.rank.tier !== 'Big Fanfas' && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-4)' }}>
                                {stats.rank.ptsInDiv}/100 pts na divisão
                              </span>
                              <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-4)' }}>
                                {stats.rank.division === 'I' ? 'próx: subida de tier' : `próx: ${stats.rank.tier} ${['IV','III','II','I'][['IV','III','II','I'].indexOf(stats.rank.division) + 1]}`}
                              </span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-3)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${stats.rank.ptsInDiv}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                      <button onClick={playRanked} className="btn btn-primary btn-lg">
                        <Trophy size={15} /> Jogar ranqueada
                      </button>
                      <button onClick={playCasual} className="btn btn-ghost">Casual</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="display" style={{ fontSize: 40, marginTop: 8, lineHeight: 1, color: 'var(--ink-3)' }}>BLOQUEADO</h2>
                    <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 8 }}>
                      Jogue {2 - (stats?.matchesPlayed ?? 0)} partida{(2 - (stats?.matchesPlayed ?? 0)) !== 1 ? 's' : ''} casual{(2 - (stats?.matchesPlayed ?? 0)) !== 1 ? 'is' : ''} para desbloquear o ranked.
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                      {[0, 1].map(i => (
                        <div key={i} style={{
                          width: 12, height: 12, borderRadius: '50%',
                          background: (stats?.matchesPlayed ?? 0) > i ? 'var(--gold)' : 'var(--surface-3)',
                          border: '1px solid var(--line-2)',
                        }} />
                      ))}
                      <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-4)', marginLeft: 4 }}>
                        {stats?.matchesPlayed ?? 0}/2 partidas
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button onClick={playCasual} className="btn btn-primary btn-lg">
                        <Swords size={15} /> Jogar casual
                      </button>
                      <button disabled className="btn btn-ghost" style={{ opacity: 0.4, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Lock size={13} /> Ranqueada
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* recent matches */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 22 }}>ÚLTIMAS PARTIDAS</h3>
                {recentMatches.length > 0 && <button onClick={() => navigate('/profile')} className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>VER TUDO →</button>}
              </div>
              {recentMatches.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUMA PARTIDA AINDA</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {recentMatches.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line-1)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.draw ? 'var(--surface-3)' : m.won ? 'rgba(138,226,52,0.15)' : 'rgba(255,61,90,0.15)', flexShrink: 0 }}>
                        <span className="display" style={{ fontSize: 14, color: m.draw ? 'var(--ink-4)' : m.won ? 'var(--emerald)' : 'var(--crimson)' }}>{m.draw ? '=' : m.won ? 'V' : 'D'}</span>
                      </div>
                      <span style={{ flex: 1, fontSize: 13 }}>vs @{m.opponent?.username}</span>
                      <span className="mono" style={{ fontSize: 8, letterSpacing: '0.12em', color: m.matchType === 'ranked' ? 'var(--gold)' : 'var(--ink-4)' }}>{m.matchType === 'ranked' ? '★' : '◇'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* friends */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 22 }}>NA ÁREA</h3>
                <button onClick={() => navigate('/friends')} className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>VER AMIGOS →</button>
              </div>
              {friends.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUM AMIGO AINDA</div>
                  <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 8 }}>Adicione amigos pra ver quem tá na área.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sortedFriends.map(f => {
                    const online = onlineIds.includes(f.id)
                    return (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: online ? 1 : 0.55 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold) 0%, var(--crimson) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)', fontSize: 14 }}>
                            {f.username[0].toUpperCase()}
                          </div>
                          <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: online ? 'var(--emerald)' : 'var(--ink-4)', border: '2px solid var(--surface)' }} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>@{f.username}</span>
                        {online && <span className="mono" style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--emerald)' }}>ONLINE</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* roster shortcut */}
            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ color: 'var(--purple)' }}>► AS CARTAS</div>
              <h3 className="display" style={{ fontSize: 22, marginTop: 6 }}>CONHECE O ROSTER?</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, marginBottom: 16 }}>
                10 cartas no jogo. Cada uma é alguém da galera.
              </p>
              <button onClick={() => navigate('/roster')} className="btn btn-ghost btn-block">
                Ver todas as cartas →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
