import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Check, Swords, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

export default function Lobby() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, match, inQueue, leaveQueue, clearMatch } = useSocket()
  const [ready, setReady] = useState(false)
  const [opponentReady, setOpponentReady] = useState(false)
  const [opponentLeft, setOpponentLeft] = useState(false)

  useEffect(() => {
    if (!socket || !match) return

    socket.emit('lobby:join', match.roomId)

    function onState({ ready: readyIds }) {
      setReady(readyIds.includes(user.id))
      setOpponentReady(readyIds.includes(match.opponent.id))
    }
    function onStart() {
      navigate('/match')
    }
    function onOpponentLeft() {
      setOpponentLeft(true)
      setOpponentReady(false)
    }

    socket.on('lobby:state', onState)
    socket.on('match:start', onStart)
    socket.on('lobby:opponentLeft', onOpponentLeft)

    return () => {
      socket.off('lobby:state', onState)
      socket.off('match:start', onStart)
      socket.off('lobby:opponentLeft', onOpponentLeft)
    }
  }, [socket, match, user, navigate])

  function handleReady() {
    if (!match) return
    setReady(true)
    socket.emit('lobby:ready', match.roomId)
  }

  function handleExit() {
    if (match) clearMatch()
    if (inQueue) leaveQueue()
    navigate('/home')
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 201, 60, 0.08) 0%, var(--bg) 70%)' }} />

      <header style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-1)', background: 'rgba(10,9,8,0.6)', backdropFilter: 'blur(20px)' }}>
        <button onClick={handleExit} className="btn btn-ghost btn-sm">← Sair</button>
        <div className="eyebrow">LOBBY</div>
        <div style={{ width: 80 }} />
      </header>

      {/* SEARCHING */}
      {!match && inQueue && (
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 24 }}>
          <Loader2 size={56} className="spin" style={{ color: 'var(--gold)' }} />
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>► NA FILA</div>
          <h1 className="display" style={{ fontSize: 48, lineHeight: 1, textAlign: 'center' }}>PROCURANDO<br />OPONENTE</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>Pareando com alguém que esteja online...</p>
          <button onClick={handleExit} className="btn btn-ghost btn-lg">Cancelar busca</button>
        </div>
      )}

      {/* NO MATCH, NOT QUEUED */}
      {!match && !inQueue && (
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 20 }}>
          <Users size={48} style={{ color: 'var(--ink-4)' }} />
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUMA PARTIDA ATIVA</div>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', textAlign: 'center', maxWidth: 360 }}>
            Entre na fila pela Home ou desafie um amigo pra começar uma partida.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/home')} className="btn btn-primary btn-lg">Ir pra Home</button>
            <button onClick={() => navigate('/friends')} className="btn btn-ghost btn-lg">Ver amigos</button>
          </div>
        </div>
      )}

      {/* MATCHED */}
      {match && (
        <>
          <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 32 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="eyebrow" style={{ color: 'var(--gold)' }}>► PARTIDA ENCONTRADA</div>
              {match.type && (
                <span className="pill" style={{
                  background: match.type === 'ranked' ? 'rgba(255,201,60,0.15)' : 'var(--surface-3)',
                  color: match.type === 'ranked' ? 'var(--gold)' : 'var(--ink-3)',
                  border: match.type === 'ranked' ? '1px solid rgba(255,201,60,0.4)' : '1px solid var(--line-2)',
                  fontSize: 9, letterSpacing: '0.16em',
                }}>
                  {match.type === 'ranked' ? '★ RANQUEADA' : 'CASUAL'}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
              {/* me */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 40, color: 'var(--ink-on-gold)', margin: '0 auto', boxShadow: '0 0 0 3px var(--bg), 0 0 0 4px var(--gold)' }}>
                  {user?.username?.[0]?.toUpperCase() || 'V'}
                </div>
                <div className="display" style={{ fontSize: 36, marginTop: 12, lineHeight: 1 }}>{user?.username}</div>
                <div className="pill" style={{ marginTop: 8, background: ready ? 'var(--emerald)' : 'var(--surface-3)', color: ready ? '#000' : 'var(--ink-3)' }}>
                  {ready ? 'PRONTO' : 'AGUARDANDO'}
                </div>
              </div>

              <div className="display" style={{ fontSize: 120, color: 'var(--ink-3)', lineHeight: 0.8, letterSpacing: '-0.04em' }}>VS</div>

              {/* opponent */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sapphire), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 40, color: 'white', margin: '0 auto', boxShadow: '0 0 0 3px var(--bg), 0 0 0 4px var(--sapphire)' }}>
                  {match.opponent.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="display" style={{ fontSize: 36, marginTop: 12, lineHeight: 1 }}>{match.opponent.username}</div>
                <div className="pill" style={{ marginTop: 8, background: opponentReady ? 'var(--emerald)' : 'var(--surface-3)', color: opponentReady ? '#000' : 'var(--ink-3)' }}>
                  {opponentLeft ? 'SAIU' : opponentReady ? 'PRONTO' : 'AGUARDANDO'}
                </div>
              </div>
            </div>

            {opponentLeft && (
              <div className="panel" style={{ padding: '16px 24px', textAlign: 'center', borderColor: 'var(--crimson)' }}>
                <p style={{ fontSize: 14, color: 'var(--crimson)' }}>O oponente saiu do lobby.</p>
              </div>
            )}
          </div>

          <div style={{ position: 'relative', zIndex: 2, padding: '20px 40px', borderTop: '1px solid var(--line-1)', background: 'rgba(10,9,8,0.7)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleReady}
              disabled={ready || opponentLeft}
              className="btn btn-primary btn-lg"
              style={{ height: 56, padding: '0 48px', fontSize: 16, opacity: (ready || opponentLeft) ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {ready ? <><Check size={18} /> Pronto — aguardando oponente</> : <><Swords size={18} /> Estou pronto</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
