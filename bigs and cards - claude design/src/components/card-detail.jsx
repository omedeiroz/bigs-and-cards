/* eslint-disable */
// ============================================================
// Card Detail Modal — full card with passive, counter, duo, special
// Opened from anywhere via openCardDetail(card)
// ============================================================

function CardDetailModal({ card, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(5, 3, 2, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="panel" style={{
        width: '100%', maxWidth: 980,
        padding: 0,
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-lg)',
        display: 'grid', gridTemplateColumns: '320px 1fr',
        overflow: 'hidden',
      }}>
        {/* LEFT — card */}
        <div style={{
          padding: 32,
          background: `linear-gradient(180deg, ${card.accent}11 0%, var(--bg-2) 100%)`,
          borderRight: '1px solid var(--line-2)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <window.CardTypoBold card={card} size="md" focus />
          <div style={{ marginTop: 20, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="pill pill-purple">CUSTO {card.cost}</span>
            <span className="pill pill-gold">{card.rarity.toUpperCase()}</span>
          </div>
        </div>

        {/* RIGHT — info */}
        <div style={{ padding: 32, overflowY: 'auto', maxHeight: '85vh' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div className="eyebrow" style={{ color: card.accent }}>[{card.code}] · {card.tagline.toUpperCase()}</div>
              <h2 className="display" style={{ fontSize: 56, marginTop: 4, lineHeight: 0.95 }}>{card.name}</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, fontStyle: 'italic' }}>"{card.bio}"</p>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }}>×</button>
          </header>

          {/* stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '16px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
            {[
              { l: 'ATAQUE',  v: card.atk, c: 'var(--crimson)' },
              { l: 'DEFESA',  v: card.def, c: 'var(--mint)' },
              { l: 'VIDA',    v: card.hp,  c: 'var(--sapphire)' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>{s.l}</div>
                <div className="display" style={{ fontSize: 56, color: s.c, lineHeight: 1, marginTop: 4, textShadow: `0 0 24px ${s.c}55` }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* sections */}
          <Section icon="Zap" label="PASSIVA" accent="var(--gold)">
            <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{card.passive}</p>
          </Section>

          <Section icon="Sparkles" label="ESPECIAL" accent="var(--purple)">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{card.special.name}</span>
              <span className="pill pill-purple">{card.special.cost} elixir</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{card.special.desc}</p>
          </Section>

          <Section icon="Shield" label="COUNTER" accent="var(--crimson)">
            <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              <span style={{ fontWeight: 700, color: 'var(--ink-1)' }}>{card.counter.name}</span> — {card.counter.desc}
            </p>
          </Section>

          <Section icon="Users" label="DUOS" accent="var(--mint)">
            {card.duo.map((d, i) => (
              <p key={i} style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: i ? 6 : 0 }}>
                <span style={{ fontWeight: 700, color: 'var(--ink-1)' }}>+ {d.name}</span> — {d.desc}
              </p>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, label, accent, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <window.Icon name={icon} size={14} color={accent} />
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: accent, fontWeight: 700 }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}55, transparent)` }} />
      </div>
      {children}
    </div>
  );
}

window.CardDetailModal = CardDetailModal;
