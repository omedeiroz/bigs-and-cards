import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

export default function Match() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0d05 0%, #0a0908 100%)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10, 9, 8, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line-1)',
      }}>
        <button onClick={() => navigate('/home')} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={12} /> Sair
        </button>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-3)' }}>PARTIDA</div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 24 }}>
        <div className="display" style={{ fontSize: 120, color: 'rgba(255, 201, 60, 0.1)', lineHeight: 0.8, letterSpacing: '-0.04em' }}>BGS</div>

        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>► EM DESENVOLVIMENTO</div>
          <h1 className="display" style={{ fontSize: 64, marginTop: 12, lineHeight: 0.95 }}>PARTIDA<br />EM BREVE</h1>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 16, lineHeight: 1.6 }}>
            O motor de jogo está sendo construído. As mecânicas de carta, elixir, tabuleiro e minigames serão implementadas com WebSocket em tempo real.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={() => navigate('/home')} className="btn btn-ghost btn-lg">Voltar pra home</button>
          <button onClick={() => navigate('/end')} className="btn btn-primary btn-lg">
            Ver tela de resultado →
          </button>
        </div>
      </div>
    </div>
  )
}
