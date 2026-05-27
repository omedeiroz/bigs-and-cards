import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function Friends() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ marginBottom: 24 }}>
          <div className="eyebrow">PARCEIROS DE LAVADA</div>
          <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>QUEM TÁ NA <span style={{ color: 'var(--gold)' }}>ÁREA</span></h1>
        </header>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={14} /> Adicionar amigo
          </button>
        </div>

        <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)' }}>
          <div className="display" style={{ fontSize: 48, color: 'var(--ink-4)' }}>:(</div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)', marginTop: 16 }}>LISTA DE AMIGOS NÃO DISPONÍVEL AINDA</div>
          <p style={{ fontSize: 14, color: 'var(--ink-4)', marginTop: 8, maxWidth: 360, margin: '8px auto 0' }}>
            O sistema de amigos está em desenvolvimento. Em breve você poderá adicionar e desafiar a galera.
          </p>
        </div>
      </div>
    </div>
  )
}
