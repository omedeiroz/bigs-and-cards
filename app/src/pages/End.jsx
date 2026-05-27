import { useNavigate } from 'react-router-dom'

export default function End() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 201, 60, 0.08) 0%, var(--bg) 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div className="eyebrow" style={{ color: 'var(--gold)' }}>► RESULTADO DA PARTIDA</div>
        <h1 className="display" style={{ fontSize: 120, lineHeight: 0.9, marginTop: 16, color: 'var(--ink-4)', letterSpacing: '-0.03em' }}>
          EM BREVE
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-3)', marginTop: 20, lineHeight: 1.6 }}>
          A tela de resultado aparecerá aqui quando a partida for implementada — com score, MVP, rank delta e estatísticas da batalha.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 36, justifyContent: 'center' }}>
          <button onClick={() => navigate('/home')} className="btn btn-ghost btn-lg">Voltar pra home</button>
          <button onClick={() => navigate('/lobby')} className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 32px' }}>
            Ir pro lobby →
          </button>
        </div>
      </div>
    </div>
  )
}
