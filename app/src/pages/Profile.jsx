import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

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
              <h1 className="display" style={{ fontSize: 64, lineHeight: 0.95, marginTop: 4 }}>{user?.username}</h1>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{user?.email}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Pencil size={12} /> Editar
              </button>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--crimson)', borderColor: 'var(--crimson-soft)' }}>
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* stats — not available yet */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {['PARTIDAS', 'VITÓRIAS', 'WIN RATE', 'STREAK'].map(l => (
            <div key={l} className="panel" style={{ padding: 20 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>{l}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 12, letterSpacing: '0.1em' }}>não disponível</div>
            </div>
          ))}
        </div>

        {/* match history */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <header style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 className="display" style={{ fontSize: 26 }}>HISTÓRICO</h3>
          </header>
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUMA PARTIDA AINDA</div>
            <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 8 }}>
              Seu histórico de partidas aparecerá aqui quando o sistema de jogo estiver pronto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
