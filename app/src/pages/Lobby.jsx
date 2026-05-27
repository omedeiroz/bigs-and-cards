import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Lobby() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 201, 60, 0.08) 0%, var(--bg) 70%)' }} />

      <header style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-1)', background: 'rgba(10,9,8,0.6)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate('/home')} className="btn btn-ghost btn-sm">← Sair</button>
        <div className="eyebrow">LOBBY</div>
        <div style={{ width: 80 }} />
      </header>

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 32 }}>
        <div className="eyebrow" style={{ color: 'var(--gold)' }}>► SUA SESSÃO</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
          {/* me */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 40, color: 'var(--ink-on-gold)', margin: '0 auto', boxShadow: '0 0 0 3px var(--bg), 0 0 0 4px var(--gold)' }}>
              {user?.username?.[0]?.toUpperCase() || 'V'}
            </div>
            <div className="display" style={{ fontSize: 36, marginTop: 12, lineHeight: 1 }}>{user?.username}</div>
            <div className="pill pill-gold" style={{ marginTop: 8 }}>VOCÊ</div>
          </div>

          <div className="display" style={{ fontSize: 120, color: 'var(--ink-3)', lineHeight: 0.8, letterSpacing: '-0.04em' }}>VS</div>

          {/* opponent */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface-3)', border: '2px dashed var(--line-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', textAlign: 'center' }}>AGUARD.<br/>OPONENTE</div>
            </div>
            <div className="display" style={{ fontSize: 36, marginTop: 12, lineHeight: 1, color: 'var(--ink-4)' }}>???</div>
            <div className="pill pill-ghost" style={{ marginTop: 8 }}>AGUARDANDO</div>
          </div>
        </div>

        <div className="panel" style={{ padding: '20px 32px', textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginBottom: 8 }}>SISTEMA DE MATCHMAKING</div>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            O matchmaking via WebSocket está em desenvolvimento. Por enquanto, o fluxo de partida é apenas visual.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '20px 40px', borderTop: '1px solid var(--line-1)', background: 'rgba(10,9,8,0.7)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => navigate('/match')} className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 48px', fontSize: 16 }}>
          Entrar na partida (demo) →
        </button>
      </div>
    </div>
  )
}
