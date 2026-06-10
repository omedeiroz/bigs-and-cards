// ============================================================
// Leaderboard — placar global ranqueado (Big Fanfas)
// Drop-in: app/src/pages/Leaderboard.jsx
//
// Fonte: GET /api/users/leaderboard  (já existe no server)
//   => [{ id, username, rankPoints, wins, losses, position, rank }]
//   `rank` é o objeto getRank() de server/src/rank.js.
// Só lista quem tem rankedUnlocked = true, top 50, ordenado por pts.
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import RankBadge, { TIER_COLORS } from '../components/RankBadge'

const GRID = '48px 1fr 150px 120px 90px'
const winRate = (w, l) => (w + l) > 0 ? Math.round((w / (w + l)) * 100) : 0

function PodiumCard({ p, place }) {
  const c = TIER_COLORS[p.rank.tier] || TIER_COLORS['Dev do Itaú']
  const medal = place === 1 ? 'var(--gold)' : place === 2 ? '#C8CBD0' : '#CD7F4A'
  const h = place === 1 ? 220 : place === 2 ? 184 : 168
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
      <div style={{ position: 'relative', width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)', fontSize: 22, marginBottom: 10, boxShadow: `0 0 0 3px var(--bg), 0 0 0 5px ${medal}` }}>
        {p.username[0].toUpperCase()}
        {place === 1 && <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)' }}><Crown size={22} style={{ color: 'var(--gold)' }} /></div>}
      </div>
      <div className="display" style={{ fontSize: 20, lineHeight: 1 }}>@{p.username}</div>
      <div style={{ marginTop: 6 }}><RankBadge rank={p.rank} size="sm" /></div>
      <div className="display" style={{ fontSize: 34, color: c.text, marginTop: 8, lineHeight: 1 }}>{p.rankPoints}</div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-4)', marginBottom: 12 }}>
        {p.wins}V · {p.losses}D · {winRate(p.wins, p.losses)}%
      </div>
      <div style={{ width: '100%', height: h, background: place === 1 ? 'linear-gradient(180deg, var(--gold-soft), var(--surface))' : 'var(--surface-2)', border: `1px solid ${place === 1 ? 'var(--line-gold)' : 'var(--line-2)'}`, borderTopLeftRadius: 10, borderTopRightRadius: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 14 }}>
        <span className="display" style={{ fontSize: 64, color: medal, opacity: 0.9, lineHeight: 1 }}>{place}</span>
      </div>
    </div>
  )
}

function Row({ p, isMe }) {
  const c = TIER_COLORS[p.rank.tier] || TIER_COLORS['Dev do Itaú']
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', gap: 12,
      padding: '11px 16px', borderRadius: 10,
      background: isMe ? 'var(--gold-soft)' : 'transparent',
      border: isMe ? '1px solid var(--line-gold)' : '1px solid transparent',
      borderBottom: isMe ? '1px solid var(--line-gold)' : '1px solid var(--line-1)',
    }}>
      <span className="display" style={{ fontSize: 22, color: 'var(--ink-3)', textAlign: 'center' }}>{p.position}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)', fontSize: 14, flexShrink: 0 }}>
          {p.username[0].toUpperCase()}
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          @{p.username}{isMe && <span className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--gold)', marginLeft: 8 }}>VOCÊ</span>}
        </span>
      </div>
      <div><RankBadge rank={p.rank} size="sm" /></div>
      <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
        <span style={{ color: 'var(--emerald)' }}>{p.wins}V</span> · <span style={{ color: 'var(--crimson)' }}>{p.losses}D</span> · {winRate(p.wins, p.losses)}%
      </span>
      <span className="display" style={{ fontSize: 22, color: c.text, textAlign: 'right' }}>{p.rankPoints}</span>
    </div>
  )
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [players, setPlayers] = useState(null)  // null = loading
  const [error, setError] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('bigs-token')
    fetch('/api/users/leaderboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { Array.isArray(data) ? setPlayers(data) : setError(true) })
      .catch(() => setError(true))
  }, [])

  const top3 = (players || []).slice(0, 3)
  const rest = (players || []).slice(3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)  // 2 · 1 · 3
  const placeById = new Map([[top3[0]?.id, 1], [top3[1]?.id, 2], [top3[2]?.id, 3]])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>► RANQUEADA GLOBAL</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 8, lineHeight: 1 }}>PLACAR <span style={{ color: 'var(--gold)' }}>BIG FANFAS</span></h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6 }}>Todos os jogadores do servidor, ordenados por pontos. Vitórias e derrotas contam só ranqueada.</p>
          </div>
        </header>

        {error ? (
          <div className="panel" style={{ padding: '64px 0', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--crimson)' }}>ERRO AO CARREGAR O PLACAR</div>
            <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 8 }}>Tenta de novo daqui a pouco.</p>
          </div>
        ) : players === null ? (
          <div className="panel" style={{ padding: '64px 0', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>CARREGANDO...</div>
          </div>
        ) : players.length === 0 ? (
          <div className="panel" style={{ padding: '64px 0', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NINGUÉM NO PLACAR AINDA</div>
            <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 8 }}>Jogue partidas ranqueadas pra entrar no ranking.</p>
            <button onClick={() => navigate('/home')} className="btn btn-primary" style={{ marginTop: 20 }}>Jogar ranqueada →</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'end', maxWidth: 720, margin: '0 auto 32px' }}>
              {podiumOrder.map(p => <PodiumCard key={p.id} p={p} place={placeById.get(p.id)} />)}
            </div>

            {rest.length > 0 && (
              <div className="panel" style={{ padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '0 16px 10px', borderBottom: '1px solid var(--line-2)' }}>
                  {['#', 'JOGADOR', 'RANK', 'V · D · %', 'PTS'].map((h, i) => (
                    <span key={h} className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-4)', textAlign: i === 0 ? 'center' : i === 4 ? 'right' : 'left' }}>{h}</span>
                  ))}
                </div>
                <div style={{ marginTop: 4 }}>
                  {rest.map(p => <Row key={p.id} p={p} isMe={p.id === user?.id} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
