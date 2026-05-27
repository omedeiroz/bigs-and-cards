import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { CardTypoBold } from '../components/Card'
import { CARDS } from '../data/cards'

export default function Roster() {
  const [filter, setFilter] = useState('todas')
  const [sort, setSort] = useState('custo')

  const filtered = CARDS.filter(c => filter === 'todas' || c.rarity === filter)
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'custo') return a.cost - b.cost
    if (sort === 'atk') return b.atk - a.atk
    if (sort === 'nome') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div className="eyebrow">ROSTER · {CARDS.length} CARTAS</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>
              A GALERA <span style={{ color: 'var(--gold)' }}>INTEIRA</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 6 }}>Conhece quem você tem na mão. Clica numa carta pra ver tudo.</p>
          </div>
        </header>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--line-1)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['todas', 'comum', 'raro', 'épico'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={'pill ' + (filter === f ? 'pill-gold' : 'pill-ghost')} style={{ height: 30, fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>ORDENAR:</span>
          <select className="input" style={{ width: 160, height: 32, fontSize: 12 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="custo">Custo (asc)</option>
            <option value="atk">Ataque (desc)</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, justifyItems: 'center' }}>
          {sorted.map(c => (
            <CardTypoBold key={c.id} card={c} size="md" />
          ))}
        </div>
      </div>
    </div>
  )
}
