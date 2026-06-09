// ============================================================
// RankBadge — pill com troféu + label do tier
// Drop-in: app/src/components/RankBadge.jsx
// (Home.jsx já tem uma cópia inline desta lógica — opcional substituir
//  pelo import deste componente. As cores são as mesmas.)
// ============================================================
import { Trophy } from 'lucide-react'

export const TIER_COLORS = {
  'Dev do Itaú':     { bg: '#1a2a1a', border: '#3a5a3a', text: '#6a9a6a' },
  'Arame Farpado':   { bg: '#2a1a1a', border: '#6a3a3a', text: '#cc7777' },
  'Buzz do Outback': { bg: '#2a2a1a', border: '#7a6a2a', text: '#ccaa44' },
  'Consultor HCM':   { bg: '#1a1a2a', border: '#3a4a7a', text: '#6688cc' },
  'New Hadez':       { bg: '#2a1a2a', border: '#6a3a8a', text: '#bb77ee' },
  'Big Fanfas':      { bg: '#2a2000', border: '#cc9900', text: '#ffc93c' },
}

export default function RankBadge({ rank, size = 'md' }) {
  if (!rank) return null
  const c = TIER_COLORS[rank.tier] || TIER_COLORS['Dev do Itaú']
  const isSm = size === 'sm'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: isSm ? 4 : 6,
      padding: isSm ? '3px 8px' : '5px 12px',
      borderRadius: 6, border: `1px solid ${c.border}`, background: c.bg,
    }}>
      <Trophy size={isSm ? 10 : 13} style={{ color: c.text, flexShrink: 0 }} />
      <span className="mono" style={{ fontSize: isSm ? 9 : 11, letterSpacing: '0.12em', color: c.text }}>
        {rank.label}
      </span>
    </div>
  )
}
