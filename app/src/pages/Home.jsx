import { useNavigate } from 'react-router-dom'
import { Bell, Swords } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div className="eyebrow">BEM-VINDO DE VOLTA</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 8, lineHeight: 1 }}>E aí, <span style={{ color: 'var(--gold)' }}>{user?.username}</span></h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/challenges')} className="btn btn-ghost">
              <Bell size={14} /> Desafios
            </button>
            <button onClick={() => navigate('/lobby')} className="btn btn-primary btn-lg">
              <Swords size={16} /> Jogar agora
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { l: 'VITÓRIAS', color: 'var(--emerald)' },
                { l: 'DERROTAS', color: 'var(--crimson)' },
                { l: 'WIN %',    color: 'var(--gold)' },
                { l: 'LEVEL',    color: 'var(--sapphire)' },
              ].map(s => (
                <div key={s.l} className="panel-2" style={{ padding: 16 }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>{s.l}</div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 10, letterSpacing: '0.1em' }}>em breve</div>
                </div>
              ))}
            </div>

            {/* quick play */}
            <div className="panel" style={{ padding: 28, background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -40, top: -40, opacity: 0.08 }}>
                <div className="display" style={{ fontSize: 200, color: 'var(--gold)' }}>BIG</div>
              </div>
              <div style={{ position: 'relative' }}>
                <div className="eyebrow" style={{ color: 'var(--gold)' }}>► RANQUEADA</div>
                <h2 className="display" style={{ fontSize: 44, marginTop: 8, lineHeight: 1 }}>QUER A LAVADA?</h2>
                <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>
                  Matchmaking em desenvolvimento. Em breve disponível.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button onClick={() => navigate('/lobby')} className="btn btn-primary btn-lg">Jogar ranqueada</button>
                  <button onClick={() => navigate('/friends')} className="btn btn-ghost">Convidar amigo</button>
                </div>
              </div>
            </div>

            {/* recent matches */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 22 }}>ÚLTIMAS PARTIDAS</h3>
              </div>
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUMA PARTIDA AINDA</div>
                <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 8 }}>Suas partidas vão aparecer aqui.</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* online friends */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 22 }}>NA ÁREA</h3>
                <button onClick={() => navigate('/friends')} className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>VER AMIGOS →</button>
              </div>
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NINGUÉM ONLINE</div>
                <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 8 }}>Adicione amigos pra ver quem tá na área.</p>
              </div>
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
