import Sidebar from '../components/Sidebar'

export default function Challenges() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ marginBottom: 28 }}>
          <div className="eyebrow">BATALHAS PENDENTES</div>
          <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>QUEM <span style={{ color: 'var(--crimson)' }}>CHAMOU</span> VOCÊ</h1>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 6 }}>Aceita, recusa ou ignora. Tem 24h pra decidir.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 0, minHeight: 400 }}>
          <div style={{ borderRight: '1px solid var(--line-1)', padding: '24px 0' }}>
            <div className="mono" style={{ padding: '0 24px 16px', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', borderBottom: '1px solid var(--line-1)' }}>► RECEBIDOS</div>
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>NENHUM DESAFIO RECEBIDO</div>
            </div>

            <div className="mono" style={{ padding: '12px 24px 16px', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)' }}>► ENVIADOS</div>
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>NENHUM DESAFIO ENVIADO</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <div className="display" style={{ fontSize: 56, color: 'var(--ink-4)', lineHeight: 1 }}>VS</div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)', marginTop: 16 }}>SISTEMA DE DESAFIOS EM DESENVOLVIMENTO</div>
              <p style={{ fontSize: 14, color: 'var(--ink-4)', marginTop: 8 }}>
                Em breve você poderá desafiar amigos diretamente pelo app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
