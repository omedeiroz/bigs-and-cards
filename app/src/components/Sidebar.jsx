import { useNavigate, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, Users, Swords, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ICONS = { Home, LayoutGrid, Users, Swords, User }

const items = [
  { id: '/home',       label: 'Início',    icon: 'Home' },
  { id: '/roster',     label: 'Cartas',    icon: 'LayoutGrid' },
  { id: '/friends',    label: 'Amigos',    icon: 'Users' },
  { id: '/challenges', label: 'Desafios',  icon: 'Swords' },
  { id: '/profile',    label: 'Perfil',    icon: 'User' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <aside style={{
      width: 240, padding: '24px 16px',
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--line-1)',
      display: 'flex', flexDirection: 'column',
      gap: 8,
      minHeight: '100vh',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 20px', borderBottom: '1px solid var(--line-1)', marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, background: 'var(--gold)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-on-gold)' }}>B</div>
        <div>
          <div className="display" style={{ fontSize: 16, lineHeight: 1 }}>BIGS & CARDS</div>
          <div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>BETA</div>
        </div>
      </div>

      {items.map(it => {
        const Icon = ICONS[it.icon]
        const active = pathname === it.id || (it.id === '/home' && pathname === '/')
        return (
          <button key={it.id} onClick={() => navigate(it.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px',
            borderRadius: 8,
            background: active ? 'var(--gold-soft)' : 'transparent',
            color: active ? 'var(--gold)' : 'var(--ink-2)',
            fontSize: 14, fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--dur-fast)',
            position: 'relative',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2)' }}
          onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge && (
              <span style={{ background: 'var(--crimson)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, fontFamily: 'var(--font-mono)' }}>{it.badge}</span>
            )}
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      <div className="panel-2" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold) 0%, var(--crimson) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)', fontSize: 16 }}>
          {user?.username?.[0]?.toUpperCase() || 'V'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{user?.username || 'voce'}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>{user?.email}</div>
        </div>
      </div>
    </aside>
  )
}
