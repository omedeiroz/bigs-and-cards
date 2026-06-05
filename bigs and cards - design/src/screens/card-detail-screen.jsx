/* eslint-disable */
// ============================================================
// CARD DETAIL SCREEN — shows the 3 card variants on a focused page
// (the modal exists too; this screen lets the user pick variant)
// ============================================================

function CardDetailScreen({ variantIdx, goToScreen }) {
  const card = window.cardById('bigs');
  const Variant = [window.CardTypoBold, window.CardPhotoOverlay, window.CardDoubleFaced][variantIdx];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="roster" goToScreen={goToScreen} />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
        {/* LEFT — big variant showcase */}
        <div style={{
          background: `radial-gradient(ellipse at center, ${card.accent}18 0%, var(--bg) 60%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 40,
          borderRight: '1px solid var(--line-1)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 24, left: 32 }}>
            <button onClick={() => goToScreen('roster')} className="btn btn-ghost btn-sm">← Voltar pra roster</button>
          </div>
          <div className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 24 }}>► VARIANTE {variantIdx + 1} DE 3</div>
          <Variant card={card} size="lg" focus />
          <div className="mono" style={{ marginTop: 24, fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-4)' }}>
            {variantIdx === 0 && 'TIPOGRÁFICA · PLACEHOLDER DE RETRATO'}
            {variantIdx === 1 && 'FOTO REAL · STATS SOBREPOSTOS'}
            {variantIdx === 2 && '◇ DUPLA-FACE · CLIQUE PRA VIRAR ◇'}
          </div>
        </div>

        {/* RIGHT — full anatomy */}
        <div style={{ padding: '48px 40px 80px', overflowY: 'auto' }}>
          <div className="eyebrow" style={{ color: card.accent }}>[{card.code}]</div>
          <h1 className="display" style={{ fontSize: 88, marginTop: 4, lineHeight: 0.9 }}>{card.name}</h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 12, maxWidth: 460, fontStyle: 'italic' }}>"{card.bio}"</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32, padding: '20px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
            {[
              { l: 'ATAQUE', v: card.atk, c: 'var(--crimson)' },
              { l: 'DEFESA', v: card.def, c: 'var(--mint)' },
              { l: 'VIDA',   v: card.hp,  c: 'var(--sapphire)' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-4)' }}>{s.l}</div>
                <div className="display" style={{ fontSize: 72, color: s.c, lineHeight: 1, marginTop: 6, textShadow: `0 0 24px ${s.c}55` }}>{s.v}</div>
              </div>
            ))}
          </div>

          <DetailBlock icon="Zap" label="PASSIVA" accent="var(--gold)">
            {card.passive}
          </DetailBlock>
          <DetailBlock icon="Sparkles" label={`ESPECIAL · ${card.special.cost}♦`} accent="var(--purple)">
            <b style={{ color: 'var(--ink-1)' }}>{card.special.name}</b> — {card.special.desc}
          </DetailBlock>
          <DetailBlock icon="Shield" label="COUNTER" accent="var(--crimson)">
            <b style={{ color: 'var(--ink-1)' }}>{card.counter.name}</b> — {card.counter.desc}
          </DetailBlock>
          <DetailBlock icon="Users" label="DUOS" accent="var(--mint)">
            {card.duo.map((d, i) => (
              <div key={i} style={{ marginTop: i ? 6 : 0 }}>
                <b style={{ color: 'var(--ink-1)' }}>+ {d.name}</b> — {d.desc}
              </div>
            ))}
          </DetailBlock>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ icon, label, accent, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <window.Icon name={icon} size={14} color={accent} />
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: accent, fontWeight: 700 }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}55, transparent)` }} />
      </div>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS['card-detail'] = CardDetailScreen;
